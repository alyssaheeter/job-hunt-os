function scanInboxForLeads() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return;
  }
  try {
    var settings = getAllSettings();
    var labelName = settings.GMAIL_LABEL_PREFIX + "_LEAD";
    var label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
      logEvent("WARN", "lead_scan_no_label", "", "", { label: labelName });
      return;
    }

    var threads = label.getThreads();
    var urlRegex = /(https?:\/\/[^\s]+)/i;
    var leadsSheet = getSheetOrThrow_("LEADS");

    threads.forEach(function(thread) {
      var messages = thread.getMessages();
      var processed = false;
      messages.forEach(function(message) {
        if (message.isUnread()) {
          if (findRowById_(leadsSheet, "email_message_id", message.getId()) !== -1) {
            message.markRead();
            processed = true;
            return;
          }
          var body = message.getBody() || "";
          var match = body.match(urlRegex);
          if (!match) {
            return;
          }
          var url = match[1];
          var ingestResult = ingestJobFromUrl_(url, message.getPlainBody() || "", "lead_scan");
          var jobId = ingestResult.job_id;
          var jobsSheet = getSheetOrThrow_("JOBS");
          var jobRow = findRowById_(jobsSheet, "job_id", jobId);
          if (jobRow !== -1) {
            updateRowByMap(jobsSheet, jobRow, {
              status: "lead",
              lead_email_message_id: message.getId()
            });
          }
          appendRowByMap(leadsSheet, {
            lead_id: generateId_("lead"),
            job_id: jobId,
            email_message_id: message.getId(),
            detected_url: url,
            status: "new",
            created_at: new Date()
          });
          message.markRead();
          processed = true;
          logEvent("INFO", "lead_ingested", jobId, "", { url: url });
        }
      });
      if (processed) {
        thread.removeLabel(label);
      }
    });
  } catch (err) {
    logEvent("ERROR", "lead_scan_error", "", "", { error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
