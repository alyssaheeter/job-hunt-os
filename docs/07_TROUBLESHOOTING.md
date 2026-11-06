# 07: Troubleshooting

Identify common errors and how to resolve them.

### Sidebar shows missing settings
- **Cause**: The `SETTINGS` tab does not conform to the required JSON schema.
- **Fix**: Confirm required keys exist in **SETTINGS** and re-run **RUN_ME_FIRST** if headers are missing. Check `schemas/SETTINGS.schema.json` for validation rules.

### AI extraction fails / Hallucinates
- **Cause**: AI Provider keys are invalid, model is unavailable, or Fact repo not discovered.
- **Fix**:
  - Ensure Script Property `AI_API_KEY` is set and `AI_ENABLED` is `true`.
  - Confirm `AI_MODEL` is set to a valid model name (e.g. `gemini_api` or `vertex_ai`).
  - Verify that your document templates accurately map to the outputs and your `FACTS_FOLDER_ID` exists and is shared correctly.

### URL ingest requires review / Checkbox actions aren't triggering
- **Cause**: Trigger permissions dropped or the site blocked the HTTP fetch.
- **Fix**:
  - Paste the internal Job Description directly into the text field in the sidebar.
  - Open `Extensions -> Apps Script -> Triggers` and ensure the `onEdit` trigger is correctly bound and authorized.
  - Review the `LAST_ACTION_ERROR` column on the **JOBS** sheet for stack traces.

### Generated Emails Aren't Sending
- **Cause**: By design. `JobOS` guarantees HITL (Human-in-the-loop) constraints.
- **Fix**: Emails are generated in Drafts. You must review and dispatch them manually from Gmail.
