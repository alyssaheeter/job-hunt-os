# 05: Weekly Review

To maintain momentum and a clean dataset, the JobOS provides a systematic weekly reconciliation process.

## Process
1. **Triggering**: A recurring `Time-Driven Trigger` is configured in Google Apps Script or executed manually via the JobOS menu.
2. **Execution (`src/reconciliation.gs`)**: 
   - Scans the **JOBS** and **TASKS** tabs.
   - Clears out stale checkboxes that are finished but haven't been reset.
   - Archives completed `TASKS` logically or drops them based on retention.
   - Consolidates open actionable follow-ups.
3. **Summary Notification**: Creates an email draft weekly containing a status report:
   - High priority jobs.
   - Overdue follow-up tasks.
   - New `INTERACTIONS` requiring review.

## Maintaining Focus
By reviewing the Weekly Review draft:
- You ensure your SSOT reflects your active pipeline.
- You identify pending action items (e.g., outreach drafts needing dispatch).
- You avoid letting old leads decay.
