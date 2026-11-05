function ingestJobFromRow_(rowIndex) {
  var sheet = getSheetOrThrow_("JOBS");
  var row = readRowByMap(sheet, rowIndex);
  if (!row.url) {
    throw new Error("Job URL is required.");
  }
  var updates = {};
  var normalizedUrl = normalizeJobUrl_(row.url);
  if (!row.job_id) {
    updates.job_id = generateId_("job");
  }
  if (!row.status) {
    updates.status = "new";
  }
  if (!row.date_added) {
    updates.date_added = formatDate_(new Date());
  }

  if (!row.raw_url) {
    updates.raw_url = row.url;
  }
  if (!row.normalized_url && normalizedUrl) {
    updates.normalized_url = normalizedUrl;
  }

  var dedupeKey = row.dedupe_key || buildUrlDedupeKey_(normalizedUrl || row.url);
  updates.dedupe_key = dedupeKey;

  if (getBooleanSetting("AI_ENABLED", true) && row.job_description && row.job_summary_json !== undefined) {
    var summary = aiSummarizeJob(row.job_description);
    updates.job_summary_json = JSON.stringify(summary);
  }

  if (Object.keys(updates).length > 0) {
    updateRowByMap(sheet, rowIndex, updates);
  }

  logEvent("INFO", "job_ingested", updates.job_id || row.job_id, "", { url: row.url });
}

function applyJob(jobId) {
  var sheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(sheet, "job_id", jobId);
  if (rowIndex === -1) {
    throw new Error("Job not found: " + jobId);
  }
  var result = createArtifactsForJob(jobId);
  var updates = {
    resume_doc_id: result.resumeDocId,
    cover_letter_doc_id: result.coverLetterDocId
  };
  if (result.fitScore !== null && result.fitScore !== undefined) {
    updates.fit_score = result.fitScore;
  }
  if (result.jobSummaryJson) {
    updates.job_summary_json = result.jobSummaryJson;
  }
  if (result.aiResumeUsedFactsJson) {
    updates.ai_resume_used_facts_json = result.aiResumeUsedFactsJson;
  }
  if (result.aiCoverUsedFactsJson) {
    updates.ai_cover_used_facts_json = result.aiCoverUsedFactsJson;
  }
  updateRowByMap(sheet, rowIndex, updates);
  logEvent("INFO", "job_applied", jobId, "", { resumeDocId: result.resumeDocId, coverLetterDocId: result.coverLetterDocId });
}
