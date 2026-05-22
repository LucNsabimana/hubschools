// Google Sheets API integration
// Reads from and writes to a master Google Sheet

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_SHEETS_API_KEY;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Read a range from the sheet (public read, API key only)
export async function readSheet(range) {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
  const data = await res.json();
  return data.values || [];
}

// Write to the sheet (requires OAuth access token)
export async function writeSheet(range, values, accessToken) {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });
  if (!res.ok) throw new Error(`Sheets write failed: ${res.status}`);
  return res.json();
}

// Append rows to the sheet
export async function appendSheet(range, values, accessToken) {
  const url = `${BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });
  if (!res.ok) throw new Error(`Sheets append failed: ${res.status}`);
  return res.json();
}

// Fetch user role from Users tab
// Expected sheet columns: Email | Role | SchoolId | SchoolName
export async function getUserRole(email) {
  try {
    const rows = await readSheet('Users!A:D');
    const match = rows.find(r => r[0] && r[0].toLowerCase() === email.toLowerCase());
    if (!match) return null;
    return { email: match[0], role: match[1], schoolId: match[2], schoolName: match[3] };
  } catch {
    return null;
  }
}

// Fetch KPIs for a school from the KPIs tab
// Expected columns: SchoolId | KpiId | Intervention | GoalDate | Midpoint | Status | PctComplete | Endline | UpdatedAt
export async function fetchKPIs(schoolId) {
  try {
    const rows = await readSheet('KPIs!A:I');
    return rows.filter(r => r[0] === schoolId).map(r => ({
      schoolId: r[0], id: r[1], intervention: r[2], goalDate: r[3],
      midpoint: r[4], status: r[5], pct: parseFloat(r[6]) || 0,
      endline: r[7], updatedAt: r[8],
    }));
  } catch { return []; }
}

// Save a KPI update
export async function saveKPIUpdate(kpi, accessToken) {
  const row = [[kpi.schoolId, kpi.id, kpi.intervention, kpi.goalDate,
    kpi.midpoint, kpi.status, kpi.pct, kpi.endline,
    new Date().toISOString()]];
  return appendSheet('KPIUpdates!A:I', row, accessToken);
}

// Fetch data entries for a school
export async function fetchDataEntries(schoolId) {
  try {
    const rows = await readSheet('DataEntries!A:Z');
    return rows.filter(r => r[0] === schoolId);
  } catch { return []; }
}
