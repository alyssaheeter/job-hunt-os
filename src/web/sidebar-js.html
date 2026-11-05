const byId = (id) => document.getElementById(id);
const refreshBtn = byId("refreshBtn");
const ingestForm = byId("ingestForm");
const ingestResult = byId("ingestResult");
const kpiGrid = byId("kpiGrid");
const tasksList = byId("tasksList");
const reviewList = byId("reviewList");
const logsList = byId("logsList");
const jobsList = byId("jobsList");
const settingsStatus = byId("settingsStatus");
const settingsMissing = byId("settingsMissing");
const detailCard = byId("jobDetailCard");
const detailResult = byId("detailResult");

function clear(node) { node.replaceChildren(); }
function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value !== undefined && value !== null) node.textContent = String(value);
  if (className) node.className = className;
  return node;
}
function showError(target, error) {
  target.textContent = `Error: ${error && error.message ? error.message : error}`;
}

function renderKpis(kpis) {
  clear(kpiGrid);
  [["Total Jobs", kpis.jobs_total], ["Active Jobs", kpis.jobs_active],
    ["Needs Review", kpis.jobs_needs_review], ["Open Tasks", kpis.tasks_open]]
    .forEach(([label, value]) => {
      const card = element("div", null, "kpi");
      card.append(element("strong", value ?? 0), element("div", label, "muted"));
      kpiGrid.appendChild(card);
    });
}

function renderRows(container, items, renderer) {
  clear(container);
  if (!items || items.length === 0) {
    container.appendChild(element("div", "No items.", "muted"));
    return;
  }
  items.forEach((item) => {
    const row = element("div", null, "list-item");
    renderer(row, item);
    container.appendChild(row);
  });
}

function renderDashboard(data) {
  renderKpis(data.kpis || {});
  renderRows(tasksList, data.priority_tasks, (row, task) => {
    row.append(element("strong", task.task_type || "task"),
      document.createTextNode(` · ${task.status || ""}`),
      element("div", `Due: ${task.due_date || "—"}`, "muted"));
  });
  renderRows(reviewList, data.needs_review, (row, job) => {
    row.append(element("strong", job.company || "Unknown company"),
      document.createTextNode(` — ${job.role_title || "Role"}`), element("div", job.url || "", "muted"));
  });
  renderRows(logsList, data.recent_logs, (row, log) => {
    row.append(element("strong", log.level || ""), document.createTextNode(` ${log.action || ""}`),
      element("div", log.timestamp || "", "muted"));
  });
}

function refreshDashboard() {
  google.script.run.withSuccessHandler(renderDashboard)
    .withFailureHandler((error) => showError(ingestResult, error)).uiGetDashboardData();
}

function refreshJobs() {
  const filters = { text: byId("jobSearch").value.trim(), status: byId("jobStatus").value };
  google.script.run.withSuccessHandler((jobs) => {
    renderRows(jobsList, jobs, (row, job) => {
      const button = element("button", null, "job-button");
      button.type = "button";
      button.append(element("strong", job.company || "Unknown company"),
        document.createTextNode(` — ${job.role_title || "Untitled role"}`),
        element("div", job.status || "new", "muted"));
      button.addEventListener("click", () => openJob(job.job_id));
      row.appendChild(button);
    });
  }).withFailureHandler((error) => showError(ingestResult, error)).uiGetJobs(filters);
}

function openJob(jobId) {
  detailResult.textContent = "Loading…";
  detailCard.classList.remove("hidden");
  google.script.run.withSuccessHandler(({ job }) => {
    byId("detailJobId").value = job.job_id || "";
    byId("detailCompany").value = job.company || "";
    byId("detailRole").value = job.role_title || "";
    byId("detailStatus").value = job.status || "";
    byId("detailContact").value = job.contact_email || "";
    byId("detailDescription").value = job.job_description || "";
    detailResult.textContent = "";
    detailCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }).withFailureHandler((error) => showError(detailResult, error)).uiGetJobDetail(jobId);
}

function refreshSettings() {
  google.script.run.withSuccessHandler((data) => {
    clear(settingsMissing);
    settingsStatus.textContent = data.missing.length ? "Missing settings" :
      (data.ai_enabled && !data.ai_key_present ? "Missing AI key" : "Healthy");
    data.missing.forEach((item) => settingsMissing.appendChild(element("li", item)));
  }).withFailureHandler((error) => showError(settingsMissing, error)).uiValidateSettings();
}

function refreshAll() { refreshDashboard(); refreshJobs(); refreshSettings(); }
function runJobAction(method, pendingMessage) {
  detailResult.textContent = pendingMessage;
  google.script.run.withSuccessHandler(() => {
    detailResult.textContent = "Done.";
    refreshAll();
  }).withFailureHandler((error) => showError(detailResult, error))[method](byId("detailJobId").value);
}

ingestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ingestResult.textContent = "Ingesting…";
  google.script.run.withSuccessHandler((data) => {
    ingestResult.textContent = data.message || "Job ingested.";
    refreshAll();
    openJob(data.job_id);
  }).withFailureHandler((error) => showError(ingestResult, error))
    .uiIngestUrl(byId("jobUrl").value.trim(), byId("jobText").value.trim());
});

byId("jobDetailForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const patch = { company: byId("detailCompany").value.trim(), role_title: byId("detailRole").value.trim(),
    status: byId("detailStatus").value.trim(), contact_email: byId("detailContact").value.trim(),
    job_description: byId("detailDescription").value, needs_review: false };
  detailResult.textContent = "Saving…";
  google.script.run.withSuccessHandler(() => { detailResult.textContent = "Saved."; refreshAll(); })
    .withFailureHandler((error) => showError(detailResult, error)).uiUpdateJob(byId("detailJobId").value, patch);
});

refreshBtn.addEventListener("click", refreshAll);
byId("jobSearch").addEventListener("input", refreshJobs);
byId("jobStatus").addEventListener("change", refreshJobs);
byId("closeDetailBtn").addEventListener("click", () => detailCard.classList.add("hidden"));
byId("artifactsBtn").addEventListener("click", () => runJobAction("uiCreateArtifacts", "Creating artifacts…"));
byId("outreachBtn").addEventListener("click", () => runJobAction("uiDraftOutreach", "Creating draft…"));
byId("archiveBtn").addEventListener("click", () => runJobAction("uiArchiveJob", "Archiving…"));
refreshAll();
