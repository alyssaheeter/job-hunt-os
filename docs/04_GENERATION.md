# 04: Generation

Automated artifact generation ensures all output is grounded strictly in facts, maintaining an auditable and hallucination-free process.

## Strict Fact-Only Constraint
The AI integrates with `FACTS_FOLDER_ID`. It reads these files to understand the user's history, projects, and metrics.
If the job description demands a skill or metric that the user lacks in their facts folder, the AI **will not invent it**. Instead, it generates a `[MISSING FACT]` placeholder and appends the requirement to a missing facts list.

## Artifact Types

### Resume & Cover Letter
Triggered via `DO_APPLY` checkbox on the JOBS sheet.
1. The system fetches the required Google Doc templates via `RESUME_TEMPLATE_ID`/`COVER_LETTER_TEMPLATE_ID`.
2. AI aligns facts to the JD to emphasize relevance.
3. The response JSON provides content for placeholders in the template.
4. The backend creates a copy in the `OUTPUT_FOLDER_ID` and patches it.

### Outreach & Follow-up Drafts
Triggered via `DO_DRAFT_OUTREACH` or `DO_DRAFT_FOLLOWUP`.
1. The AI reviews the job context and facts.
2. A generic professional message is drafted matching `DEFAULT_EMAIL_TONE`.
3. An HTML draft is generated in Gmail containing a hidden `[[JOBOS <job_id>]]` token.

## Human-in-the-Loop
You must manually review, edit, and send drafts. Generated docs and emails are never dispatched automatically.
