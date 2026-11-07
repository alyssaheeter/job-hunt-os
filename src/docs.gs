function createArtifactsForJob(jobId) {
  var jobsSheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(jobsSheet, "job_id", jobId);
  if (rowIndex === -1) {
    throw new Error("Job not found: " + jobId);
  }
  var job = readRowByMap(jobsSheet, rowIndex);

  var settings = getAllSettings();
  var outputFolder = DriveApp.getFolderById(settings.OUTPUT_FOLDER_ID);

  var resumeCopy = DriveApp.getFileById(settings.RESUME_TEMPLATE_ID)
    .makeCopy("Resume - " + (job.company || "Company") + " - " + (job.role_title || "Role"), outputFolder);
  var coverCopy = DriveApp.getFileById(settings.COVER_LETTER_TEMPLATE_ID)
    .makeCopy("Cover - " + (job.company || "Company") + " - " + (job.role_title || "Role"), outputFolder);

  var result = {
    resumeDocId: resumeCopy.getId(),
    coverLetterDocId: coverCopy.getId(),
    fitScore: null,
    jobSummaryJson: "",
    aiResumeUsedFactsJson: "",
    aiCoverUsedFactsJson: ""
  };

  if (getBooleanSetting("AI_ENABLED", true)) {
    var facts = loadFactsCorpus(settings.FACTS_FOLDER_ID);
    var resumeResp = aiTailorResume({
      facts_text: facts.facts_text,
      job_fields: {
        company: job.company,
        role_title: job.role_title,
        url: job.url,
        job_description: job.job_description
      }
    });
    var coverResp = aiWriteCoverLetter({
      facts_text: facts.facts_text,
      job_fields: {
        company: job.company,
        role_title: job.role_title,
        url: job.url,
        job_description: job.job_description
      }
    });

    writeDocText_(result.resumeDocId, resumeResp.doc_text, resumeResp.missing_facts);
    writeDocText_(result.coverLetterDocId, coverResp.doc_text, coverResp.missing_facts);

    if (resumeResp.used_facts && resumeResp.used_facts.length > 0) {
      result.aiResumeUsedFactsJson = JSON.stringify(resumeResp.used_facts);
    } else {
      logEvent("WARN", "ai_resume_missing_used_facts", jobId, "", {});
    }
    if (coverResp.used_facts && coverResp.used_facts.length > 0) {
      result.aiCoverUsedFactsJson = JSON.stringify(coverResp.used_facts);
    } else {
      logEvent("WARN", "ai_cover_missing_used_facts", jobId, "", {});
    }
  } else {
    var replacements = buildPlaceholderMap_(job);
    replaceDocPlaceholders_(result.resumeDocId, replacements);
    replaceDocPlaceholders_(result.coverLetterDocId, replacements);
  }

  if (getBooleanSetting("FIT_SCORE_ENABLED", false)) {
    var fit = aiFitScore({
      job_fields: {
        company: job.company,
        role_title: job.role_title,
        url: job.url,
        job_description: job.job_description
      }
    });
    result.fitScore = fit.score;
  }

  if (job.job_description && job.job_summary_json !== undefined && getBooleanSetting("AI_ENABLED", true)) {
    var summary = aiSummarizeJob(job.job_description);
    result.jobSummaryJson = JSON.stringify(summary);
  }

  return result;
}

function writeDocText_(docId, docText, missingFacts) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  body.setText(docText || "");
  if (missingFacts && missingFacts.length > 0) {
    body.appendParagraph("\nMISSING FACTS");
    missingFacts.forEach(function(item) {
      body.appendListItem("[FILL-IN] " + item);
    });
  }
  doc.saveAndClose();
}

function replaceDocPlaceholders_(docId, replacements) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  Object.keys(replacements).forEach(function(key) {
    body.replaceText("\\[\\[" + key + "\\]\\]", replacements[key]);
  });
  doc.saveAndClose();
}

function buildPlaceholderMap_(job) {
  return {
    COMPANY: coerceString_(job.company),
    ROLE_TITLE: coerceString_(job.role_title),
    URL: coerceString_(job.url)
  };
}
