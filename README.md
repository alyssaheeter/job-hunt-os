# Job Hunt OS (Google Apps Script + Google Sheets)

Job Hunt OS is a Google Apps Script project bound to a Google Sheet “Dashboard.” This repo supports **two totally separate deployments** (Alyssa and Mom) using one shared codebase and two clasp configurations.

**Non‑negotiables enforced by this repo**
- No shared inbox, no shared Drive, no cross‑account permissions.
- Each deployment is a *separate* Apps Script project bound to that user’s Dashboard Sheet.
- Configuration is stored in each user’s **SETTINGS** tab (key/value pairs).
- Secrets are **never** stored in this repo or in Sheets (API key is stored in Script Properties).

---

## Repository Structure
```
/
  README.md
  LICENSE
  .gitignore
  package.json
  scripts/
    clasp-use.mjs
    build-sidebar.mjs
  clasp/
    .clasp.alyssa.json.example
    .clasp.mom.json.example
  src/
    appsscript.json
    Code.gs
    config.gs
    util.gs
    logging.gs
    menu.gs
    setup.gs
    ui.gs
    jobs.gs
    tasks.gs
    leads.gs
    reconciliation.gs
    docs.gs
    integrity.gs
    ai.gs
    intake.gs
    web/
      sidebar.html
      sidebar.css
      sidebar.js
      sidebar-css.html     # generated Apps Script include
      sidebar-js.html      # generated Apps Script include
```

---

# Setup Track A: Alyssa (Alyssa’s Google account)

> **Important**: You must be signed into Alyssa’s Google account in the browser/terminal where you run `clasp`. Do **not** share the Sheet, Script, or any Drive folders with Mom.

1. **Create Alyssa’s Dashboard Google Sheet**
   - Name it something like `Alyssa - Job Hunt OS Dashboard`.

2. **Create a new Apps Script project bound to that Sheet**
   - In the Sheet: `Extensions → Apps Script`.
   - Name the project `Job Hunt OS - Alyssa`.

3. **Create Alyssa’s Drive folders**
   - **Templates folder** (for resume + cover templates)
   - **Output folder** (for generated artifacts)
   - **Facts folder** (only facts about Alyssa’s background)

4. **Prepare Facts Folder contents (required)**
   Put only factual source material in this folder. Recommended files:
   - `facts_resume_master.docx` or Google Doc (primary facts)
   - `facts_accomplishments.txt`
   - `facts_project_bullets.txt`
   - `facts_roles_history.doc`

   **Naming convention**: prefix with `facts_` for clarity.

5. **Create clasp config for Alyssa**
   ```bash
   npm install
   npm run clasp:use:alyssa
   ```
   This copies `clasp/.clasp.alyssa.json.example` to `.clasp.json`.
   Edit `.clasp.json` and replace:
   - `scriptId`: `[FILL-IN_SCRIPT_ID]` (Alyssa’s Apps Script project ID)
   - `rootDir`: `[FILL-IN_ROOT_DIR]` (usually `src`)

6. **Push code + authorize**
   ```bash
   npm run push
   ```
   Authorize as Alyssa when prompted.

7. **Initialize the sheet**
   - In Alyssa’s Sheet, reload.
   - Use the custom menu **JobOS → RUN_ME_FIRST** or **Run First‑Time Setup**.
   - Open **JobOS → Open Sidebar** to use the URL ingest + dashboard.

8. **Set Script Properties (API key)**
   - In Apps Script: `Project Settings → Script Properties`.
   - Add key: `AI_API_KEY` with your provider key value.

9. **Populate SETTINGS tab**
   - Run **JobOS → Run First‑Time Setup** if not already.
   - Fill in required keys (see SETTINGS section below).

---

# Setup Track B: Mom (Mom’s Google account)

> **Important**: You must be signed into Mom’s Google account in the browser/terminal where you run `clasp`. Do **not** share the Sheet, Script, or any Drive folders with Alyssa.

1. **Create Mom’s Dashboard Google Sheet**
   - Name it something like `Mom - Job Hunt OS Dashboard`.

2. **Create a new Apps Script project bound to that Sheet**
   - In the Sheet: `Extensions → Apps Script`.
   - Name the project `Job Hunt OS - Mom`.

3. **Create Mom’s Drive folders**
   - **Templates folder** (for resume + cover templates)
   - **Output folder** (for generated artifacts)
   - **Facts folder** (only facts about Mom’s background)

4. **Prepare Facts Folder contents (required)**
   Put only factual source material in this folder. Recommended files:
   - `facts_resume_master.docx` or Google Doc (primary facts)
   - `facts_accomplishments.txt`
   - `facts_project_bullets.txt`
   - `facts_roles_history.doc`

   **Naming convention**: prefix with `facts_` for clarity.

5. **Create clasp config for Mom**
   ```bash
   npm install
   npm run clasp:use:mom
   ```
   This copies `clasp/.clasp.mom.json.example` to `.clasp.json`.
   Edit `.clasp.json` and replace:
   - `scriptId`: `[FILL-IN_SCRIPT_ID]` (Mom’s Apps Script project ID)
   - `rootDir`: `[FILL-IN_ROOT_DIR]` (usually `src`)

6. **Push code + authorize**
   ```bash
   npm run push
   ```
   Authorize as Mom when prompted.

7. **Initialize the sheet**
   - In Mom’s Sheet, reload.
   - Use the custom menu **JobOS → RUN_ME_FIRST** or **Run First‑Time Setup**.
   - Open **JobOS → Open Sidebar** to use the URL ingest + dashboard.

8. **Set Script Properties (API key)**
   - In Apps Script: `Project Settings → Script Properties`.
   - Add key: `AI_API_KEY` with your provider key value.

9. **Populate SETTINGS tab**
   - Run **JobOS → Run First‑Time Setup** if not already.
   - Fill in required keys (see SETTINGS section below).

---

## SETTINGS tab (required keys)
Minimum required keys (you may add more):
- `TEMPLATES_FOLDER_ID`
- `RESUME_TEMPLATE_ID`
- `COVER_LETTER_TEMPLATE_ID`
- `OUTPUT_FOLDER_ID`
- `FACTS_FOLDER_ID` (required for resume/cover AI)
- `GMAIL_LABEL_PREFIX`
- `ENABLE_AUTO_SEND` (default `false`)
- `FOLLOW_UP_DAYS_1` (default `3`)
- `FOLLOW_UP_DAYS_2` (default `7`)
- `FOLLOW_UP_DAYS_3` (default `14`)
- `SIGNATURE_BLOCK` (default empty)
- `DEFAULT_EMAIL_TONE` (default `professional`)
- `AI_ENABLED` (default `true`)
- `AI_PROVIDER` (default `gemini_api`)
- `AI_MODEL` (default `[FILL-IN]`)
- `FIT_SCORE_ENABLED` (default `false`)
- `FIT_SCORE_THRESHOLD` (default `75`)
- `MAX_OUTPUT_TOKENS` (default `900`)
- `TEMPERATURE` (default `0.3`)
- `INBOX_SCAN_QUERY` (default focused query for inbox signal scan)
- `INBOX_SCAN_LOOKBACK_DAYS` (default `2`)

---

## Checkbox Actions Workflow
The JOBS sheet now supports **checkbox-driven actions** (no menu clicks). After running **JobOS → Run First-Time Setup**, the following columns are available:

**Action checkboxes**
- `DO_RESEARCH` → runs the Decision Brief (fast option A).
- `DO_APPLY` → generates resume + cover letter, and creates a follow-up task.
- `DO_DRAFT_OUTREACH` → creates or updates an outreach draft with a hidden tracking token.
- `DO_DRAFT_FOLLOWUP` → creates or updates a follow-up draft with a hidden tracking token.

**Status + audit columns**
- `RESEARCH_STATUS`, `RESEARCH_UPDATED_AT`
- `APPLY_STATUS`, `APPLY_UPDATED_AT`
- `DRAFT_OUTREACH_STATUS`, `DRAFT_OUTREACH_UPDATED_AT`
- `DRAFT_FOLLOWUP_STATUS`, `DRAFT_FOLLOWUP_UPDATED_AT`
- `LAST_ACTION_ERROR` (any errors from the last checkbox action)

**Behavior**
- Each action is idempotent. If a status is `DONE`, re-checking the box does nothing until you reset the status to `NEW`.
- Checkboxes auto-clear after processing.
- Decision Brief output is stored in the **RESEARCH** sheet.

---

## Sidebar Usage (Recommended)
Open **JobOS → Open Sidebar** to access:
- **URL ingest** with optional JD paste if the site blocks fetch.
- **Dashboard KPIs** for total jobs, active jobs, needs review, and open tasks.
- **Priority tasks** and **needs review** job list.
- **Recent logs** for quick debugging.
- **Searchable jobs** with an editable detail view and buttons to create artifacts, draft outreach, or archive.

The browser-native `sidebar.css` and `sidebar.js` files are the source of truth. Apps Script only deploys
`.gs` and `.html` files, so `npm run build` generates the corresponding HTML includes. `npm run push`
runs this build automatically, and `.claspignore` prevents browser JavaScript from being deployed as
server-side Apps Script.

---

## Troubleshooting
**Sidebar shows missing settings**
- Confirm required keys exist in **SETTINGS** and re-run **RUN_ME_FIRST** if headers are missing.

**AI extraction fails**
- Ensure Script Property `AI_API_KEY` is set and `AI_ENABLED` is `true`.
- Confirm `AI_MODEL` is set to a valid model name.

**URL ingest requires review**
- Paste the job description into the optional text field if the site blocks fetch.
- Apps Script does not expose a per-request timeout option for `UrlFetchApp`; requests use the platform's
  execution timeout and are marked `blocked_*`, `thin_*`, or `fetched_*` based on the response.

**Run local checks before pushing**
```bash
npm run check
```

---

## How inbox capture works (Option 1: focused filter)
The **Inbox Signal Scan** runs on a 10‑minute time trigger and only looks at **inbox messages** that match a focused Gmail search query. This keeps scope narrow and avoids full‑inbox scans.

**Scope + privacy notes**
- Uses `INBOX_SCAN_QUERY` plus `INBOX_SCAN_LOOKBACK_DAYS` to limit results (the query is always forced to include `in:inbox` and a lookback window).
- Does **not** require labels, does **not** scan all inbox mail, and does **not** read outside the configured query window.
- Logs only minimal metadata + snippet to the `INTERACTIONS` sheet (no attachments, no scraping job boards).

**Linking logic**
1. If a `[[JOBOS ...]]` tracking token is found (HTML comment in outgoing drafts), the interaction is linked to that `job_id` with high confidence.
2. Otherwise, the scan looks for a URL, normalizes it, and creates/updates a `JOBS` row based on that URL.
3. If neither is found, the interaction is logged with `needs_review=true`.

**Interaction types**
Minimal classification: `JOB_LINK`, `RECRUITER`, `INTERVIEW`, `NETWORKING`, or `UNKNOWN`.

### Verification steps (first‑contact capture without labels)
1. Ensure `INBOX_SCAN_QUERY` and `INBOX_SCAN_LOOKBACK_DAYS` are set in **SETTINGS**.
2. Run **JobOS → Run First‑Time Setup** (to create the `INTERACTIONS` sheet + trigger).
3. Send yourself a test email that matches the query (e.g., subject includes “interview” or contains a job URL).
4. Run `scanInboxForSignals` manually from the Apps Script editor (for immediate feedback).
5. Confirm a new row appears in **INTERACTIONS** and, if a URL was detected, a `JOBS` row is created/linked.

---

## 10-Minute Verification Checklist
1. Run **JobOS → Run First-Time Setup** to create sheets + install triggers.
2. Confirm JOBS has the new checkbox + status columns.
3. Add a test row with `job_id`, `company`, `role_title`, and a company URL (not a job board).
4. Check `DO_RESEARCH` and confirm:
   - `RESEARCH_STATUS` becomes `DONE`.
   - A row appears in the **RESEARCH** sheet.
5. Check `DO_APPLY` and confirm:
   - Resume + cover IDs populate in JOBS.
   - A follow-up task exists in TASKS.
6. Check `DO_DRAFT_OUTREACH` and confirm:
   - `outreach_draft_id` is set.
   - Draft contains the hidden `[[JOBOS ...]]` token in the HTML body.
7. Check `DO_DRAFT_FOLLOWUP` and confirm:
   - A follow-up draft is created or updated in TASKS.
8. Verify checkboxes auto-clear after each action.
9. Set a status to `DONE`, re-check the box, and confirm it does **not** rerun.
10. Reset status to `NEW`, re-check, and confirm it reruns.

---

## AI usage (high‑leverage only)
AI is used **only** for:
1. Job description summarization
2. Outreach draft generation
3. Follow‑up draft generation
4. Optional fit scoring
5. Resume tailoring
6. Cover letter generation

**No scraping job boards.** Users manually paste job description data if needed.

---

## Important data boundaries
- Resume and cover letter content are generated **only** from facts in `FACTS_FOLDER_ID` + job fields.
- The system does **not** invent credentials, employers, degrees, metrics, dates, tools, or achievements.
- If facts are insufficient, output includes `[FILL-IN]` placeholders and a “Missing Facts Needed” list.

---

## Deploying updates
After making changes:
```bash
npm run push
npm run deploy
```
Replace the deploy description in `package.json` or pass a custom description.

---

## Notes
- This repo supports two clasp configs. Never share `.clasp.json` between users.
- Always log into the correct Google account before running `clasp login`.
- Do **not** share sheets or Drive folders across accounts.
