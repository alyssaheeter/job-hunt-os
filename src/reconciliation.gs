function reconcileSentMail() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return;
  }
  try {
    var settings = getAllSettings();
    var processedLabelName = settings.GMAIL_LABEL_PREFIX + "_PROCESSED";
    var processedLabel = GmailApp.getUserLabelByName(processedLabelName) || GmailApp.createLabel(processedLabelName);

    var threads = GmailApp.search('in:sent newer_than:30d "JOBOS job_id"');
    var tasksSheet = getSheetOrThrow_("TASKS");
    var jobsSheet = getSheetOrThrow_("JOBS");
    var processedMessageIds = getProcessedSentMessageIds_(tasksSheet);

    threads.forEach(function(thread) {
      var messages = thread.getMessages();
      messages.forEach(function(message) {
        if (processedMessageIds[message.getId()]) return;
        var body = message.getBody() || "";
        var plainBody = message.getPlainBody() || "";
        var tokens = parseTrackingToken_(body) || parseTrackingToken_(plainBody);
        if (!tokens || !tokens.job_id) {
          return;
        }
        var jobId = tokens.job_id;
        var taskId = tokens.task_id || "";
        var action = tokens.action || "";

        if (taskId) {
          var taskRow = findRowById_(tasksSheet, "task_id", taskId);
          if (taskRow !== -1) {
            updateRowByMap(tasksSheet, taskRow, {
              status: "done",
              sent_message_id: message.getId(),
              updated_at: new Date()
            });
            processedMessageIds[message.getId()] = true;
          }
        }

        var jobRow = findRowById_(jobsSheet, "job_id", jobId);
        if (jobRow !== -1) {
          var followup = computeNextFollowupDate_(action);
          updateRowByMap(jobsSheet, jobRow, {
            last_contact_date: formatDate_(new Date()),
            next_follow_up_date: followup ? formatDate_(followup) : ""
          });
        }

        logEvent("INFO", "reconciled_sent", jobId, taskId, { messageId: message.getId(), action: action });
      });
      thread.addLabel(processedLabel);
    });
  } catch (err) {
    logEvent("ERROR", "reconcile_error", "", "", { error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getProcessedSentMessageIds_(tasksSheet) {
  var headerMap = getHeaderMap(tasksSheet);
  var column = headerMap.sent_message_id;
  var ids = {};
  if (!column || tasksSheet.getLastRow() < 2) return ids;
  var values = tasksSheet.getRange(2, column, tasksSheet.getLastRow() - 1, 1).getValues();
  values.forEach(function(row) {
    if (row[0]) ids[String(row[0])] = true;
  });
  return ids;
}

function parseTrackingToken_(body) {
  var regex = /\[\[JOBOS\s+([^\]]+)\]\]/g;
  var match = regex.exec(body || "");
  if (!match) return null;
  var payload = match[1];
  var parts = payload.split(/\s+/);
  var tokens = {};
  parts.forEach(function(part) {
    var kv = part.split("=");
    if (kv.length === 2) {
      tokens[kv[0]] = kv[1];
    }
  });
  return tokens;
}

function computeNextFollowupDate_(action) {
  var now = new Date();
  var days = null;
  if (action === "outreach") {
    days = getNumberSetting("FOLLOW_UP_DAYS_1", 3);
  } else if (action === "followup1") {
    days = getNumberSetting("FOLLOW_UP_DAYS_2", 7);
  } else if (action === "followup2") {
    days = getNumberSetting("FOLLOW_UP_DAYS_3", 14);
  } else if (action === "followup") {
    days = getNumberSetting("FOLLOW_UP_DAYS_1", 3);
  }
  if (days === null || days === undefined) {
    return null;
  }
  var next = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return next;
}
