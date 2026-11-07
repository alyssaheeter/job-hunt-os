function handleOnEdit(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return;
  }
  try {
    if (!e || !e.range) {
      return;
    }
    var sheet = e.range.getSheet();
    if (sheet.getName() !== "JOBS") {
      return;
    }
    var row = e.range.getRow();
    if (row <= 1) {
      return;
    }
    var headerMap = getHeaderMap(sheet);
    var columnName = getHeaderForColumn_(headerMap, e.range.getColumn());
    if (!columnName) {
      return;
    }
    var actionConfig = getJobCheckboxActionConfig_();
    var config = actionConfig[columnName];
    if (!config) {
      return;
    }
    if (!isCheckboxValueTrue_(e.range.getValue())) {
      return;
    }
    processJobCheckboxAction_(sheet, row, e.range.getColumn(), config);
  } catch (err) {
    logEvent("ERROR", "on_edit_error", "", "", { error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getJobCheckboxActionConfig_() {
  return {
    DO_RESEARCH: {
      statusField: "RESEARCH_STATUS",
      updatedAtField: "RESEARCH_UPDATED_AT",
      handler: handleResearchAction_
    },
    DO_APPLY: {
      statusField: "APPLY_STATUS",
      updatedAtField: "APPLY_UPDATED_AT",
      handler: handleApplyAction_
    },
    DO_DRAFT_OUTREACH: {
      statusField: "DRAFT_OUTREACH_STATUS",
      updatedAtField: "DRAFT_OUTREACH_UPDATED_AT",
      handler: handleDraftOutreachAction_
    },
    DO_DRAFT_FOLLOWUP: {
      statusField: "DRAFT_FOLLOWUP_STATUS",
      updatedAtField: "DRAFT_FOLLOWUP_UPDATED_AT",
      handler: handleDraftFollowupAction_
    }
  };
}

function processJobCheckboxAction_(sheet, row, columnIndex, config) {
  var rowData = readRowByMap(sheet, row);
  var jobId = rowData.job_id;
  if (!jobId) {
    var errorUpdates = { LAST_ACTION_ERROR: "Missing job_id. Ingest the job first." };
    errorUpdates[config.statusField] = "ERROR";
    updateRowByMap(sheet, row, errorUpdates);
    logEvent("ERROR", "checkbox_missing_job_id", "", "", { action: config.statusField });
    sheet.getRange(row, columnIndex).setValue(false);
    return;
  }

  var status = String(rowData[config.statusField] || "").toUpperCase();
  if (status === "DONE") {
    sheet.getRange(row, columnIndex).setValue(false);
    return;
  }

  var progressUpdates = { LAST_ACTION_ERROR: "" };
  progressUpdates[config.statusField] = "IN_PROGRESS";
  updateRowByMap(sheet, row, progressUpdates);

  try {
    var updates = config.handler(rowData, row) || {};
    updates[config.statusField] = "DONE";
    updates[config.updatedAtField] = new Date();
    updates.LAST_ACTION_ERROR = "";
    updateRowByMap(sheet, row, updates);
  } catch (err) {
    var errorUpdate = { LAST_ACTION_ERROR: String(err) };
    errorUpdate[config.statusField] = "ERROR";
    updateRowByMap(sheet, row, errorUpdate);
    logEvent("ERROR", "checkbox_action_error", jobId, "", {
      action: config.statusField,
      error: String(err)
    });
  } finally {
    sheet.getRange(row, columnIndex).setValue(false);
  }
}

function handleResearchAction_(rowData) {
  runDecisionBriefFast_(rowData);
  return {};
}

function handleApplyAction_(rowData) {
  applyJob(rowData.job_id);
  ensureFollowupTaskForJob_(rowData.job_id);
  return {};
}

function handleDraftOutreachAction_(rowData) {
  var draftId = createOutreachDraftForJob(rowData.job_id);
  return { outreach_draft_id: draftId };
}

function handleDraftFollowupAction_(rowData) {
  var taskId = getOrCreateFollowupTaskForJob_(rowData.job_id);
  createFollowupDraftForTask(taskId);
  return {};
}

function getHeaderForColumn_(headerMap, columnIndex) {
  var header = "";
  Object.keys(headerMap).some(function(key) {
    if (headerMap[key] === columnIndex) {
      header = key;
      return true;
    }
    return false;
  });
  return header;
}

function isCheckboxValueTrue_(value) {
  return value === true || String(value).toUpperCase() === "TRUE";
}
