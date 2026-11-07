function logEvent(level, action, jobId, taskId, details) {
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName("LOGS");
    if (!sheet) {
      return;
    }
    var payload = {
      timestamp: new Date(),
      level: level,
      action: action,
      job_id: jobId || "",
      task_id: taskId || "",
      details_json: details ? JSON.stringify(details) : ""
    };
    appendRowByMap(sheet, payload);
  } catch (err) {
    Logger.log("LOGGING_FAILED: " + err);
  }
}
