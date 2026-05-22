# BCHS AOA Platform — Setup Guide

This is a complete step-by-step guide. You need to do this once.
Total estimated time: ~45 minutes.

---

## STEP 1: Create a GitHub account (if you don't have one)
1. Go to https://github.com and create a free account.
2. Create a new repository called `bchs-aoa-platform` (set to Private).
3. Upload all files from this folder into that repository.

---

## STEP 2: Set up Google Cloud (for login + Sheets access)

### 2a. Create a Google Cloud project
1. Go to https://console.cloud.google.com
2. Click "New Project" → name it `BCHS AOA Platform` → Create.
3. Wait for it to create (takes ~30 seconds).

### 2b. Enable the Google Sheets API
1. In the left menu: APIs & Services → Library.
2. Search "Google Sheets API" → click it → Enable.

### 2c. Create your OAuth credentials (for Google Login)
1. APIs & Services → Credentials → Create Credentials → OAuth Client ID.
2. If prompted to configure consent screen:
   - Click "Configure Consent Screen" → External → Create.
   - App name: `BCHS AOA Platform`
   - User support email: your email
   - Developer contact: your email
   - Save and Continue (skip the rest, just click through).
3. Back to Credentials → Create Credentials → OAuth Client ID.
4. Application type: Web application.
5. Name: `BCHS AOA Web Client`.
6. Authorized JavaScript origins:
   - Add: `http://localhost:3000` (for local testing)
   - Add: `https://YOUR-APP-NAME.netlify.app` (you'll fill this in after Step 4)
7. Click Create → COPY the Client ID (looks like: `1234567890-abc123.apps.googleusercontent.com`)

### 2d. Create an API Key (for reading Google Sheets)
1. APIs & Services → Credentials → Create Credentials → API Key.
2. COPY the API key.
3. Click "Edit API Key" → restrict it to "Google Sheets API" only (for security).

---

## STEP 3: Set up your Google Sheet (the database)

### 3a. Create the master sheet
1. Go to https://sheets.google.com → create a new spreadsheet.
2. Name it: `BCHS AOA Platform — Database`
3. COPY the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit`

### 3b. Create these tabs (sheets) inside the spreadsheet:
Create each tab with exactly these names and column headers:

**Tab: Users**
| Email | Role | SchoolId | SchoolName |
|-------|------|----------|------------|
| lric@ymcaboston.org | system_leader | all | All Schools |
| lthames@bostonpublicschools.org | coordinator | mather | Mather Elementary |
| (add each coordinator's email, role, and school) |

Roles available: `coordinator`, `system_leader`, `admin`

**Tab: KPIs**
| SchoolId | KpiId | Intervention | GoalDate | Midpoint | Status | PctComplete | Endline | UpdatedAt |

(Leave empty for now — the app will write to this when coordinators save KPI updates)

**Tab: KPIUpdates**
Same columns as KPIs. This is the append-only log of every save action.

**Tab: DataEntries**
| SchoolId | SY | MetricName | Value | UpdatedBy | UpdatedAt |

(Leave empty — for future use when coordinators enter real-time data)

### 3c. Share the sheet with your Google account
The sheet needs to be accessible. Two options:
- **Option A (easiest for launch):** Share → Anyone with the link → Viewer.
  This lets the app read without auth. Coordinators still need to log in to write.
- **Option B (more secure):** Keep private, add a Service Account.
  Ask your IT team about this when you're ready to scale.

---

## STEP 4: Deploy to Netlify

### 4a. Connect GitHub to Netlify
1. Go to https://netlify.com → create free account (use your Google login).
2. New site → Import from GitHub → pick `bchs-aoa-platform`.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Click Deploy site.
5. Note your Netlify URL (e.g., `https://bchs-aoa-abc123.netlify.app`).

### 4b. Add environment variables in Netlify
1. In your Netlify project: Site Settings → Environment Variables.
2. Add these three variables:
   ```
   REACT_APP_GOOGLE_CLIENT_ID   = (paste your Client ID from Step 2c)
   REACT_APP_SHEETS_API_KEY     = (paste your API key from Step 2d)
   REACT_APP_SHEET_ID           = (paste your Sheet ID from Step 3a)
   ```
3. Trigger a new deploy: Deploys → Trigger Deploy.

### 4c. Update Google OAuth with your Netlify URL
1. Back in Google Cloud: Credentials → edit your OAuth Client.
2. Add your Netlify URL to Authorized JavaScript origins.
3. Save.

---

## STEP 5: Test it
1. Open your Netlify URL.
2. Click "Sign in with Google" using your own email.
3. You should land on the dashboard as a system leader.
4. Test with a coordinator email (make sure it's in the Users tab).

---

## STEP 6: Add coordinators
For each school coordinator:
1. Open your Google Sheet → Users tab.
2. Add a row: their email | coordinator | schoolId | School Name.
3. SchoolIds match the IDs in `src/data/schoolData.js` (e.g., `mather`, `binca`, `umana`).
4. They can now log in and see only their school's data.

---

## Development (local testing)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/bchs-aoa-platform.git
cd bchs-aoa-platform

# Install dependencies
npm install

# Copy the env template and fill it in
cp .env.example .env.local
# Edit .env.local with your values

# Start the dev server
npm start
# Opens at http://localhost:3000
```

---

## Adding a new school's data
1. Open `src/data/schoolData.js`
2. Find the `SYSTEM_DATA` array — add a new object with the school's metrics.
3. Add the school to the `SCHOOLS` array.
4. To add a full school profile (like Mather's): duplicate the `MATHER_DATA` structure.
5. Push to GitHub → Netlify auto-deploys within ~2 minutes.

---

## Troubleshooting

**"No access found for [email]"**
→ Add that email to the Users tab in your Google Sheet.

**Google login button doesn't appear**
→ Check that `REACT_APP_GOOGLE_CLIENT_ID` is set correctly in Netlify environment variables.

**Data doesn't load / Sheets errors**
→ Check that `REACT_APP_SHEETS_API_KEY` and `REACT_APP_SHEET_ID` are correct.
→ Make sure the Google Sheets API is enabled in your Google Cloud project.
→ Make sure the sheet is shared (Step 3c).

**KPI saves don't persist after refresh**
→ This is expected in the current version — KPI edits are in-memory.
→ To enable persistent saves: coordinators need to sign in with Google Scopes
   that include Sheets write access. See `src/utils/sheets.js` for the write functions.

---

## What's next (future improvements)
- Add full in-app data entry for all AOA sections
- Wire KPI saves to persist in Google Sheets (needs OAuth write scope)
- Add email notifications when KPIs are updated
- Build out partner data entry for all 20 schools
- Add a PDF export for the full AOA report
- Add a "Notes" / qualitative data section per tab
