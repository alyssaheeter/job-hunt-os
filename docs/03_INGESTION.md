# 03: Ingestion

The ingestion process creates a structured `JOB` entry from an external URL or raw text.

## Process
1. **Via Sidebar**: Users can paste a URL into the JobOS sidebar (`src/web/sidebar.html`).
2. **Fetch or Fallback**: The backend attempts to fetch the raw HTML of the job posting. If the site blocks scraping or requires a login, the user is prompted to manually paste the Job Description text.
3. **AI Extraction**: The AI extracts key fields: `company`, `role_title`, `location`, `salary_range`, `requirements`. It creates an inferred `dedupe_key`.
4. **Deduplication**: The system verifies the `dedupe_key` against the **JOBS** tab. If it exists, ingestion skips creation to maintain idempotency.
5. **Scaffolding**: If new, it creates a row in the **JOBS** sheet with a unique `job_id` and initial statuses.

## Best Practices
- **Inbox Signals**: Active scanning captures networking and referral links from Gmail matching `INBOX_SCAN_QUERY`. Note that it does not read attachments or emails outside the `INBOX_SCAN_LOOKBACK_DAYS`.
- To attach interactions specifically to a job, include the `[[JOBOS ...]]` token in outgoing emails.
