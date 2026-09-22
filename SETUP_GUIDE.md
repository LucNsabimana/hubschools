# BCHS Pulse — Setup Guide

## How it works

All data lives in one private Google Sheet (`BCHS Pulse Data`). No data is stored in the code.

```
Browser  ──Google Sign-In──▶  Netlify Function (netlify/functions/data.mjs)  ──service account──▶  Google Sheet
```

1. A person signs in with Google. The browser gets a short-lived ID token (valid about 1 hour).
2. The browser sends that token to the Netlify Function. The function checks the token with Google, then looks up the email in the sheet's **Users** tab.
3. The function reads the sheet with a service account and returns the data:
   - `system_leader` and `admin`: every school.
   - `coordinator`: only rows for their own `SchoolId`.
   - Not in Users: nothing (access denied).
4. When a system leader or admin saves an edit on the School Overview page, the function writes it back to the sheet.

The sheet is never shared publicly and app users don't need access to it. Adding someone's email to the Users tab is what gives them access to the app.

To update data, edit the sheet and refresh the app. No code change or redeploy is needed. The sheet's README tab explains each tab and column.

---

## One-time setup

### 1. Put the data in Google Drive
1. Upload `BCHS Pulse Data.xlsx` to Google Drive, open it, and choose **File > Save as Google Sheets**.
2. Leave sharing set to **Restricted**.
3. In the **Users** tab, add a row for yourself: `your email | system_leader | all | All Schools`.
4. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/THIS_PART/edit`.

### 2. Create a service account (lets the server read the sheet)
In the same Google Cloud project that holds your OAuth client:
1. **APIs & Services > Library**: make sure **Google Sheets API** is enabled.
2. **IAM & Admin > Service Accounts > Create service account**. Name it `pulse-data`. It doesn't need any project roles, so skip that step.
3. Open the new service account and go to **Keys > Add key > Create new key > JSON**. A `.json` file downloads. Treat it like a password.
4. Back in the Google Sheet: **Share**, paste the service account's email (`pulse-data@<project>.iam.gserviceaccount.com`), set it to **Editor**, and untick "Notify".

   If your Google Workspace blocks creating service account keys, ask IT for an exception for this one account.

### 3. Set Netlify environment variables
Netlify: **Site configuration > Environment variables**. Add:

| Variable | Value |
|---|---|
| `REACT_APP_GOOGLE_CLIENT_ID` | OAuth Client ID (already set) |
| `SHEET_ID` | Sheet ID from step 1 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON key |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | `private_key` from the JSON key, pasted exactly as it appears between the quotes, including the `\n` sequences |

Delete the old `REACT_APP_SHEETS_API_KEY` and `REACT_APP_SHEET_ID` variables. They're no longer used, and anything starting with `REACT_APP_` is visible to browsers. You can also delete that API key in Google Cloud.

Then go to **Deploys > Trigger deploy > Deploy site**.

### 4. OAuth client (existing)
Nothing changes here. The app still uses plain "Sign in with Google" with no extra permission scopes, so no Google verification review is needed. Your Netlify URL must be listed under **Authorized JavaScript origins**.

### 5. Test
1. Open the site and sign in. You should see all schools.
2. Add a coordinator row to Users, for example `someone@bostonpublicschools.org | coordinator | mather | Mather Elementary`. Sign in as them and confirm you see only Mather.
3. Change a number in the Metrics tab, refresh the app, and confirm the change shows up.

---

## Everyday tasks

**Update numbers:** edit the Metrics, DetailMetrics, Partners, KPIs, or other tabs, then refresh the app.

**Add a person:** add a row to Users. Roles: `coordinator`, `system_leader`, `admin`.

**Add a school:** add a row to Schools (new `SchoolId`), then add its rows to Metrics (one per year) and to any other tabs. Coordinators use the same `SchoolId` in Users.

**Roll to a new school year:** add the year (e.g. `SY26-27`) at the bottom of Years and add Metrics rows for it. The app always shows the last three years in Years.

**Data as of date:** Settings tab, `DataAsOf`.

---

## Local development

```bash
npm install
npm install -g netlify-cli
cp .env.example .env   # fill in the values
netlify dev            # runs the app and the data function at http://localhost:8888
```

`npm start` alone won't load data, because the data function only runs under `netlify dev` or on Netlify. Add `http://localhost:8888` to the OAuth client's Authorized JavaScript origins.

---

## Troubleshooting

| Message | Fix |
|---|---|
| "No access found for …" | Add that email to the Users tab. |
| "Your sign-in expired" | Google sign-ins last about an hour. Sign in again. |
| "Server is missing the … setting" | Add that Netlify environment variable and redeploy. |
| "The server cannot open the spreadsheet" | Check `SHEET_ID`, and share the sheet with the service account email. |
| "The spreadsheet is missing these tabs" | A required tab was renamed or deleted. Restore its exact name. |
| Other errors | Netlify > Logs > Functions > `data`. Setting `DEBUG_AUTH=1` logs why a sign-in token was rejected. |

---

## What still saves only in the browser
Edits on the KPI Tracker, Partner Quality, and Self-Assessment pages still live only in the open browser tab, as before. To make them permanent, edit the sheet. School Overview edits (info, AOA team, leadership teams, QSP goals) are saved to the sheet.
