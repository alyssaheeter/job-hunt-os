function integrityCheck() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return;
  }
  try {
    createMissingSheets();
    enforceRequiredSchema_();
    logEvent("INFO", "integrity_check", "", "", { status: "ok" });
  } catch (err) {
    logEvent("ERROR", "integrity_error", "", "", { error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function enforceRequiredSchema_() {
  var required = {
    JOBS: ["job_id", "url", "status", "date_added", "dedupe_key"],
    TASKS: ["task_id", "job_id", "task_type", "status"],
    LEADS: ["lead_id", "job_id", "email_message_id"],
    LOGS: ["timestamp", "level", "action"]
  };
  Object.keys(required).forEach(function(sheetName) {
    var sheet = getSheetOrThrow_(sheetName);
    var headerMap = getHeaderMap(sheet);
    required[sheetName].forEach(function(header) {
      if (!headerMap[header]) {
        throw new Error("Missing required header: " + sheetName + "." + header);
      }
    });
  });
}
