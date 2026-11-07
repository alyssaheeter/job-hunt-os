function getSheetOrThrow_(name) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) {
    throw new Error("Missing sheet: " + name);
  }
  return sheet;
}

function getHeaderMap(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    return {};
  }
  var headerRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var map = {};
  for (var i = 0; i < headerRow.length; i++) {
    var key = String(headerRow[i] || "").trim();
    if (key) {
      map[key] = i + 1;
    }
  }
  return map;
}

function appendRowByMap(sheet, rowMap) {
  var headerMap = getHeaderMap(sheet);
  var values = new Array(sheet.getLastColumn()).fill("");
  Object.keys(rowMap).forEach(function(key) {
    if (!headerMap[key]) {
      throw new Error("Schema mismatch. Missing header for: " + key);
    }
    values[headerMap[key] - 1] = rowMap[key];
  });
  sheet.appendRow(values);
}

function updateRowByMap(sheet, rowIndex, rowMap) {
  var headerMap = getHeaderMap(sheet);
  var rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  Object.keys(rowMap).forEach(function(key) {
    if (!headerMap[key]) {
      throw new Error("Schema mismatch. Missing header for: " + key);
    }
    rowValues[headerMap[key] - 1] = rowMap[key];
  });
  sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
}

function readRowByMap(sheet, rowIndex) {
  var headerMap = getHeaderMap(sheet);
  var values = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = {};
  Object.keys(headerMap).forEach(function(key) {
    row[key] = values[headerMap[key] - 1];
  });
  return row;
}

function readAllRowsByMap_(sheet, limit) {
  var headerMap = getHeaderMap(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var rowCount = lastRow - 1;
  if (limit && rowCount > limit) {
    rowCount = limit;
  }
  var values = sheet.getRange(2, 1, rowCount, sheet.getLastColumn()).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var row = {};
    Object.keys(headerMap).forEach(function(key) {
      row[key] = values[i][headerMap[key] - 1];
    });
    rows.push(row);
  }
  return rows;
}

function findRowById_(sheet, idColumnName, idValue) {
  var headerMap = getHeaderMap(sheet);
  var idCol = headerMap[idColumnName];
  if (!idCol) {
    throw new Error("Missing id column: " + idColumnName);
  }
  if (sheet.getLastRow() < 2) {
    return -1;
  }
  var data = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(idValue)) {
      return i + 2;
    }
  }
  return -1;
}

function generateId_(prefix) {
  return prefix + "_" + Utilities.getUuid();
}

function formatDate_(dateObj) {
  if (!dateObj) return "";
  return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function parseJsonSafe_(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return fallback;
  }
}

function ensureHeadersIfEmpty_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  var headerMap = getHeaderMap(sheet);
  var lastColumn = sheet.getLastColumn();
  var missing = [];
  headers.forEach(function(header) {
    if (!headerMap[header]) {
      missing.push(header);
    }
  });
  if (missing.length === 0) {
    return;
  }
  sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
}

function normalizeJobUrl_(url) {
  if (!url) return "";
  var cleaned = String(url).trim();
  cleaned = cleaned.replace(/[).,>]+$/, "");
  cleaned = cleaned.replace(/^<+/, "");
  cleaned = cleaned.split("#")[0];
  var match = cleaned.match(/^(https?):\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?$/i);
  if (!match) return "";

  var scheme = match[1].toLowerCase();
  var host = match[2].toLowerCase().replace(/:80$/, "").replace(/:443$/, "");
  var path = match[3] || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");

  var ignored = { fbclid: true, gclid: true, mc_cid: true, mc_eid: true };
  var query = (match[4] || "").split("&").filter(function(part) {
    if (!part) return false;
    var key = part.split("=")[0].toLowerCase();
    return key.indexOf("utm_") !== 0 && !ignored[key];
  }).sort().join("&");
  return scheme + "://" + host + path + (query ? "?" + query : "");
}

function buildUrlDedupeKey_(normalizedUrl) {
  if (!normalizedUrl) return "";
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalizedUrl);
  var hash = bytes.map(function(byte) {
    var v = (byte + 256) % 256;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
  return "urlhash_" + hash;
}

function findJobRowByDedupeKey_(sheet, normalizedUrl) {
  if (!normalizedUrl) return -1;
  var headerMap = getHeaderMap(sheet);
  var dedupeCol = headerMap.dedupe_key;
  var normalizedCol = headerMap.normalized_url;
  var urlCol = headerMap.url;
  if ((!dedupeCol && !normalizedCol && !urlCol) || sheet.getLastRow() < 2) {
    return -1;
  }
  var lastRow = sheet.getLastRow() - 1;
  var data = sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getValues();
  var dedupeKey = buildUrlDedupeKey_(normalizedUrl);
  for (var i = 0; i < data.length; i++) {
    if (dedupeCol && (String(data[i][dedupeCol - 1]) === dedupeKey ||
        String(data[i][dedupeCol - 1]) === normalizedUrl)) {
      return i + 2;
    }
    if (normalizedCol && String(data[i][normalizedCol - 1]) === normalizedUrl) {
      return i + 2;
    }
    if (urlCol && normalizeJobUrl_(data[i][urlCol - 1]) === normalizedUrl) {
      return i + 2;
    }
  }
  return -1;
}

function coerceString_(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function isTruthy_(value) {
  return value === true || value === 1 || String(value || "").toLowerCase() === "true";
}
