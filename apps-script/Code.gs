/* ============================================================
   EBS Chapter 6: Customer Service — Google Apps Script back end

   Paste this whole file into the Apps Script editor of the Google
   Sheet (Extensions > Apps Script). Setup steps for teachers are in
   docs/apps-script-setup.md.

   The teacher code is NOT in this file. It is kept in
   Project Settings > Script Properties as TEACHER_CODE.

   One web app URL handles every request:
     GET  ?action=classes                      list of classes (anyone)
     POST {action:"load", class, reg, name}     name-checked student work
     POST {action:"resetProgress", code, class, reg} protected by RESET_CODE
     POST {action:"save", record, name}        name-checked save
     POST {action:"teacherCheck", code}        check the teacher code
     POST {action:"addClass", code, name}
     POST {action:"removeClass", code, name}
     POST {action:"results", code, class}      all students in one class
     POST {action:"clearStudent", code, class, reg}
   POST bodies are JSON sent as text/plain (no CORS preflight).
   Every reply is JSON: {ok:true, ...} or {ok:false, error:"..."}.

   The local test server (server/server.js) runs THIS file with
   stand-ins for SpreadsheetApp and the other Google services, so
   keep to the services and methods already used here. Write plain
   JavaScript that Apps Script accepts (no ?. or ?? operators).
   ============================================================ */

var SCRIPT_VERSION = "0.6.32";

var CLASSES_SHEET = "Classes";
var STUDENTS_SHEET = "Students";
var CLASSES_HEADERS = ["Class", "Order", "Added at"];
var STUDENTS_HEADERS = ["Key", "Class", "Register No.", "Levels finished", "Q2 first try", "Q3 and Q4 first try",
  "Confidence 1", "Confidence 2", "Confidence 3", "Confidence 4", "Last saved", "Cleared at", "Record"];
var COL = { key: 0, cls: 1, reg: 2, finished: 3, q2: 4, q34: 5, conf1: 6, lastSaved: 10, clearedAt: 11, record: 12 };

var MAX_RECORD_CHARS = 40000;      // a Google Sheets cell holds 50,000
var MAX_CLASS_CHARS = 20;
var MIN_REG = 1;
var MAX_REG = 50;
var LOCK_WAIT_MS = 10000;
var CLASSES_CACHE_SECONDS = 60;
var BAD_CODE_LIMIT = 10;           // wrong teacher codes allowed...
var BAD_CODE_WINDOW_SECONDS = 600; // ...in this many seconds,
var LOCKOUT_SECONDS = 600;         // then every code is refused for this long
var TIME_ZONE = "Asia/Singapore";

// Items scored on the first try (Level 3 Q2; Level 5 Q3 and Q4). The app
// records whether each first try was right, so no answer key is needed here.
var Q2_ITEMS = ["s3q2.P", "s3q2.Q", "s3q2.R", "s3q2.S"];
var Q34_ITEMS = ["s5q3.i", "s5q3.ii", "s5q3.iii", "s5q3.iv", "s5q4"];
var CONFIDENCE_KEYS = ["s5.q8.1", "s5.q8.2", "s5.q8.3", "s5.q8.4"];
var CONFIDENCE_LABELS = ["Not yet", "A little", "Confident", "Very confident"];

/* ---------------- Entry points ---------------- */

function doGet(e) {
  var p = (e && e.parameter) || {};
  return respond(safely(function () {
    if (p.action === "classes") return { ok: true, classes: getClassNames() };
    if (p.action === "load") return loadStudent(p["class"], p.reg, p.name);
    return { ok: false, error: "unknown_action" };
  }));
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ ok: false, error: "bad_request" });
  }
  if (!body || typeof body !== "object") return respond({ ok: false, error: "bad_request" });
  return respond(safely(function () {
    switch (body.action) {
      case "validateConversationLink": return validateConversationLink(body["class"],body.reg,body.name,body.url);
      case "load": return loadStudent(body["class"], body.reg, body.name);
      case "save": return saveStudent(body.record, body.name);
      case "resetProgress": return resetOnly(body.code, function () { return clearStudent(body["class"], body.reg); });
      case "profileClasses": return profileOnly(body.code, body.purpose, function () { return {ok:true,classes:classLists().classes}; });
      case "profileList": return profileOnly(body.code, body.purpose, function () { return registeredProfiles(body["class"]); });
      case "unlockStudent": return teacherOnly(body.code, function () { return unlockStudent(body["class"], body.reg, body.levels); });
      case "teacherCheck": return teacherOnly(body.code, function () { return classLists(); });
      case "addClass": return teacherOnly(body.code, function () { return addClass(body.name); });
      case "setClassVisibility": return teacherOnly(body.code, function () { return setClassVisibility(body.name, body.visible); });
      case "removeClass": return teacherOnly(body.code, function () { return removeClass(body.name); });
      case "results": return teacherOnly(body.code, function () { return classResults(body["class"]); });
      case "clearStudent": return teacherOnly(body.code, function () { return clearStudent(body["class"], body.reg); });
      default: return { ok: false, error: "unknown_action" };
    }
  }));
}

// Only public Gemini share URLs are fetched. Redirects are never followed.
function validateConversationLink(cls,reg,name,raw) {
  if(typeof raw !== "string" || raw.length>512)return {ok:false,error:"invalid_link"};
  raw=raw.trim().replace(/^https:\/\/g\.co\/gemini\/share\//,"https://gemini.google.com/share/");
  var match=raw.match(/^https:\/\/gemini\.google\.com(\/share\/(?:d\/)?[A-Za-z0-9_-]{6,200})\/?(?:\?[^\s#]{0,200})?(?:#[^\s]{0,100})?$/);
  if(!match)return {ok:false,error:"invalid_link"};
  var owner=loadStudent(cls,reg,name);if(!owner.ok)return {ok:false,error:owner.error};
  var url="https://gemini.google.com"+match[1];
  var cache=CacheService.getScriptCache(),key="chatlink:"+url;
  if(cache.get(key)==="valid")return {ok:true,url:url};
  var rateKey="chatlink-rate:"+studentKey(cls,reg),count=Number(cache.get(rateKey)||0);
  if(count>=12)return {ok:false,error:"link_check_rate_limited"};cache.put(rateKey,String(count+1),60);
  try {
    var response=UrlFetchApp.fetch(url,{followRedirects:false,muteHttpExceptions:true});
    var status=response.getResponseCode();
    if(status===404 || status===410)return {ok:false,error:"invalid_link"};
    if(status!==200)return {ok:false,error:"link_check_unavailable"};
    var text=response.getContentText().slice(0,300000);
    if(/(?:conversation|chat|shared (?:page|link)) (?:was |is )?(?:not found|unavailable|deleted|no longer available)|this (?:conversation|chat) (?:(?:does not|doesn't) exist|no longer exists)/i.test(text))return {ok:false,error:"invalid_link"};
    if(/<title[^>]*>[^<]*(?:sign in|sign-in)/i.test(text) || !/gemini/i.test(text))return {ok:false,error:"link_check_unavailable"};
    cache.put(key,"valid",300);return {ok:true,url:url};
  } catch(error){return {ok:false,error:"link_check_unavailable"};}
}

// Run once from the editor (select "setup", then Run). It creates the two tabs
// and asks you to authorise the script.
function setup() {
  ensureSheets();
  var code = PropertiesService.getScriptProperties().getProperty("TEACHER_CODE");
  console.log(code ? "Setup done. The teacher code is set." : "Setup done. Now add TEACHER_CODE in Project Settings > Script Properties.");
}

function respond(obj) {
  obj.version = SCRIPT_VERSION;
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function safely(fn) {
  try {
    return fn();
  } catch (err) {
    console.error(err && err.stack ? err.stack : String(err));
    return { ok: false, error: "server_error" };
  }
}

/* ---------------- Sheets ---------------- */

function ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var classes = ss.getSheetByName(CLASSES_SHEET);
  if (!classes) {
    classes = ss.insertSheet(CLASSES_SHEET);
    // Plain text, so a class like "3E1" is not turned into the number 30.
    classes.getRange(1, 1, classes.getMaxRows(), CLASSES_HEADERS.length).setNumberFormat("@");
    classes.getRange(1, 1, 1, CLASSES_HEADERS.length).setValues([CLASSES_HEADERS]).setFontWeight("bold");
    classes.setFrozenRows(1);
  }
  var students = ss.getSheetByName(STUDENTS_SHEET);
  if (!students) {
    students = ss.insertSheet(STUDENTS_SHEET);
    students.getRange(1, 1, students.getMaxRows(), STUDENTS_HEADERS.length).setNumberFormat("@");
    students.getRange(1, 1, 1, STUDENTS_HEADERS.length).setValues([STUDENTS_HEADERS]).setFontWeight("bold");
    students.setFrozenRows(1);
  }
  return { classes: classes, students: students };
}

function dataRows(sheet, width) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, width).getValues();
}

// The next empty row. A new Google Sheet has 1,000 rows and writing past the last one
// fails, so more rows are added first (100 at a time) when the sheet is full.
function nextRow(sheet) {
  var row = sheet.getLastRow() + 1;
  var max = sheet.getMaxRows();
  if (row > max) sheet.insertRowsAfter(max, 100);
  return row;
}

function nowIso() { return new Date().toISOString(); }
function nowText() { return Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd HH:mm:ss"); }

function withLock(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) return { ok: false, error: "busy" };
  try {
    var result = fn();
    SpreadsheetApp.flush();
    return result;
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- Classes ---------------- */

function readClasses() {
  var sheet = ensureSheets().classes;
  return dataRows(sheet, CLASSES_HEADERS.length)
    .map(function (r, i) { return { name: String(r[0]).trim(), order: Number(r[1]) || 0, row: i + 2 }; })
    .filter(function (c) { return c.name !== ""; })
    .sort(function (a, b) { return a.order - b.order; });
}

function getClassNames() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get("classes");
  if (hit) return JSON.parse(hit);
  var hidden = hiddenClasses();
  var names = readClasses().filter(function(c){return hidden.indexOf(c.name) === -1;}).map(function (c) { return c.name; }).slice(0,1);
  cache.put("classes", JSON.stringify(names), CLASSES_CACHE_SECONDS);
  return names;
}

// For Teacher Mode: the current classes, plus removed classes that still have saved work.
function classLists() {
  var names = readClasses().map(function (c) { return c.name; });
  var removed = [];
  dataRows(ensureSheets().students, STUDENTS_HEADERS.length).forEach(function (r) {
    var c = String(r[COL.cls]);
    if (c && names.indexOf(c) === -1 && removed.indexOf(c) === -1) removed.push(c);
  });
  removed.sort();
  return { ok: true, classes: names, hidden: hiddenClasses().filter(function(c){return names.indexOf(c) !== -1;}), removed: removed };
}

// Visibility affects the student dropdown only, never saved records or teacher access.
function hiddenClasses() {
  var raw=PropertiesService.getScriptProperties().getProperty("HIDDEN_CLASSES");
  try { var list=JSON.parse(raw || "[]"); return Array.isArray(list) ? list : []; }
  catch(e) { return []; }
}
function setClassVisibility(rawName, visible) {
  var name=String(rawName == null ? "" : rawName);
  if (typeof visible !== "boolean") return {ok:false,error:"bad_request"};
  return withLock(function(){
    if (!readClasses().some(function(c){return c.name === name;})) return {ok:false,error:"no_class"};
    var hidden=visible ? readClasses().map(function(c){return c.name;}).filter(function(c){return c !== name;}) : hiddenClasses().filter(function(c){return c !== name;});
    if (!visible) hidden.push(name);
    PropertiesService.getScriptProperties().setProperty("HIDDEN_CLASSES",JSON.stringify(hidden));
    CacheService.getScriptCache().remove("classes");
    return classLists();
  });
}

function addClass(rawName) {
  var name = String(rawName == null ? "" : rawName).trim();
  if (!name) return { ok: false, error: "blank" };
  if (name.length > MAX_CLASS_CHARS) return { ok: false, error: "too_long" };
  return withLock(function () {
    var list = readClasses();
    var lower = name.toLowerCase();
    if (list.some(function (c) { return c.name.toLowerCase() === lower; })) return { ok: false, error: "duplicate" };
    var order = list.reduce(function (m, c) { return Math.max(m, c.order); }, 0) + 1;
    var sheet = ensureSheets().classes;
    var row = nextRow(sheet);
    sheet.getRange(row, 1, 1, CLASSES_HEADERS.length).setNumberFormat("@").setValues([[name, String(order), nowText()]]);
    PropertiesService.getScriptProperties().setProperty("HIDDEN_CLASSES",JSON.stringify(hiddenClasses().filter(function(c){return c !== name;})));
    CacheService.getScriptCache().remove("classes");
    return classLists();
  });
}

function removeClass(rawName) {
  var name = String(rawName == null ? "" : rawName).trim();
  return withLock(function () {
    var match = readClasses().filter(function (c) { return c.name === name; })[0];
    if (match) ensureSheets().classes.deleteRow(match.row);
    CacheService.getScriptCache().remove("classes");
    return classLists();
  });
}

/* ---------------- Students ---------------- */

function studentKey(cls, reg) { return cls + "#" + reg; }

function checkStudent(cls, reg) {
  var c = String(cls == null ? "" : cls);
  var n = Number(reg);
  if (!(Math.floor(n) === n && n >= MIN_REG && n <= MAX_REG && /^\d+$/.test(String(reg)))) return { error: "bad_reg" };
  if (readClasses().map(function(x){return x.name;}).indexOf(c) === -1) return { error: "no_class" };
  return { cls: c, reg: n };
}

function findStudentRow(sheet, key) {
  var keys = dataRows(sheet, 1);
  for (var i = 0; i < keys.length; i++) if (String(keys[i][0]) === key) return i + 2;
  return -1;
}

function readStudent(sheet, row) {
  var r = sheet.getRange(row, 1, 1, STUDENTS_HEADERS.length).getValues()[0];
  var record = null;
  if (r[COL.record]) {
    try { record = JSON.parse(r[COL.record]); } catch (err) { record = null; }
  }
  return { record: record, clearedAt: String(r[COL.clearedAt] || ""), lastSaved: String(r[COL.lastSaved] || "") };
}

function normalizedStudentName(name) {
  return typeof name === "string" ? name.trim().replace(/\s+/g," ").toLowerCase() : "";
}
function studentNameError(record, name) {
  if (!normalizedStudentName(name) || String(name).length > 80) return {ok:false,error:"name_required"};
  if (!record) return null;
  var saved = record.profile && record.profile.name && record.profile.name.v;
  if (!normalizedStudentName(saved)) return {ok:false,error:"profile_setup_required"};
  return normalizedStudentName(saved) === normalizedStudentName(name) ? null : {ok:false,error:"name_mismatch"};
}
function loadStudent(cls, reg, name) {
  var requiredName=studentNameError(null,name);
  if(requiredName)return requiredName;
  var who = checkStudent(cls, reg);
  if (who.error) return { ok: false, error: who.error };
  var sheet = ensureSheets().students;
  var row = findStudentRow(sheet, studentKey(who.cls, who.reg));
  if (row === -1) return { ok: true, record: null, clearedAt: "" };
  var s = readStudent(sheet, row);
  var denied=studentNameError(s.record,name);if(denied)return denied;
  return { ok: true, record: s.record, clearedAt: s.clearedAt };
}

function saveStudent(record, name) {
  var requiredName=studentNameError(null,name);if(requiredName)return requiredName;
  if (!record || typeof record !== "object") return { ok: false, error: "bad_request" };
  var who = checkStudent(record.cls, record.reg);
  if (who.error) return { ok: false, error: who.error };
  if (JSON.stringify(record).length > MAX_RECORD_CHARS) return { ok: false, error: "too_big" };
  return withLock(function () {
    var sheet = ensureSheets().students;
    var key = studentKey(who.cls, who.reg);
    var row = findStudentRow(sheet, key);
    var stored = row === -1 ? { record: null, clearedAt: "" } : readStudent(sheet, row);
    var denied=studentNameError(stored.record,name);if(denied)return denied;
    var incomingName=record.profile && record.profile.name && record.profile.name.v;
    if(normalizedStudentName(incomingName) !== normalizedStudentName(name))return {ok:false,error:"name_mismatch"};
    // Work cleared by a teacher after this copy was loaded is thrown away.
    if (stored.clearedAt && String(record.baseClearedAt || "") < stored.clearedAt) {
      return { ok: false, error: "cleared", clearedAt: stored.clearedAt, record: stored.record };
    }
    if (record.profile && record.profile.name) {
      var studentName=record.profile.name;
      if (!studentName || typeof studentName !== "object" || typeof studentName.v !== "string" || !studentName.v.trim() || studentName.v.length > 80) return {ok:false,error:"bad_name"};
    }
    var incoming = capTimes(record, nowIso());
    var merged = mergeRecords(stored.record, incoming);
    merged.cls = who.cls;
    merged.reg = who.reg;
    merged.baseClearedAt = stored.clearedAt;
    var json = JSON.stringify(merged);
    if (json.length > MAX_RECORD_CHARS) return { ok: false, error: "too_big" };
    var values = studentRowValues(key, merged, nowText(), stored.clearedAt, json);
    if (row === -1) row = nextRow(sheet);
    sheet.getRange(row, 1, 1, STUDENTS_HEADERS.length).setNumberFormat("@").setValues([values]);
    return { ok: true, record: merged, clearedAt: stored.clearedAt };
  });
}

function studentRowValues(key, rec, lastSaved, clearedAt, json) {
  var finished = rec ? Object.keys(rec.done || {}).length : "";
  var conf = CONFIDENCE_KEYS.map(function (k) {
    var a = rec && rec.answers && rec.answers[k];
    return a && typeof a.v === "number" && CONFIDENCE_LABELS[a.v] ? CONFIDENCE_LABELS[a.v] : "";
  });
  return [key, key.split("#")[0], key.split("#").slice(-1)[0], String(finished),
    firstTryScore(rec, Q2_ITEMS), firstTryScore(rec, Q34_ITEMS)]
    .concat(conf).concat([lastSaved, clearedAt, json || ""]);
}

// "3 / 4" once every item has a first try, otherwise blank.
function firstTryScore(rec, items) {
  var first = (rec && rec.first) || {};
  if (!items.every(function (k) { return first[k]; })) return "";
  var right = items.filter(function (k) { return first[k].ok === true; }).length;
  return right + " / " + items.length;
}

function classResults(cls) {
  var name = String(cls == null ? "" : cls);
  var sheet = ensureSheets().students;
  var students = [];
  dataRows(sheet, STUDENTS_HEADERS.length).forEach(function (r) {
    if (String(r[COL.cls]) !== name) return;
    var record = null;
    if (r[COL.record]) { try { record = JSON.parse(r[COL.record]); } catch (err) { record = null; } }
    students.push({ reg: Number(r[COL.reg]), record: record, lastSaved: String(r[COL.lastSaved] || ""), clearedAt: String(r[COL.clearedAt] || "") });
  });
  students.sort(function (a, b) { return a.reg - b.reg; });
  return { ok: true, "class": name, students: students };
}

function clearStudent(cls, reg) {
  var name = String(cls == null ? "" : cls);
  var n = Number(reg);
  if (!(Math.floor(n) === n && n >= MIN_REG && n <= MAX_REG)) return { ok: false, error: "bad_reg" };
  if (!name) return { ok: false, error: "no_class" };
  return withLock(function () {
    var sheet = ensureSheets().students;
    var key = studentKey(name, n);
    var row = findStudentRow(sheet, key);
    if (row === -1) row = nextRow(sheet);
    var previousStudent = readStudent(sheet, row);
    var previous = previousStudent.clearedAt;
    var clearedAt = nowText() + "." + String(new Date().getMilliseconds() + 1000).slice(1);
    if (previous && clearedAt <= previous) {
      // Preserve sortable local-time markers, with a strictly newer suffix.
      clearedAt = previous + "1";
    }
    // Keep the reset marker to reject stale saves, but release the registered identity.
    var blank = null;
    sheet.getRange(row, 1, 1, STUDENTS_HEADERS.length).setNumberFormat("@")
      .setValues([studentRowValues(key, blank, "", clearedAt, blank ? JSON.stringify(blank) : "")]);
    return { ok: true, clearedAt: clearedAt, record:blank };
  });
}

// Add access grants without changing answers, attempts, completions or badges.
// Only the authenticated action may create grants; saveStudent ignores incoming grants.
function unlockStudent(cls, reg, levels) {
  var who = checkStudent(cls, reg);
  if (who.error) return { ok: false, error: who.error };
  if (!Array.isArray(levels) || !levels.length || levels.length > 5 || levels.some(function (n) {
    return typeof n !== "number" || Math.floor(n) !== n || n < 1 || n > 5;
  })) return { ok: false, error: "bad_levels" };
  return withLock(function () {
    var sheet = ensureSheets().students;
    var key = studentKey(who.cls, who.reg);
    var row = findStudentRow(sheet, key);
    if (row === -1) return { ok: false, error: "no_student" };
    var stored = readStudent(sheet, row);
    if (!stored.record) return { ok: false, error: "no_student" };
    var record = stored.record;
    var grants = isPlainObject(record.unlockedLevels) ? record.unlockedLevels : {};
    var time = nowIso();
    levels.forEach(function (n) { if (!grants[n]) grants[n] = time; });
    record.unlockedLevels = grants;
    var json = JSON.stringify(record);
    if (json.length > MAX_RECORD_CHARS) return { ok: false, error: "too_big" };
    sheet.getRange(row, 1, 1, STUDENTS_HEADERS.length).setNumberFormat("@")
      .setValues([studentRowValues(key, record, nowText(), stored.clearedAt, json)]);
    return { ok: true, record: record, clearedAt: stored.clearedAt };
  });
}

// Return only the registered profile identity and access grants to the footer selectors.
function registeredProfiles(cls) {
  var result=classResults(cls);
  return {ok:true,students:result.students.filter(function(s){return !!s.record;}).map(function(s){
    var name=s.record.profile && s.record.profile.name;
    return {reg:s.reg,name:name ? String(name.v || "") : "",unlockedLevels:s.record.unlockedLevels || {}};
  })};
}
function profileOnly(code, purpose, fn) {
  return purpose === "reset" ? resetOnly(code,fn) : teacherOnly(code,fn);
}

/* ---------------- Teacher code ---------------- */

function teacherOnly(code, fn) {
  return protectedAction(code, "TEACHER_CODE", "no_teacher_code", "", fn);
}

function resetOnly(code, fn) {
  return protectedAction(code, "RESET_CODE", "no_reset_code", "reset_", fn);
}

function protectedAction(code, property, missingError, prefix, fn) {
  var cache = CacheService.getScriptCache();
  if (cache.get(prefix + "lockedOut")) return { ok: false, error: "locked_out" };
  var expected = PropertiesService.getScriptProperties().getProperty(property);
  if (!expected) return { ok: false, error: missingError };
  // Not case sensitive, and spaces before or after it are ignored. Used by Teacher Mode
  // sign-in, every teacher action and Reset this device.
  if (String(code == null ? "" : code).trim().toLowerCase() !== String(expected).trim().toLowerCase()) {
    var now = Date.now();
    var state = JSON.parse(cache.get(prefix + "badCodes") || "null") || { n: 0, since: now };
    state.n += 1;
    var left = Math.max(1, BAD_CODE_WINDOW_SECONDS - Math.floor((now - state.since) / 1000));
    if (state.n >= BAD_CODE_LIMIT) {
      cache.put(prefix + "lockedOut", "1", LOCKOUT_SECONDS);
      cache.remove(prefix + "badCodes");
      return { ok: false, error: "locked_out" };
    }
    cache.put(prefix + "badCodes", JSON.stringify(state), left);
    return { ok: false, error: "bad_code" };
  }
  return fn();
}

/* ---------------- Merging two copies of a student's work ----------------
   The same function is in app.js (mergeRecords); keep the two identical.

   A record:
     v, cls, reg, updatedAt, baseClearedAt
     agreed     time "I'm ready" was tapped           earliest kept
     done       {level: time finished}              earliest kept, never removed
     submitted  {question: time submitted}            earliest kept, never removed
     reached    {"s2.tab": 2, "s2.t0.parts": 3, ...}  highest kept
     first      {item: {a, ok, t}} first attempts     never overwritten once recorded
     second     {item: {a, ok, t}} second attempts    never overwritten once recorded
     answers    {key: {v, t}}                         newest value of each box wins
     ui         {key: {v, t}} (e.g. current tab)      newest wins
   "primary" wins ties and keeps its first and second attempts. */

var MERGE_RULES = {
  done: "earliest", submitted: "earliest", reached: "max",
  first: "keep", second: "keep", answers: "newest", ui: "newest", profile: "keep"
};

function mergeRecords(primary, other) {
  if (!primary && !other) return null;
  var p = primary || {};
  var o = other || {};
  var out = {
    v: 1,
    cls: p.cls || o.cls,
    reg: p.reg || o.reg,
    updatedAt: maxText(p.updatedAt, o.updatedAt),
    baseClearedAt: maxText(p.baseClearedAt, o.baseClearedAt),
    agreed: minText(p.agreed, o.agreed),
    // Grants belong to the server copy; ordinary student saves cannot add them.
    unlockedLevels: isPlainObject(p.unlockedLevels) ? p.unlockedLevels : {}
  };
  Object.keys(MERGE_RULES).forEach(function (section) {
    var rule = MERGE_RULES[section];
    var a = isPlainObject(p[section]) ? p[section] : {};
    var b = isPlainObject(o[section]) ? o[section] : {};
    var merged = {};
    Object.keys(a).concat(Object.keys(b)).forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(merged, k)) return;
      var hasA = Object.prototype.hasOwnProperty.call(a, k);
      var hasB = Object.prototype.hasOwnProperty.call(b, k);
      if (!hasA) { merged[k] = b[k]; return; }
      if (!hasB) { merged[k] = a[k]; return; }
      if (rule === "earliest") merged[k] = minText(a[k], b[k]);
      else if (rule === "max") merged[k] = Math.max(Number(a[k]) || 0, Number(b[k]) || 0);
      else if (rule === "keep") merged[k] = a[k];
      else merged[k] = String((b[k] && b[k].t) || "") > String((a[k] && a[k].t) || "") ? b[k] : a[k];
    });
    out[section] = merged;
  });
  return out;
}

// No time from a device may be later than the server's clock (a phone set to the
// wrong date must not win every merge).
function capTimes(record, now) {
  var r = JSON.parse(JSON.stringify(record));
  var cap = function (t) { return typeof t === "string" && t > now ? now : t; };
  r.updatedAt = cap(r.updatedAt);
  r.agreed = cap(r.agreed);
  ["done", "submitted"].forEach(function (s) {
    if (isPlainObject(r[s])) Object.keys(r[s]).forEach(function (k) { r[s][k] = cap(r[s][k]); });
  });
  ["first", "second", "answers", "ui", "profile"].forEach(function (s) {
    if (isPlainObject(r[s])) Object.keys(r[s]).forEach(function (k) {
      if (isPlainObject(r[s][k])) r[s][k].t = cap(r[s][k].t);
    });
  });
  return r;
}

function isPlainObject(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
function maxText(a, b) { a = a || ""; b = b || ""; return a > b ? a : b; }
function minText(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a < b ? a : b;
}
