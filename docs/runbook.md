# Operations Runbook

## Weekly Review Process
1. Open the "Dashboard" tab in the Google Sheet.
2. Check the `ERROR_LOG` tab for any ingestion or generation errors from the past week.
3. Review job applications in the `Drafts Generated` status.
4. Open the associated Google Docs (Resume, Cover Letter) via the links in the `ARTIFACTS` tab to manually review and accept facts.
5. Review the generated Gmail outreach drafts and either send or delete them.

## Handling Missing Facts
- When the AI generator outputs `[MISSING FACT]`, open the `FACTS_REPO` tab and add the appropriate metric or experience bullet.
- Ensure `allowed_for_resume` is checked for new facts.
- Re-run the artifact generation for that specific opportunity ID.
