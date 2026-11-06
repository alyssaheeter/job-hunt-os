function uiIngestSelected() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== "JOBS") {
    SpreadsheetApp.getUi().alert("Please select a row in the JOBS sheet.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a data row.");
    return;
  }
  try {
    ingestJobFromRow_(row);
    SpreadsheetApp.getUi().alert("Job ingested.");
  } catch (err) {
    logEvent("ERROR", "ui_ingest", "", "", { error: String(err) });
    SpreadsheetApp.getUi().alert("Error: " + err.message);
  }
}

function openSidebar() {
  var html = HtmlService.createTemplateFromFile("web/sidebar").evaluate()
    .setTitle("JobOS");
  SpreadsheetApp.getUi().showSidebar(html);
}

function include_(path) {
  return HtmlService.createHtmlOutputFromFile(path).getContent();
}

// google.script.run cannot transport Date values, including nested sheet cells.
function sidebarResponse_(value) {
  return JSON.parse(JSON.stringify(value));
}

function uiGetDashboardData() {
  var jobsSheet = getSheetOrThrow_("JOBS");
  var tasksSheet = getSheetOrThrow_("TASKS");
  var logsSheet = getSheetOrThrow_("LOGS");

  var jobs = readAllRowsByMap_(jobsSheet, 500);
  var tasks = readAllRowsByMap_(tasksSheet, 500);
  var logs = readAllRowsByMap_(logsSheet, 500);

  var needsReviewAll = jobs.filter(function(job) { return isTruthy_(job.needs_review); });
  var needsReview = needsReviewAll.slice(0, 10);
  var openTasks = tasks.filter(function(task) {
    return String(task.status || "").toLowerCase() !== "done";
  });
  var priorityTasks = openTasks.sort(function(a, b) {
    return String(a.due_date || "").localeCompare(String(b.due_date || ""));
  }).slice(0, 10);

  var kpis = {
    jobs_total: jobs.length,
    jobs_active: jobs.filter(function(job) { return String(job.status || "").toLowerCase() !== "archived"; }).length,
    jobs_needs_review: needsReviewAll.length,
    tasks_open: openTasks.length
  };

  return sidebarResponse_({
    kpis: kpis,
    priority_tasks: priorityTasks,
    needs_review: needsReview,
    recent_logs: logs.slice(-10).reverse()
  });
}

function uiGetJobs(filters) {
  var sheet = getSheetOrThrow_("JOBS");
  var rows = readAllRowsByMap_(sheet, 500);
  var text = filters && filters.text ? String(filters.text).toLowerCase() : "";
  var status = filters && filters.status ? String(filters.status).toLowerCase() : "";
  return sidebarResponse_(rows.filter(function(row) {
    if (status && String(row.status || "").toLowerCase() !== status) {
      return false;
    }
    if (text) {
      var haystack = [row.company, row.role_title, row.url].join(" ").toLowerCase();
      return haystack.indexOf(text) !== -1;
    }
    return true;
  }));
}

function uiGetJobDetail(jobId) {
  var jobsSheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(jobsSheet, "job_id", jobId);
  if (rowIndex === -1) {
    throw new Error("Job not found.");
  }
  var job = readRowByMap(jobsSheet, rowIndex);
  var tasksSheet = getSheetOrThrow_("TASKS");
  var tasks = readAllRowsByMap_(tasksSheet, 500).filter(function(task) {
    return String(task.job_id) === String(jobId);
  });
  return sidebarResponse_({ job: job, tasks: tasks });
}

function uiUpdateJob(jobId, patch) {
  var allowlist = {
    company: true,
    role_title: true,
    status: true,
    job_description: true,
    source: true,
    needs_review: true,
    contact_email: true,
    next_follow_up_date: true
  };
  var jobsSheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(jobsSheet, "job_id", jobId);
  if (rowIndex === -1) {
    throw new Error("Job not found.");
  }
  var updates = {};
  Object.keys(patch || {}).forEach(function(key) {
    if (allowlist[key]) {
      updates[key] = patch[key];
    }
  });
  if (Object.keys(updates).length === 0) {
    return { status: "no_changes" };
  }
  updateRowByMap(jobsSheet, rowIndex, updates);
  return { status: "updated" };
}

function uiArchiveJob(jobId) {
  var jobsSheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(jobsSheet, "job_id", jobId);
  if (rowIndex === -1) {
    throw new Error("Job not found.");
  }
  updateRowByMap(jobsSheet, rowIndex, { status: "archived" });
  return { status: "archived" };
}

function uiCreateArtifacts(jobId) {
  applyJob(jobId);
  return { status: "ok" };
}

function uiDraftOutreach(jobId) {
  var draftId = createOutreachDraftForJob(jobId);
  var jobsSheet = getSheetOrThrow_("JOBS");
  var rowIndex = findRowById_(jobsSheet, "job_id", jobId);
  if (rowIndex !== -1) {
    updateRowByMap(jobsSheet, rowIndex, { outreach_draft_id: draftId });
  }
  return { status: "ok", draft_id: draftId };
}

function uiDraftFollowup(taskId) {
  var draftId = createFollowupDraftForTask(taskId);
  return { status: "ok", draft_id: draftId };
}

function uiGetTasks(filters) {
  return sidebarResponse_(getTasksByFilters_(filters));
}

function uiValidateSettings() {
  var settings = getAllSettings();
  var required = [
    "TEMPLATES_FOLDER_ID",
    "RESUME_TEMPLATE_ID",
    "COVER_LETTER_TEMPLATE_ID",
    "OUTPUT_FOLDER_ID",
    "FACTS_FOLDER_ID",
    "GMAIL_LABEL_PREFIX"
  ];
  var aiEnabled = getBooleanSetting("AI_ENABLED", true);
  if (aiEnabled) required.push("AI_MODEL");
  var missing = required.filter(function(key) {
    return !settings[key] || /^\[FILL-IN/.test(String(settings[key]));
  });
  var apiKey = PropertiesService.getScriptProperties().getProperty("AI_API_KEY");
  return {
    missing: missing,
    ai_enabled: aiEnabled,
    ai_key_present: !!apiKey
  };
}

function uiApplySelected() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== "JOBS") {
    SpreadsheetApp.getUi().alert("Please select a row in the JOBS sheet.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a data row.");
    return;
  }
  try {
    var job = readRowByMap(sheet, row);
    if (!job.job_id) {
      SpreadsheetApp.getUi().alert("Missing job_id. Ingest the job first.");
      return;
    }
    applyJob(job.job_id);
    SpreadsheetApp.getUi().alert("Artifacts created.");
  } catch (err) {
    logEvent("ERROR", "ui_apply", "", "", { error: String(err) });
    SpreadsheetApp.getUi().alert("Error: " + err.message);
  }
}

function uiArchiveSelected() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== "JOBS") {
    SpreadsheetApp.getUi().alert("Please select a row in the JOBS sheet.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a data row.");
    return;
  }
  try {
    updateRowByMap(sheet, row, { status: "archived" });
    SpreadsheetApp.getUi().alert("Job archived.");
  } catch (err) {
    logEvent("ERROR", "ui_archive", "", "", { error: String(err) });
    SpreadsheetApp.getUi().alert("Error: " + err.message);
  }
}

function uiDraftOutreachSelected() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== "JOBS") {
    SpreadsheetApp.getUi().alert("Please select a row in the JOBS sheet.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a data row.");
    return;
  }
  try {
    var job = readRowByMap(sheet, row);
    if (!job.job_id) {
      SpreadsheetApp.getUi().alert("Missing job_id. Ingest the job first.");
      return;
    }
    var draftId = createOutreachDraftForJob(job.job_id);
    updateRowByMap(sheet, row, { outreach_draft_id: draftId });
    SpreadsheetApp.getUi().alert("Outreach draft created.");
  } catch (err) {
    logEvent("ERROR", "ui_draft_outreach", "", "", { error: String(err) });
    SpreadsheetApp.getUi().alert("Error: " + err.message);
  }
}

function uiDraftFollowupSelected() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== "TASKS") {
    SpreadsheetApp.getUi().alert("Please select a row in the TASKS sheet.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a data row.");
    return;
  }
  try {
    var task = readRowByMap(sheet, row);
    if (!task.task_id) {
      SpreadsheetApp.getUi().alert("Missing task_id.");
      return;
    }
    var draftId = createFollowupDraftForTask(task.task_id);
    updateRowByMap(sheet, row, { draft_id: draftId, updated_at: new Date() });
    SpreadsheetApp.getUi().alert("Follow-up draft created.");
  } catch (err) {
    logEvent("ERROR", "ui_draft_followup", "", "", { error: String(err) });
    SpreadsheetApp.getUi().alert("Error: " + err.message);
  }
}
