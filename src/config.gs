var JOBOS_DEFAULT_SETTINGS = {
  TEMPLATES_FOLDER_ID: "",
  RESUME_TEMPLATE_ID: "",
  COVER_LETTER_TEMPLATE_ID: "",
  OUTPUT_FOLDER_ID: "",
  FACTS_FOLDER_ID: "",
  GMAIL_LABEL_PREFIX: "JOBOS",
  ENABLE_AUTO_SEND: "false",
  FOLLOW_UP_DAYS_1: "3",
  FOLLOW_UP_DAYS_2: "7",
  FOLLOW_UP_DAYS_3: "14",
  SIGNATURE_BLOCK: "",
  DEFAULT_EMAIL_TONE: "professional",
  AI_ENABLED: "true",
  AI_PROVIDER: "gemini_api",
  AI_MODEL: "[FILL-IN]",
  FIT_SCORE_ENABLED: "false",
  FIT_SCORE_THRESHOLD: "75",
  MAX_OUTPUT_TOKENS: "900",
  TEMPERATURE: "0.3",
  INBOX_SCAN_QUERY: "newer_than:2d (subject:(interview OR opportunity OR recruiter OR role OR position OR application OR hiring OR \"next steps\") OR \"linkedin.com/jobs/view\" OR greenhouse.io OR lever.co OR workday OR ashbyhq OR smartrecruiters)",
  INBOX_SCAN_LOOKBACK_DAYS: "2"
};

function getSettingsSheet_() {
  return SpreadsheetApp.getActive().getSheetByName("SETTINGS");
}

function getSetting(key) {
  var settings = getAllSettings();
  return settings[key];
}

function getAllSettings() {
  var settings = getSettingsFromSheet_();
  Object.keys(JOBOS_DEFAULT_SETTINGS).forEach(function(key) {
    if (settings[key] === undefined || settings[key] === "") {
      settings[key] = JOBOS_DEFAULT_SETTINGS[key];
    }
  });
  return settings;
}

function getSettingsFromSheet_() {
  var sheet = getSettingsSheet_();
  if (!sheet) {
    return {};
  }
  var range = sheet.getDataRange();
  var values = range.getValues();
  var settings = {};
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var k = String(row[0] || "").trim();
    var v = String(row[1] || "");
    if (k) {
      settings[k] = v;
    }
  }
  return settings;
}

function getBooleanSetting(key, defaultValue) {
  var value = String(getSetting(key) || "").toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue === true;
}

function getNumberSetting(key, defaultValue) {
  var value = Number(getSetting(key));
  if (isNaN(value)) return defaultValue;
  return value;
}

function getSignatureBlock_() {
  var sig = getSetting("SIGNATURE_BLOCK") || "";
  return sig;
}
