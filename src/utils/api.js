// Talks to the Netlify Function (netlify/functions/data.mjs), which reads and writes the private
// Google Sheet with a service account. The browser only ever sends the viewer's
// Google Sign-In ID token; it never gets direct access to the spreadsheet.

export class AuthError extends Error {}

async function call(credential, init = {}) {
  const res = await fetch('/.netlify/functions/data', {
    ...init,
    headers: {
      Authorization: `Bearer ${credential}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON error page */ }
  if (res.status === 401) throw new AuthError(body.error || 'Your sign-in expired. Please sign in again.');
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
  return body;
}

// -> { me: { email, name, picture, role, schoolId, schoolName }, tabs: { TabName: [rowObjects] } }
export function fetchAll(credential) {
  return call(credential);
}

export function saveOverview(credential, schoolId, overview) {
  return call(credential, { method: 'POST', body: JSON.stringify({ action: 'saveOverview', schoolId, overview }) });
}
