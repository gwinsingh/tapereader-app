# Auto Trade Journal — Google Sheets Setup

## Prerequisites

1. A Google Cloud project with the **Google Sheets API** enabled.
2. A **Service Account** in that project.
3. A **Google Sheet** that the service account has edit access to.

## Step-by-step

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Library** and enable **Google Sheets API**.
4. Navigate to **APIs & Services → Credentials**.
5. Click **Create Credentials → Service Account**.
6. Give it a name (e.g., `trade-journal-writer`) and create.
7. No roles needed at the project level — skip or assign "No role".
8. Click into the service account, go to **Keys** tab.
9. Click **Add Key → Create new key → JSON**.
10. Download the JSON key file.

### 2. Create the Google Sheet

1. Create a new Google Sheet (or use an existing one).
2. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
3. Share the sheet with the service account email (found in the JSON key file as `client_email`), granting **Editor** access.

### 3. Set Environment Variables

Add these to your `.env.local` file in the `web/` directory:

```bash
# The entire JSON content of the service account key file, as a single line
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# The spreadsheet ID from step 2
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

> **Tip:** To convert the multi-line JSON key to a single line, you can run:
> ```bash
> cat path/to/keyfile.json | jq -c .
> ```

### 4. Run the app

```bash
cd web
npm run dev
```

Navigate to **PCT Bootcamp → Auto Trade Journal** and upload a DAS Trader CSV.

## How it works

- Each unique **Account** number in the CSV gets its own tab (sub-sheet) in the Google Sheet.
- Only rows with `Event = "Execute"` are processed; all other order lifecycle events are ignored.
- Executions are grouped into **round-trip trades** (entry → exit) using position tracking.
- Deduplication prevents the same trades from being appended twice.

## Google Sheet columns

| Column | Description |
|--------|-------------|
| Date | Trade date (from the date picker) |
| Entry Time | Time of first fill |
| Exit Time | Time of last fill |
| Symbol | Ticker symbol |
| Side | Long or Short |
| Shares | Total shares traded |
| Avg Entry | Weighted average entry price |
| Avg Exit | Weighted average exit price |
| # Partials | Number of individual fills in the round trip |
| P&L | Computed profit/loss for the round trip |
| R (Risk) | **Manual input** — your risk amount in dollars |
| P&L (R) | **Auto-computed formula** — P&L divided by R |
