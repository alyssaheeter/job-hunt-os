# Troubleshooting Guide

## Apps Script Quota Limitations
- **Google services are rate-limited.** If you encounter `Service invoked too many times`, you have hit the daily quota for Gmail drafts or document creations. Wait 24 hours.

## LLM API Errors
- If Vertex AI or Gemini returns a `429 Too Many Requests` or `500 Internal Server Error`, wait a moment and trigger a re-run. The pipeline is idempotent.

## Clasp Authentication Issues
- Error: `User has not enabled the Apps Script API`
  - Solution: Go to https://script.google.com/home/usersettings and toggle the Apps Script API to **ON**.
- Error: `clasp push fails with missing credentials`
  - Solution: Run `clasp login` again to refresh your OAuth token.
