function runMeFirst() {
  createMissingSheets();
  installTriggers();
  SpreadsheetApp.getUi().alert("JobOS setup completed.");
}

function createMissingSheets() {
  var ss = SpreadsheetApp.getActive();
  var definitions = [
    { name: "SETTINGS", headers: ["KEY", "VALUE"] },
    { name: "JOBS", headers: [
      "job_id", "raw_url", "normalized_url", "url", "company", "role_title", "source", "status",
      "needs_review", "fetch_status", "contact_email", "date_added", "job_description",
      "job_summary_json", "fit_score", "resume_doc_id", "cover_letter_doc_id", "outreach_draft_id",
      "last_contact_date", "next_follow_up_date", "lead_email_message_id", "dedupe_key",
      "ai_resume_used_facts_json", "ai_cover_used_facts_json",
      "DO_RESEARCH", "RESEARCH_STATUS", "RESEARCH_UPDATED_AT",
      "DO_APPLY", "APPLY_STATUS", "APPLY_UPDATED_AT",
      "DO_DRAFT_OUTREACH", "DRAFT_OUTREACH_STATUS", "DRAFT_OUTREACH_UPDATED_AT",
      "DO_DRAFT_FOLLOWUP", "DRAFT_FOLLOWUP_STATUS", "DRAFT_FOLLOWUP_UPDATED_AT",
      "LAST_ACTION_ERROR"
    ] },
    { name: "TASKS", headers: [
      "task_id", "job_id", "task_type", "status", "due_date", "draft_id", "sent_message_id",
      "created_at", "updated_at"
    ] },
    { name: "CONTACTS", headers: [
      "contact_id", "job_id", "name", "email", "role", "notes", "created_at"
    ] },
    { name: "LEADS", headers: [
      "lead_id", "job_id", "email_message_id", "detected_url", "status", "created_at"
    ] },
    { name: "INTERACTIONS", headers: [
      "interaction_id", "ts", "direction", "from", "to", "subject", "thread_id", "message_id",
      "job_id", "type", "confidence", "needs_review", "url_found", "snippet"
    ] },
    { name: "LOGS", headers: [
      "timestamp", "level", "action", "job_id", "task_id", "details_json"
    ] },
    { name: "RESEARCH", headers: [
      "job_id", "company", "role", "research_status", "culture_summary", "pay_summary",
      "benefits_summary", "location_notes", "interview_process_notes", "pros", "cons",
      "red_flags", "questions_to_ask", "sources_json", "generated_at"
    ] }
  ];

  definitions.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    ensureHeaders_(sheet, def.headers);
  });

  var jobsSheet = ss.getSheetByName("JOBS");
  if (jobsSheet) {
    applyCheckboxValidation_(jobsSheet, ["DO_RESEARCH", "DO_APPLY", "DO_DRAFT_OUTREACH", "DO_DRAFT_FOLLOWUP"]);
  }

  ensureDefaultSettings_();
}

function ensureDefaultSettings_() {
  var sheet = getSettingsSheet_();
  if (!sheet) return;
  var headerMap = getHeaderMap(sheet);
  if (Object.keys(headerMap).length === 0) return;
  var existing = getSettingsFromSheet_();
  Object.keys(JOBOS_DEFAULT_SETTINGS).forEach(function(key) {
    if (existing[key] === undefined || existing[key] === "") {
      appendRowByMap(sheet, { KEY: key, VALUE: JOBOS_DEFAULT_SETTINGS[key] });
    }
  });
}

function installTriggers() {
  var handlers = ["scanInboxForLeads", "reconcileSentMail", "integrityCheck", "scanInboxForSignals", "handleOnEdit"];
  var existing = ScriptApp.getProjectTriggers();
  existing.forEach(function(trigger) {
    var handler = trigger.getHandlerFunction();
    if (handlers.indexOf(handler) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("scanInboxForLeads").timeBased().everyMinutes(30).create();
  ScriptApp.newTrigger("reconcileSentMail").timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger("integrityCheck").timeBased().atHour(2).everyDays(1).create();
  ScriptApp.newTrigger("handleOnEdit").forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  ScriptApp.newTrigger("scanInboxForSignals").timeBased().everyMinutes(10).create();

  logEvent("INFO", "install_triggers", "", "", { handlers: handlers });
}

function applyCheckboxValidation_(sheet, columns) {
  var headerMap = getHeaderMap(sheet);
  var maxRows = Math.max(sheet.getMaxRows() - 1, 1);
  var rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  columns.forEach(function(columnName) {
    var columnIndex = headerMap[columnName];
    if (!columnIndex) return;
    sheet.getRange(2, columnIndex, maxRows, 1).setDataValidation(rule);
  });
}
