# Job Hunt OS - Antigravity Rules

## General Principles
1. **Fact-Only Safety**: When creating or modifying code that interacts with the AI generation (`src/ai.gs`, `src/docs.gs`), always enforce the rule: the system must never hallucinate credentials. It must append `[MISSING FACT]` if an explicit requirement is missing from the user's `FACTS_FOLDER_ID`.
2. **Idempotency**: All checkbox actions (`DO_RESEARCH`, `DO_APPLY`, etc.) must be idempotent. Code should clear the checkbox immediately after processing and not rerun if the paired status field is `DONE`.
3. **No Auto-Sending**: Code should only create `Drafts` in Gmail and Google Docs. Never call `.sendEmail()` or equivalent without an explicit human-in-the-loop override flag (which defaults to false).
4. **Configuration**: All configuration variables must live in the `SETTINGS` sheet. Do not hardcode Template IDs or Folder IDs.

## Workflows
When asked to perform repository maintenance, utilize the provided workflows in `.agent/workflows/`:
- `generate-docs.md`: To rebuild the README or update documentation.
- `verify-schema.md`: To validate the `SETTINGS` schema and Apps Script configuration.
- `run-tests.md`: To execute linting or testing.
- `release.md`: To prepare a new release tag.
