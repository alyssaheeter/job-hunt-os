function runDecisionBriefFast_(rowData) {
  var sources = buildDecisionBriefSources_(rowData);
  var fetchedSources = sources.map(function(source) {
    return fetchSourceForBrief_(source);
  }).filter(function(source) {
    return source && source.text;
  });

  var brief = aiDecisionBriefFast_(rowData, fetchedSources);
  if (!brief) {
    throw new Error("Decision brief generation failed.");
  }

  var researchSheet = getSheetOrThrow_("RESEARCH");
  var researchRow = findRowById_(researchSheet, "job_id", rowData.job_id);
  var payload = {
    job_id: rowData.job_id,
    company: rowData.company || "",
    role: rowData.role_title || "",
    research_status: "DONE",
    culture_summary: coerceString_(brief.culture_summary),
    pay_summary: coerceString_(brief.pay_summary),
    benefits_summary: coerceString_(brief.benefits_summary),
    location_notes: coerceString_(brief.location_notes),
    interview_process_notes: coerceString_(brief.interview_process_notes),
    pros: normalizeListField_(brief.pros),
    cons: normalizeListField_(brief.cons),
    red_flags: normalizeListField_(brief.red_flags),
    questions_to_ask: normalizeListField_(brief.questions_to_ask),
    sources_json: JSON.stringify(brief.sources || fetchedSources),
    generated_at: new Date()
  };

  if (researchRow === -1) {
    appendRowByMap(researchSheet, payload);
  } else {
    updateRowByMap(researchSheet, researchRow, payload);
  }

  logEvent("INFO", "decision_brief_fast", rowData.job_id, "", {
    sources: (brief.sources || []).length
  });
}

function buildDecisionBriefSources_(rowData) {
  var sources = [];
  var jobUrl = rowData.url || "";
  var baseUrl = "";
  if (jobUrl && !isJobBoardUrl_(jobUrl)) {
    baseUrl = getBaseUrl_(jobUrl);
    if (baseUrl) {
      sources.push({ url: baseUrl, label: "company_site" });
      sources.push({ url: baseUrl + "/careers", label: "careers" });
      sources.push({ url: baseUrl + "/about", label: "culture" });
    } else {
      sources.push({ url: jobUrl, label: "job_page" });
    }
  }

  if (!baseUrl && rowData.company) {
    baseUrl = guessCompanyBaseUrl_(rowData.company);
    if (baseUrl) {
      sources.push({ url: baseUrl, label: "company_site" });
      sources.push({ url: baseUrl + "/careers", label: "careers" });
      sources.push({ url: baseUrl + "/about", label: "culture" });
    }
  }

  var salaryUrl = buildSalarySignalUrl_(rowData.role_title);
  if (salaryUrl) {
    sources.push({ url: salaryUrl, label: "salary" });
  }

  return sources.slice(0, 4);
}

function fetchSourceForBrief_(source) {
  var url = source.url;
  try {
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    var code = response.getResponseCode();
    var content = response.getContentText() || "";
    if (code >= 300 || !content) {
      return { url: url, status: code, text: "" };
    }
    var title = extractTitle_(content);
    var text = stripHtml_(content);
    return {
      url: url,
      title: title,
      status: code,
      text: text.substring(0, 4000)
    };
  } catch (err) {
    return { url: url, status: "error", text: "", error: String(err) };
  }
}

function aiDecisionBriefFast_(rowData, sources) {
  if (!getBooleanSetting("AI_ENABLED", true)) {
    return buildDecisionBriefFallback_();
  }
  var prompt = [
    "You are generating a decision brief for a job opportunity.",
    "Use ONLY the provided sources. Do not browse.",
    "Return JSON ONLY with keys:",
    "culture_summary, pay_summary, benefits_summary, location_notes, interview_process_notes,",
    "pros (array), cons (array), red_flags (array), questions_to_ask (array), sources (array of {url, title}).",
    "Every sentence must include a source URL in parentheses, e.g. (source: https://example.com).",
    "If data is missing, use [FILL-IN] and explain in questions_to_ask with a source placeholder.",
    "Job fields:",
    JSON.stringify({
      company: rowData.company || "",
      role_title: rowData.role_title || "",
      url: rowData.url || ""
    }),
    "Sources:",
    sources.map(function(source, index) {
      return [
        "SOURCE " + (index + 1) + ": " + source.url,
        "TITLE: " + (source.title || ""),
        "CONTENT:",
        source.text || ""
      ].join("\n");
    }).join("\n\n")
  ].join("\n");

  var response = callGemini_(prompt);
  var parsed = response ? extractJson_(response) : null;
  if (!parsed) {
    return null;
  }
  if (!parsed.sources) {
    parsed.sources = sources.map(function(source) {
      return { url: source.url, title: source.title || "" };
    });
  }
  return parsed;
}

function buildDecisionBriefFallback_() {
  return {
    culture_summary: "[FILL-IN] (source: [FILL-IN])",
    pay_summary: "[FILL-IN] (source: [FILL-IN])",
    benefits_summary: "[FILL-IN] (source: [FILL-IN])",
    location_notes: "[FILL-IN] (source: [FILL-IN])",
    interview_process_notes: "[FILL-IN] (source: [FILL-IN])",
    pros: ["[FILL-IN] (source: [FILL-IN])"],
    cons: ["[FILL-IN] (source: [FILL-IN])"],
    red_flags: ["[FILL-IN] (source: [FILL-IN])"],
    questions_to_ask: ["[FILL-IN] (source: [FILL-IN])"],
    sources: []
  };
}

function normalizeListField_(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return coerceString_(value);
}

function extractTitle_(html) {
  var match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function stripHtml_(html) {
  var text = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&quot;/gi, "\"");
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

function buildSalarySignalUrl_(roleTitle) {
  if (!roleTitle) {
    return "https://www.salary.com/research/salary/benchmark";
  }
  var slug = encodeURIComponent(roleTitle.trim());
  return "https://www.salary.com/research/salary/listing/" + slug + "-salary";
}

function getBaseUrl_(url) {
  try {
    var parsed = new URL(url);
    return parsed.protocol + "//" + parsed.host;
  } catch (err) {
    return "";
  }
}

function guessCompanyBaseUrl_(company) {
  var slug = String(company || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!slug) {
    return "";
  }
  return "https://www." + slug + ".com";
}

function isJobBoardUrl_(url) {
  var lowered = String(url || "").toLowerCase();
  return [
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "lever.co",
    "greenhouse.io",
    "workday",
    "smartrecruiters.com",
    "ashbyhq.com",
    "ziprecruiter.com"
  ].some(function(domain) {
    return lowered.indexOf(domain) !== -1;
  });
}
