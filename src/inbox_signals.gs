function scanInboxForSignals() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return;
  }
  try {
    var settings = getAllSettings();
    var interactionsSheet = SpreadsheetApp.getActive().getSheetByName("INTERACTIONS");
    var jobsSheet = SpreadsheetApp.getActive().getSheetByName("JOBS");
    if (!interactionsSheet || !jobsSheet) {
      logEvent("WARN", "inbox_signal_missing_sheet", "", "", {
        interactions: !!interactionsSheet,
        jobs: !!jobsSheet
      });
      return;
    }

    var interactionHeaders = [
      "interaction_id",
      "ts",
      "direction",
      "from",
      "to",
      "subject",
      "thread_id",
      "message_id",
      "job_id",
      "type",
      "confidence",
      "needs_review",
      "url_found",
      "snippet"
    ];
    var jobHeaders = ["job_id", "url", "status", "date_added", "dedupe_key"];
    if (!hasRequiredHeaders_(interactionsSheet, interactionHeaders) || !hasRequiredHeaders_(jobsSheet, jobHeaders)) {
      logEvent("WARN", "inbox_signal_missing_headers", "", "", {
        interactions: getHeaderMap(interactionsSheet),
        jobs: getHeaderMap(jobsSheet)
      });
      return;
    }

    var query = buildInboxSignalQuery_(settings);
    var threads = GmailApp.search(query);
    var existingMessageIds = getExistingMessageIds_(interactionsSheet);

    threads.forEach(function(thread) {
      thread.getMessages().forEach(function(message) {
        if (!message.isInInbox()) {
          return;
        }
        var messageId = message.getId();
        if (existingMessageIds[messageId]) {
          return;
        }

        var body = message.getBody() || "";
        var plainBody = message.getPlainBody() || "";
        var tokens = parseTrackingToken_(body) || parseTrackingToken_(plainBody);
        var urlFound = extractUrl_(plainBody + "\n" + body);
        var normalizedUrl = urlFound ? normalizeJobUrl_(urlFound) : "";

        var jobId = "";
        var confidence = 0;
        var needsReview = false;

        if (tokens && tokens.job_id) {
          jobId = tokens.job_id;
          confidence = 95;
        } else if (normalizedUrl) {
          var jobResult = findOrCreateJobByUrl_(jobsSheet, normalizedUrl, urlFound);
          jobId = jobResult.jobId;
          confidence = jobResult.confidence;
        } else {
          needsReview = true;
          confidence = 20;
        }

        var interactionType = classifyInteractionType_(message, !!normalizedUrl);
        appendRowByMap(interactionsSheet, {
          interaction_id: generateId_("interaction"),
          ts: message.getDate(),
          direction: "inbound",
          from: message.getFrom() || "",
          to: message.getTo() || "",
          subject: message.getSubject() || "",
          thread_id: thread.getId(),
          message_id: messageId,
          job_id: jobId,
          type: interactionType,
          confidence: confidence,
          needs_review: needsReview,
          url_found: urlFound || "",
          snippet: buildSnippet_(plainBody)
        });
        existingMessageIds[messageId] = true;
      });
    });

    logEvent("INFO", "inbox_signal_scan_complete", "", "", { query: query, threads: threads.length });
  } catch (err) {
    logEvent("ERROR", "inbox_signal_scan_error", "", "", { error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function buildInboxSignalQuery_(settings) {
  var base = coerceString_(settings.INBOX_SCAN_QUERY || "").trim();
  var lookbackDays = getNumberSetting("INBOX_SCAN_LOOKBACK_DAYS", 2);
  if (!lookbackDays || lookbackDays < 1) {
    lookbackDays = 2;
  }

  var query = base.replace(/\bnewer_than:[^\s]+/gi, "").trim();
  if (!/\bin:inbox\b/i.test(query)) {
    query = ("in:inbox " + query).trim();
  }
  query = (query + " newer_than:" + lookbackDays + "d").trim();
  return query.replace(/\s+/g, " ").trim();
}

function hasRequiredHeaders_(sheet, requiredHeaders) {
  var headers = getHeaderMap(sheet);
  return requiredHeaders.every(function(header) {
    return headers[header];
  });
}

function getExistingMessageIds_(sheet) {
  var headerMap = getHeaderMap(sheet);
  var messageCol = headerMap.message_id;
  var existing = {};
  if (!messageCol || sheet.getLastRow() < 2) {
    return existing;
  }
  var values = sheet.getRange(2, messageCol, sheet.getLastRow() - 1, 1).getValues();
  values.forEach(function(row) {
    var value = String(row[0] || "").trim();
    if (value) {
      existing[value] = true;
    }
  });
  return existing;
}

function extractUrl_(content) {
  var match = String(content || "").match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : "";
}

function findOrCreateJobByUrl_(jobsSheet, normalizedUrl, originalUrl) {
  var rowIndex = findJobRowByDedupeKey_(jobsSheet, normalizedUrl);
  if (rowIndex !== -1) {
    var job = readRowByMap(jobsSheet, rowIndex);
    var updates = {};
    if (!job.url) {
      updates.url = originalUrl || normalizedUrl;
    }
    if (!job.normalized_url) {
      updates.normalized_url = normalizedUrl;
    }
    if (!job.raw_url && originalUrl) {
      updates.raw_url = originalUrl;
    }
    if (!job.dedupe_key) {
      updates.dedupe_key = buildUrlDedupeKey_(normalizedUrl);
    }
    if (Object.keys(updates).length) {
      updateRowByMap(jobsSheet, rowIndex, updates);
    }
    return { jobId: job.job_id, confidence: 70 };
  }

  var jobId = generateId_("job");
  appendRowByMap(jobsSheet, {
    job_id: jobId,
    raw_url: originalUrl || normalizedUrl,
    normalized_url: normalizedUrl,
    url: originalUrl || normalizedUrl,
    status: "lead",
    date_added: formatDate_(new Date()),
    dedupe_key: buildUrlDedupeKey_(normalizedUrl)
  });
  logEvent("INFO", "inbox_signal_job_created", jobId, "", { url: originalUrl || normalizedUrl });
  return { jobId: jobId, confidence: 75 };
}

function classifyInteractionType_(message, hasUrl) {
  if (hasUrl) {
    return "JOB_LINK";
  }
  var subject = (message.getSubject() || "").toLowerCase();
  var from = (message.getFrom() || "").toLowerCase();
  var body = (message.getPlainBody() || "").toLowerCase();

  if (/(interview|schedule|availability|calendly|zoom|phone screen)/.test(subject + " " + body)) {
    return "INTERVIEW";
  }
  if (/(recruiter|talent|sourcer|hiring team)/.test(subject + " " + from)) {
    return "RECRUITER";
  }
  if (/(connect|coffee chat|network|introduction)/.test(subject + " " + body)) {
    return "NETWORKING";
  }
  return "UNKNOWN";
}

function buildSnippet_(plainBody) {
  var snippet = String(plainBody || "").replace(/\s+/g, " ").trim();
  if (snippet.length > 200) {
    snippet = snippet.substring(0, 200);
  }
  return snippet;
}
