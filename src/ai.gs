function aiSummarizeJob(text) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return {
      bullets: [],
      key_skills: [],
      responsibilities: [],
      seniority: "",
      industry: "",
      notes: "AI disabled."
    };
  }
  var prompt = [
    "You are an assistant that summarizes job descriptions.",
    "Return JSON with keys: bullets (array), key_skills (array), responsibilities (array), seniority (string), industry (string), notes (string).",
    "Job description:",
    text
  ].join("\n");

  var response = callGemini_(prompt);
  if (!response) {
    return {
      bullets: [],
      key_skills: [],
      responsibilities: [],
      seniority: "",
      industry: "",
      notes: "AI error."
    };
  }
  var parsed = extractJson_(response);
  if (!parsed) {
    return {
      bullets: [],
      key_skills: [],
      responsibilities: [],
      seniority: "",
      industry: "",
      notes: "AI parse error."
    };
  }
  return parsed;
}

function aiExtractJobFromUrl(url, htmlOrNull, optionalText) {
  var optional = coerceString_(optionalText || "").trim();
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return deterministicJobExtract_(optional);
  }

  var htmlText = htmlOrNull ? stripHtml_(htmlOrNull) : "";
  var prompt = [
    "You extract job details from a URL or provided text.",
    "Return JSON with keys: company (string), role_title (string), job_description (string), source (string), confidence (number 0-100), needs_review (boolean).",
    "If data is missing or ambiguous, set needs_review true and keep fields blank.",
    "URL: " + (url || ""),
    "JOB_TEXT:",
    clipText_(optional || htmlText, 12000)
  ].join("\n");

  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed) {
    return deterministicJobExtract_(optional);
  }

  return {
    company: parsed.company || "",
    role_title: parsed.role_title || "",
    job_description: clipText_(parsed.job_description || optional || "", 20000),
    source: parsed.source || "url",
    confidence: Number(parsed.confidence || 0),
    needs_review: !parsed.company || !parsed.role_title || Number(parsed.confidence || 0) < 70 ||
      parsed.needs_review === true || String(parsed.needs_review || "").toLowerCase() === "true"
  };
}

function deterministicJobExtract_(optionalText) {
  return {
    company: "",
    role_title: "",
    job_description: optionalText || "",
    source: "manual",
    confidence: 0,
    needs_review: true
  };
}

function clipText_(text, maxLength) {
  var safeText = coerceString_(text || "");
  if (safeText.length <= maxLength) {
    return safeText;
  }
  return safeText.substring(0, maxLength);
}

function aiDraftOutreach(inputs) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return deterministicOutreach_(inputs);
  }
  var prompt = [
    "Draft a concise outreach email.",
    "Return JSON with keys: subject, body.",
    "Tone: " + (inputs.tone || "professional"),
    "Company: " + (inputs.company || ""),
    "Role: " + (inputs.role_title || ""),
    "URL: " + (inputs.url || ""),
    "Job description: " + (inputs.job_description || ""),
    "Signature: " + (inputs.signature || "")
  ].join("\n");
  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed || !parsed.subject || !parsed.body) {
    return deterministicOutreach_(inputs);
  }
  return parsed;
}

function aiDraftFollowup(inputs) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return deterministicFollowup_(inputs);
  }
  var prompt = [
    "Draft a concise follow-up email.",
    "Return JSON with keys: subject, body.",
    "Tone: " + (inputs.tone || "professional"),
    "Company: " + (inputs.company || ""),
    "Role: " + (inputs.role_title || ""),
    "URL: " + (inputs.url || ""),
    "Job description: " + (inputs.job_description || ""),
    "Signature: " + (inputs.signature || "")
  ].join("\n");
  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed || !parsed.subject || !parsed.body) {
    return deterministicFollowup_(inputs);
  }
  return parsed;
}

function aiFitScore(inputs) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return { score: 0, rationale_bullets: [], gaps: [], keywords: [] };
  }
  var prompt = [
    "Score fit from 0-100 based on job description only.",
    "Return JSON with keys: score (number), rationale_bullets (array), gaps (array), keywords (array).",
    "Company: " + (inputs.job_fields.company || ""),
    "Role: " + (inputs.job_fields.role_title || ""),
    "URL: " + (inputs.job_fields.url || ""),
    "Job description: " + (inputs.job_fields.job_description || "")
  ].join("\n");
  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed) {
    return { score: 0, rationale_bullets: [], gaps: [], keywords: [] };
  }
  return parsed;
}

function aiTailorResume(inputs) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return { doc_text: "", missing_facts: [], used_facts: [] };
  }
  var prompt = buildFactsPrompt_("resume", inputs);
  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed || !parsed.doc_text) {
    logEvent("WARN", "ai_resume_error", "", "", { response: response || "" });
    return { doc_text: "", missing_facts: ["[FILL-IN]"], used_facts: [] };
  }
  return normalizeFactsResponse_(parsed);
}

function aiWriteCoverLetter(inputs) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return { doc_text: "", missing_facts: [], used_facts: [] };
  }
  var prompt = buildFactsPrompt_("cover", inputs);
  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed || !parsed.doc_text) {
    logEvent("WARN", "ai_cover_error", "", "", { response: response || "" });
    return { doc_text: "", missing_facts: ["[FILL-IN]"], used_facts: [] };
  }
  return normalizeFactsResponse_(parsed);
}

function loadFactsCorpus(factsFolderId) {
  var result = { facts_text: "", sources: [] };
  if (!factsFolderId) {
    logEvent("WARN", "facts_folder_missing", "", "", {});
    return result;
  }
  var folder = DriveApp.getFolderById(factsFolderId);
  var files = folder.getFiles();
  var chunks = [];
  var total = 0;
  var maxLength = 60000;
  while (files.hasNext()) {
    var file = files.next();
    var mimeType = file.getMimeType();
    var text = "";
    if (mimeType === "application/vnd.google-apps.document") {
      text = DocumentApp.openById(file.getId()).getBody().getText();
    } else if (mimeType.indexOf("text/") === 0) {
      text = file.getBlob().getDataAsString();
    } else {
      continue;
    }
    if (!text) continue;
    result.sources.push({ fileId: file.getId(), name: file.getName(), mimeType: mimeType });
    if (total + text.length > maxLength) {
      var remaining = maxLength - total;
      chunks.push(text.substring(0, remaining));
      total = maxLength;
      logEvent("WARN", "facts_truncated", "", "", { maxLength: maxLength });
      break;
    }
    chunks.push(text);
    total += text.length;
  }
  result.facts_text = chunks.join("\n\n");
  return result;
}

function buildFactsPrompt_(docType, inputs) {
  return [
    "You are generating a " + docType + " using ONLY the provided facts and the current job fields.",
    "Do NOT invent credentials, employers, degrees, metrics, dates, tools, or achievements.",
    "If facts are insufficient, include [FILL-IN] placeholders and list missing_facts.",
    "Return JSON with keys: doc_text (string), missing_facts (array), used_facts (array).",
    "FACTS:",
    inputs.facts_text || "",
    "JOB_FIELDS:",
    JSON.stringify(inputs.job_fields || {})
  ].join("\n");
}

function normalizeFactsResponse_(parsed) {
  return {
    doc_text: parsed.doc_text || "",
    missing_facts: parsed.missing_facts || [],
    used_facts: parsed.used_facts || []
  };
}

function extractJson_(text) {
  if (!text) return null;
  var start = text.indexOf("{");
  var end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  var jsonText = text.substring(start, end + 1);
  return parseJsonSafe_(jsonText, null);
}

function callGemini_(prompt) {
  try {
    var settings = getAllSettings();
    var model = settings.AI_MODEL || "";
    var apiKey = PropertiesService.getScriptProperties().getProperty("AI_API_KEY");
    if (!apiKey) {
      logEvent("WARN", "ai_missing_api_key", "", "", {});
      return null;
    }
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    var payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: Number(settings.MAX_OUTPUT_TOKENS || 900),
        temperature: Number(settings.TEMPERATURE || 0.3)
      }
    };
    var response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    var text = response.getContentText();
    if (code >= 300) {
      logEvent("WARN", "ai_http_error", "", "", { code: code, body: text });
      return null;
    }
    var parsed = parseJsonSafe_(text, null);
    if (!parsed || !parsed.candidates || !parsed.candidates.length) {
      return null;
    }
    var parts = parsed.candidates[0].content.parts || [];
    return parts.map(function(part) { return part.text || ""; }).join("\n");
  } catch (err) {
    logEvent("WARN", "ai_exception", "", "", { error: String(err) });
    return null;
  }
}

function deterministicOutreach_(inputs) {
  var subject = "Interest in " + (inputs.role_title || "the role") + " at " + (inputs.company || "your company");
  var body = [
    "Hello,",
    "",
    "I am interested in the " + (inputs.role_title || "role") + " at " + (inputs.company || "your company") + ".",
    "I reviewed the job posting here: " + (inputs.url || ""),
    "",
    "If helpful, I can share more details about my background.",
    "",
    inputs.signature || ""
  ].join("\n");
  return { subject: subject, body: body };
}

function deterministicFollowup_(inputs) {
  var subject = "Following up on " + (inputs.role_title || "the role") + " at " + (inputs.company || "your company");
  var body = [
    "Hello,",
    "",
    "I wanted to follow up on my interest in the " + (inputs.role_title || "role") + " at " + (inputs.company || "your company") + ".",
    "Job posting: " + (inputs.url || ""),
    "",
    "Thank you for your time.",
    "",
    inputs.signature || ""
  ].join("\n");
  return { subject: subject, body: body };
}
