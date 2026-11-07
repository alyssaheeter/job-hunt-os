function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("JobOS")
    .addItem("Open Sidebar", "openSidebar")
    .addItem("RUN_ME_FIRST", "RUN_ME_FIRST")
    .addItem("Run First-Time Setup", "runMeFirst")
    .addSeparator()
    .addItem("Ingest Selected Job", "uiIngestSelected")
    .addItem("Apply to Selected Job", "uiApplySelected")
    .addItem("Archive Selected Job", "uiArchiveSelected")
    .addSeparator()
    .addItem("Draft Outreach (Selected Job)", "uiDraftOutreachSelected")
    .addItem("Draft Follow-up (Selected Task)", "uiDraftFollowupSelected")
    .addSeparator()
    .addItem("Install Triggers", "installTriggers")
    .addToUi();
}
