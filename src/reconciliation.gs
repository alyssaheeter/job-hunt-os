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
    var interactionsSheet = getSheetOrThrow_("INTERACTIONS");
    var processedMessageIds = getProcessedSentMessageIds_(tasksSheet, interactionsSheet);
    var ownAddresses = GmailApp.getAliases().concat([Session.getEffectiveUser().getEmail()])
      .map(function(address) { return address.toLowerCase(); });

    threads.forEach(function(thread) {
      var messages = thread.getMessages();
      messages.forEach(function(message) {
        if (processedMessageIds[message.getId()]) return;
        var from = message.getFrom();
        var addressMatch = from.match(/<([^>]+)>/);
        var address = (addressMatch ? addressMatch[1] : from).trim().toLowerCase();
        if (message.isDraft() || ownAddresses.indexOf(address) === -1) return;
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
          }
        }

        var jobRow = findRowById_(jobsSheet, "job_id", jobId);
        var sentAt = message.getDate();
        if (jobRow !== -1) {
          var job = readRowByMap(jobsSheet, jobRow);
          if (!job.last_contact_date || new Date(job.last_contact_date).getTime() <= sentAt.getTime()) {
            var followup = computeNextFollowupDate_(action, sentAt);
            updateRowByMap(jobsSheet, jobRow, {
              last_contact_date: formatDate_(sentAt),
              next_follow_up_date: followup ? formatDate_(followup) : ""
            });
          }
        }

        appendRowByMap(interactionsSheet, {
          interaction_id: generateId_("interaction"), ts: sentAt,
          direction: "outbound", message_id: message.getId(),
          thread_id: thread.getId(), job_id: jobId, type: "reconciled_sent"
        });
        processedMessageIds[message.getId()] = true;

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

function getProcessedSentMessageIds_(tasksSheet, interactionsSheet) {
  var headerMap = getHeaderMap(tasksSheet);
  var column = headerMap.sent_message_id;
  var ids = {};
  var values = column && tasksSheet.getLastRow() >= 2
    ? tasksSheet.getRange(2, column, tasksSheet.getLastRow() - 1, 1).getValues() : [];
  values.forEach(function(row) {
    if (row[0]) ids[String(row[0])] = true;
  });
  if (interactionsSheet && interactionsSheet.getLastRow() >= 2) {
    var map = getHeaderMap(interactionsSheet);
    var rows = interactionsSheet.getRange(2, 1, interactionsSheet.getLastRow() - 1,
      interactionsSheet.getLastColumn()).getValues();
    rows.forEach(function(row) {
      if (row[map.type - 1] === "reconciled_sent" && row[map.message_id - 1]) {
        ids[String(row[map.message_id - 1])] = true;
      }
    });
  }
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

function computeNextFollowupDate_(action, sentAt) {
  var now = sentAt || new Date();
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
