# Security & Compliance

## Data Isolation
- This architecture relies on two separate Apps Script deployments to guarantee complete data isolation between users.
- Neither user has access to the other's inbox, Drive folders, or spreadsheets.

## OAuth Scopes
The minimum required OAuth scopes for the Apps Script project are:
- `https://www.googleapis.com/auth/spreadsheets` (Read/write Dashboard Sheet)
- `https://www.googleapis.com/auth/drive` (Create job folders, save Resume/Cover letter Docs)
- `https://www.googleapis.com/auth/documents` (Edit tailored Resume Docs)
- `https://www.googleapis.com/auth/gmail.compose` (Create email drafts only)
- `https://www.googleapis.com/auth/script.external_request` (LLM API calls)

## Secrets Management
- AI API keys and other secrets must **never** be committed to this repository.
- Store secrets using the Apps Script **Script Properties** service, configurable manually via the Apps Script editor or `clasp`.

## Browser Allowlist
- For web scraping or automated navigation, only the following domains are permitted:
  - Google Docs / Drive / Sheets
  - Standard job boards as provided by user URL (excluding login-gated URLs like LinkedIn).
