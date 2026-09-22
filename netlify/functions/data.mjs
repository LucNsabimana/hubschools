// BCHS Pulse data API (Netlify Function)
//
// The Google Sheet is private: it is shared only with a service account (and
// the people who maintain it). Browsers never talk to the sheet directly.
//
//   GET  /.netlify/functions/data  -> { me, tabs }  every tab the caller may see
//   POST /.netlify/functions/data  -> save an edit   (system_leader / admin only)
//
// Every request must carry the Google Sign-In ID token of the viewer:
//   Authorization: Bearer <id token>
// The token is verified, then the viewer's email is looked up in the Users tab.

import { OAuth2Client, JWT } from 'google-auth-library';

const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets';

// Tabs the app reads. A missing optional tab is treated as empty.
export const TABS = [
  'Users', 'Settings', 'Years', 'Schools', 'Metrics', 'DetailMetrics', 'QSPGoals', 'AOATeam',
  'LeadershipTeams', 'SelfAssessment', 'Partners', 'InKind', 'Grants', 'KPIs',
];
const OPTIONAL_TABS = new Set(['Settings', 'LeadershipTeams', 'InKind', 'Grants', 'DetailMetrics', 'QSPGoals']);
const EDITOR_ROLES = new Set(['system_leader', 'admin']);
const ALL_SCHOOL_ROLES = new Set(['system_leader', 'admin']);

// ---------- helpers ----------

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// Turn [[header...], [row...], ...] into [{header: value}, ...]. Blank rows are dropped.
export function rowsToObjects(values = []) {
  const [header = [], ...rows] = values;
  const keys = header.map(h => String(h ?? '').trim());
  return rows
    .filter(r => r.some(v => v !== '' && v !== null && v !== undefined))
    .map(r => {
      const o = {};
      keys.forEach((k, i) => { if (k) o[k] = r[i] === undefined ? '' : r[i]; });
      return o;
    });
}

// Filter everything down to what this viewer may see.
export function scopeTabs(tabs, me) {
  const out = { ...tabs };
  delete out.Users; // never send the access list to the browser
  if (ALL_SCHOOL_ROLES.has(me.role)) return out;
  const own = String(me.schoolId || '').toLowerCase();
  for (const [name, rows] of Object.entries(out)) {
    if (rows.length && Object.prototype.hasOwnProperty.call(rows[0], 'SchoolId')) {
      out[name] = rows.filter(r => String(r.SchoolId).toLowerCase() === own);
    }
  }
  return out;
}

export function findUser(users, email) {
  const e = String(email || '').toLowerCase().trim();
  const u = users.find(r => String(r.Email || '').toLowerCase().trim() === e);
  if (!u) return null;
  return {
    email: e,
    role: String(u.Role || '').trim(),
    schoolId: String(u.SchoolId || '').trim(),
    schoolName: String(u.SchoolName || '').trim(),
  };
}

// ---------- Google plumbing ----------

function getConfig() {
  const need = ['SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_KEY'];
  for (const k of need) if (!process.env[k]) throw new HttpError(500, `Server is missing the ${k} setting.`);
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(500, 'Server is missing the GOOGLE_CLIENT_ID setting.');
  return {
    sheetId: process.env.SHEET_ID,
    clientId,
    saEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Netlify stores multi-line values with literal \n; turn them back into newlines.
    saKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
  };
}

let jwtClient = null;
async function sheetsToken(cfg) {
  if (!jwtClient) {
    jwtClient = new JWT({
      email: cfg.saEmail, key: cfg.saKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  const { token } = await jwtClient.getAccessToken();
  return token;
}

async function verifyViewer(req, cfg) {
  const auth = req.headers.get('authorization') || '';
  const idToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!idToken) throw new HttpError(401, 'Please sign in.');
  try {
    const ticket = await new OAuth2Client(cfg.clientId).verifyIdToken({ idToken, audience: cfg.clientId });
    const p = ticket.getPayload();
    if (!p?.email || p.email_verified === false) throw new Error('no email');
    return { email: p.email, name: p.name, picture: p.picture };
  } catch (e) {
    if (process.env.DEBUG_AUTH) console.error('verify failed:', e.message);
    throw new HttpError(401, 'Your sign-in expired. Please sign in again.');
  }
}

async function gfetch(cfg, path, init = {}) {
  const token = await sheetsToken(cfg);
  const res = await fetch(`${SHEETS}/${cfg.sheetId}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Sheets API error', res.status, text);
    if (res.status === 403 || res.status === 404) {
      throw new HttpError(502, 'The server cannot open the spreadsheet. Check SHEET_ID and that the sheet is shared with the service account.');
    }
    throw new HttpError(502, `Google Sheets error (${res.status}).`);
  }
  return res.json();
}

async function listTabTitles(cfg) {
  const meta = await gfetch(cfg, '?fields=sheets.properties.title');
  return new Set(meta.sheets.map(s => s.properties.title));
}

async function readTabs(cfg, names) {
  const present = await listTabTitles(cfg);
  const missing = names.filter(n => !present.has(n) && !OPTIONAL_TABS.has(n));
  if (missing.length) throw new HttpError(500, `The spreadsheet is missing these tabs: ${missing.join(', ')}`);
  const wanted = names.filter(n => present.has(n));
  const qs = wanted.map(n => `ranges=${encodeURIComponent(`'${n}'`)}`).join('&');
  const data = await gfetch(cfg, `/values:batchGet?${qs}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`);
  const tabs = Object.fromEntries(names.map(n => [n, []]));
  data.valueRanges.forEach((vr, i) => { tabs[wanted[i]] = rowsToObjects(vr.values); });
  return tabs;
}

async function readRaw(cfg, tab) {
  const data = await gfetch(cfg, `/values/${encodeURIComponent(`'${tab}'`)}?valueRenderOption=UNFORMATTED_VALUE`);
  return data.values || [];
}

// Overwrite a tab from A1. Rows past the new end (up to minRows) are blanked,
// so shrinking a list never leaves stale rows behind. Formatting is kept.
async function writeRaw(cfg, tab, values, minRows = 0) {
  const width = Math.max(1, ...values.map(r => r.length));
  const padded = values.map(r => Array.from({ length: width }, (_, i) => (r[i] ?? '')));
  while (padded.length < minRows) padded.push(Array(width).fill(''));
  if (!padded.length) return;
  await gfetch(cfg, `/values/${encodeURIComponent(`'${tab}'!A1`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ majorDimension: 'ROWS', values: padded }),
  });
}

// Replace every row for one school in a tab with new rows (objects keyed by header).
// Other schools' rows, the header, extra columns and row order are preserved.
export function replaceSchoolRowsInValues(values, schoolId, newRows) {
  const [header = [], ...rows] = values;
  const keys = header.map(h => String(h ?? '').trim());
  const idCol = keys.indexOf('SchoolId');
  if (idCol < 0) throw new HttpError(500, 'Tab has no SchoolId column.');
  const width = keys.length;
  const pad = r => Array.from({ length: width }, (_, i) => (r[i] === undefined || r[i] === null ? '' : r[i]));
  const toRow = o => keys.map(k => (k === 'SchoolId' ? schoolId : (o[k] ?? '')));
  const firstIdx = rows.findIndex(r => r[idCol] === schoolId);
  const kept = rows.filter(r => r[idCol] !== schoolId).map(pad);
  const insertAt = firstIdx < 0 ? kept.length : rows.slice(0, firstIdx).filter(r => r[idCol] !== schoolId).length;
  kept.splice(insertAt, 0, ...newRows.map(toRow));
  return [header, ...kept];
}

async function replaceSchoolRows(cfg, tab, schoolId, newRows) {
  const values = await readRaw(cfg, tab);
  if (!values.length) throw new HttpError(500, `The ${tab} tab has no header row.`);
  await writeRaw(cfg, tab, replaceSchoolRowsInValues(values, schoolId, newRows), values.length);
}

async function ensureTab(cfg, tab, header) {
  const present = await listTabTitles(cfg);
  if (present.has(tab)) return;
  await gfetch(cfg, ':batchUpdate', {
    method: 'POST', body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
  });
  await writeRaw(cfg, tab, [header]);
}

// ---------- saves ----------

const SCHOOL_FIELDS = ['FullName', 'Grades', 'Address', 'LeadPartner', 'Coordinator', 'SchoolLeader', 'Types'];

async function saveOverview(cfg, body) {
  const { schoolId, overview: o } = body;
  if (!schoolId || !o) throw new HttpError(400, 'schoolId and overview are required.');

  // Schools: update that school's row in place.
  const values = await readRaw(cfg, 'Schools');
  const keys = (values[0] || []).map(h => String(h).trim());
  const idCol = keys.indexOf('SchoolId');
  const rowIdx = values.findIndex((r, i) => i > 0 && r[idCol] === schoolId);
  if (rowIdx < 0) throw new HttpError(404, `School ${schoolId} is not in the Schools tab.`);
  const patch = {
    FullName: o.name, Grades: o.grades, Address: o.address, LeadPartner: o.leadPartner,
    Coordinator: o.coordinator, SchoolLeader: o.schoolLeader,
    Types: Array.isArray(o.types) ? o.types.join('; ') : o.types,
  };
  const fields = [...SCHOOL_FIELDS];
  if (!keys.includes('FullName')) { patch.Name = patch.FullName; fields.push('Name'); }
  const row = keys.map((k, i) => (fields.includes(k) && patch[k] !== undefined ? patch[k] : (values[rowIdx][i] ?? '')));
  const values2 = values.map((r, i) => (i === rowIdx ? row : r));
  await writeRaw(cfg, 'Schools', values2.map(r => keys.map((_, i) => r[i] ?? '')), values.length);

  if (Array.isArray(o.aoa_team)) {
    await replaceSchoolRows(cfg, 'AOATeam', schoolId, o.aoa_team.map(m => ({
      First: m.first, Last: m.last, Role: m.role, Email: m.email, Pronouns: m.pronouns,
    })));
  }
  if (Array.isArray(o.qspGoals)) {
    await ensureTab(cfg, 'QSPGoals', ['SchoolId', 'Goal']);
    await replaceSchoolRows(cfg, 'QSPGoals', schoolId, o.qspGoals.map(g => ({ Goal: g })));
  }
  if (Array.isArray(o.teams)) {
    await ensureTab(cfg, 'LeadershipTeams', ['SchoolId', 'Team', 'Active']);
    await replaceSchoolRows(cfg, 'LeadershipTeams', schoolId, o.teams.map(t => ({ Team: t.name, Active: !!t.active })));
  }
}

// ---------- handler ----------

export default async function handler(req) {
  try {
    const cfg = getConfig();
    const viewer = await verifyViewer(req, cfg);

    if (req.method === 'GET') {
      const tabs = await readTabs(cfg, TABS);
      const me = findUser(tabs.Users, viewer.email);
      if (!me) throw new HttpError(403, `No access found for ${viewer.email}. Ask your system administrator to add you to the Users tab.`);
      return json(200, { me: { ...me, name: viewer.name, picture: viewer.picture }, tabs: scopeTabs(tabs, me) });
    }

    if (req.method === 'POST') {
      const users = (await readTabs(cfg, ['Users'])).Users;
      const me = findUser(users, viewer.email);
      if (!me) throw new HttpError(403, 'No access.');
      if (!EDITOR_ROLES.has(me.role)) throw new HttpError(403, 'Only system leaders and admins can save changes.');
      const body = await req.json().catch(() => ({}));
      if (body.action === 'saveOverview') await saveOverview(cfg, body);
      else throw new HttpError(400, 'Unknown action.');
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed.' });
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    return json(e.status || 500, { error: e instanceof HttpError ? e.message : 'Server error.' });
  }
}

