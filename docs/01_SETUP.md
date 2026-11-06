# 01: Setup

> **Important**: You must be signed into Alyssa’s Google account in the browser/terminal where you run `clasp`.

1. **Create Dashboard Google Sheet**
   - Name it `Job Hunt OS Dashboard`.

2. **Create a new Apps Script project bound to that Sheet**
   - In the Sheet: `Extensions → Apps Script`.
   - Name the project `Job Hunt OS`.

3. **Create Drive folders**
   - **Templates folder**: Place a resume and cover letter template here.
   - **Output folder**: Stores generated artifacts.
   - **Facts folder**: Add fact documents describing your background.

4. **Prepare Facts Folder contents (required)**
   Put only factual source material in this folder. Recommended files:
   - `facts_resume_master.docx` or Google Doc (primary facts)
   - `facts_accomplishments.txt`
   - `facts_project_bullets.txt`
   - `facts_roles_history.doc`
   
   **Naming convention**: prefix with `facts_` for clarity.

5. **Create clasp config**
   ```bash
   npm install
   cp .clasp.json.example .clasp.json
   ```
   Edit `.clasp.json` and replace:
   - `scriptId`: Your Apps Script project ID (found in Project Settings).
   - `rootDir`: `src`

6. **Push code + authorize**
   ```bash
   npm run push
   ```
   Authorize via the Apps Script editor when prompted to run any function.

7. **Initialize the sheet**
   - In your Sheet, reload the page.
   - Use the custom menu **JobOS → RUN_ME_FIRST** or **Run First‑Time Setup**.
   - Open **JobOS → Open Sidebar** to use the URL ingest + dashboard.

8. **Set Script Properties (API key)**
   - In Apps Script: `Project Settings → Script Properties`.
   - Add key: `AI_API_KEY` with your AI provider key value.

9. **Populate SETTINGS tab**
   - Run **JobOS → Run First‑Time Setup** if not already.
   - Fill in required keys defined in the `schemas/SETTINGS.schema.json`.
