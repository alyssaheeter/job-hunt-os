# Job Hunt OS (Google Apps Script + Google Sheets)

Job Hunt OS is a Google Apps Script project bound to a Google Sheet “Dashboard.” This repository provides a single-user system designed for Alyssa to automate and manage a structured job hunt process directly from Google Workspace.

**Non‑negotiables enforced by this repo**
- Single deployment focused purely on Alyssa's job search.
- Configuration is strictly driven via the **SETTINGS** tab (key/value pairs); no hard-coded configuration.
- Secrets are **never** stored in this repo or in Sheets (API keys live in Script Properties).
- Fact-only AI generation ensuring no hallucinations of credentials, metrics, or employers using a dedicated Facts folder.
- Human‑in‑the‑loop: Emails and documents are saved strictly as drafts. No automatic sending.
- Auditability & idempotency: Uses `dedupe_key` and `correlation_id` for runs, enforcing data integrity and robust error logging.

---

## Repository Structure
```text
src/                     # Complete Apps Script backend and sidebar
  web/                   # Browser JS/CSS and generated HTML includes
packages/shared/         # Shared schemas and scoring
packages/prompts/        # AI prompt modules
packages/renderers/      # Document rendering
packages/job-hub/        # Separate Next.js web app
services/                # API and worker workspaces
data/facts/              # Fact source structures
docs/                    # Setup and architecture documentation
scripts/                 # Build and deployment helpers
test/                    # Local Apps Script regression tests
.clasp-alyssa.json        # Alyssa deployment configuration (rootDir: src)
```

---

## Quick Setup Overview

Please refer to the full setup guide in `/docs/01_SETUP.md` for detailed instructions.

1. **Dashboard Google Sheet**: Create an SSOT Google Sheet.
2. **Apps Script Project**: Create a bound Apps Script project and run `npm run clasp:use:alyssa` to copy `.clasp-alyssa.json` to the ignored `.clasp.json`. Confirm the script ID matches your bound project. Existing local configuration is preserved unless `FORCE=1` is set.
3. **Drive folders**: Create a Templates folder, Output folder, and Facts folder (populate with `facts_` files).
4. **Deploy**: Run `npm run push` to upload code, then run the first-time setup menu item in the spreadsheet.

---

## Checkbox Actions Workflow

The **JOBS** sheet supports **checkbox-driven actions** for seamless operation:

- `DO_RESEARCH` → Generates a Decision Brief in the **RESEARCH** sheet.
- `DO_APPLY` → Parses job descriptions, checks against facts, generates tailored resume and cover letter drafts, and creates follow-up tasks.
- `DO_DRAFT_OUTREACH` → Creates an outreach email draft with tracking identifiers.
- `DO_DRAFT_FOLLOWUP` → Creates a follow-up email draft.

Each action is **idempotent**, meaning re-checking a box won't repeat work if the status is already `DONE`. All actions auto-clear upon processing.

---

## Sidebar Usage

Open **JobOS → Open Sidebar** for URL intake (with optional pasted job description),
dashboard KPIs, priority tasks, recent logs, and searchable job details. The sidebar
can generate artifacts, create outreach drafts, and archive jobs.

`src/web/sidebar.js` and `sidebar.css` are the source files. `npm run build:sidebar`
generates `sidebar-js.html` and `sidebar-css.html` for Apps Script. Both `npm run push`
and `npm run deploy:alyssa` build these assets before uploading. `.claspignore`
excludes browser JavaScript from server-side Apps Script.

If a site blocks URL fetching, paste its job description. Confirm required SETTINGS
and the `AI_API_KEY` Script Property before using AI extraction. Fetch requests use
Apps Script's execution limit; no per-request timeout is claimed.

The complete Apps Script backend is retained under `src/` because the sidebar and
spreadsheet actions depend on it. The API/worker workspaces and separate Next.js app
remain available alongside it.

Sidebar responses serialize spreadsheet dates before returning them to the browser.
Repeated lead emails preserve existing job status, and sent/deleted drafts can be
replaced. Sent-mail reconciliation records message IDs in `INTERACTIONS` and uses
the message's send date for follow-up scheduling. Reauthorize the Apps Script after
deploying if prompted: `userinfo.email` identifies the executing account so inbound
quoted replies are excluded alongside drafts.

---

## Documentation Suite

Dive deeper into the system's capabilities through our detailed documentation suite:

- [docs/00_OVERVIEW.md](docs/00_OVERVIEW.md): Comprehensive system concepts.
- [docs/01_SETUP.md](docs/01_SETUP.md): Step-by-step installation instructions.
- [docs/02_ARCHITECTURE.md](docs/02_ARCHITECTURE.md): Architecture breakdown and diagram.
- [docs/03_INGESTION.md](docs/03_INGESTION.md): Adding jobs via URL, paste, or inbox tracking.
- [docs/04_GENERATION.md](docs/04_GENERATION.md): How fact-only documents and drafts are created.
- [docs/05_WEEKLY_REVIEW.md](docs/05_WEEKLY_REVIEW.md): Running the automated weekly review process.
- [docs/06_TESTING.md](docs/06_TESTING.md): Validating configuration through schemas and tests.
- [docs/07_TROUBLESHOOTING.md](docs/07_TROUBLESHOOTING.md): Resolving common errors and permission issues.

---

## Technical Maintenance

Install dependencies with `npm ci`, then use:

- `npm run check`: build sidebar assets and TypeScript workspaces, then run tests.
- `npm run build:sidebar`: regenerate Apps Script includes only.
- `npm test`: run Apps Script regression tests and workspace tests, where present.
- `npm run push`: build sidebar assets and upload to the configured Apps Script project.
- `npm run deploy:alyssa`: build sidebar assets and deploy using Alyssa's configuration (requires Bash).
- `npm run start:api` / `npm run start:worker`: start the compiled services.

`packages/job-hub` is a separate Next.js application with its own package manifest;
it is not included in the root workspace build. Local tests use Apps Script mocks;
spreadsheet, Gmail, and sidebar behavior still require an authenticated smoke test.
