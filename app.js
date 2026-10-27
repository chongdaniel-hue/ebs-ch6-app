/* ============================================================
   EBS Chapter 6: Customer Service — self-study revision app
   Forked from the EBS Learning Journey app (V45): one-page
   vanilla JavaScript app with a hash router and render().

   Source of truth for every screen and every word students see:
   docs/storyboard.md, plus the agreed decisions in docs/progress.md.
   House rules: CLAUDE.md. Settings (server, chatbot links, images):
   config.js. Back end: apps-script/Code.gs (Google Apps Script).

   Version history
   0.1  Slice 1: shell only. All Learning Journey content and
        the old hosting removed. Blue theme, sticky top bar,
        credits footer, image map with placeholder boxes, zoom
        allowed.
   0.2  Slice 2: wine-red theme. Log in with class and register
        number, Before you start, home page with the route of five
        levels, 4 key terms, Switch student. Work saves on the
        device and to the Google Sheet (offline queue and yellow bar
        from V45, reworked to send one whole record per student).
        Teacher Mode sign-in and Classes tab.
   0.2.1 "Station" renamed "Level" everywhere on screen and in the
        code. The teacher code ignores capitals and spaces.
   0.3  Slice 3: Levels 1 and 2. Level engine (sticky step tabs,
        Continue ↓ parts, Next →, tabs unlocking in order), the
        Service Recovery Path, "Not finished yet" pop-up (V45 submit
        guard), recap card and badge pop-ups for Badges 1 and 2.
   0.3.1 Visual and Mayer pass: icon cards, 📖 definition boxes, 💡 tips,
        📌 recap heading, welcome card, equal-height Level 1 cards,
        larger path icons, images in full, 🔊 Listen for notes.
   0.3.2 Visual fixes: Listen in heading rows, every block full width,
        images centred, white path circles, compact phone cards,
        bubbles on their own lines, welcome-back text in the card.
   0.3.3 Final slice 3 tweaks: "Your work has been loaded." only right
        after logging in; four extra Continue points in Level 2; R03
        capped at about 520px.
   0.4  Slice 4: Levels 3, 4 and 5. Marked questions with hint, one retry
        (Check again) and reveal; first and second attempts recorded.
        Chatbot tabs with tick boxes, About Stylez placeholder, exit
        ticket with confidence faces, Badges 3 to 5.
   0.4.1 Slice 4 fixes: one Check again per tab; revealed answers shown on
        the options; changed answers prompt "Tap Check again"; tick note
        under a greyed Next; summary card (V45 missedHtml); level
        subtitles; ✓ on finished tabs.
   0.5  Slice 5: learning report; Teacher Mode Results (class summary,
        students table, full report, CSV, Clear this student's work) and
        This device (unlock all levels, Reset this device).
   0.5.1 Singapore time for dates and the CSV name; report button in the
        welcome card; Q4 labelled in the teacher's report.
   0.6  Slice 6: full check (contrast fixes for hints and the faded hint),
        GitHub Pages workflow; Code.gs adds rows when the Sheet is full.
   0.6.1 Level 2 cards: capital first letters; skill and returns names on
        their own line above the description.
   0.6.20 Images resized and compressed (assets/img 40.1 MB to 2.6 MB), unused
        images removed; "Read aloud" button; report second-try wording;
        approach titles without colons; Stylez promotions line shortened.
   0.6.7 More vibrant achievement badges and the confirmed Suzzie Gem link.
   0.6.5 Replaced remaining UI emojis with a shared SVG graphic icon set.
   0.6.4 Replaced remaining book symbols with contextual graphic icons.
   0.6.3 Four key terms: distinct card colours and larger generated icons.
   0.6.2 Added the five storyboard illustrations and five achievement badges.
   ============================================================ */

const APP_VERSION = "0.6.34";
const CONFIG = window.APP_CONFIG || {};

/* ---------------- Utilities ---------------- */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}


// The same drawn graphic is used everywhere a UI symbol appears. Convert text
// nodes only: never HTML attributes, input values or students' written answers.
function uiGraphicHtml(symbol) {
  const icons = CONFIG.UI_ICONS;
  const id = icons && icons.symbols[symbol];
  if (!id) return escapeHtml(symbol);
  return `<svg class="ui-graphic" viewBox="0 0 32 32" aria-hidden="true" focusable="false" data-icon="${id}"><use href="${icons.file}#${id}"></use></svg>`;
}

function setGraphicHtml(el, html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const symbols = Object.keys((CONFIG.UI_ICONS || {}).symbols || {}).sort((a, b) => b.length - a.length);
  if (!symbols.length) { el.replaceChildren(template.content); return; }
  const pattern = new RegExp(symbols.join("|"), "gu");
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    if (node.parentElement && node.parentElement.closest("textarea, option, script, style, [data-student-text], svg")) return;
    const text = node.textContent;
    pattern.lastIndex = 0;
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const replacement = document.createElement("template");
    replacement.innerHTML = escapeHtml(text).replace(pattern, symbol => uiGraphicHtml(symbol));
    node.replaceWith(replacement.content);
  });
  el.replaceChildren(template.content);
}

// Allows **bold** in content strings while still escaping everything else.
function rich(str) {
  return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function nowIso() { return new Date().toISOString(); }

// localStorage can throw (private windows, full storage); never let that break the page.
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function lsRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* nothing to do */ }
}

/* ---------------- Images ----------------
   Every image is listed in config.js (IMAGES). If its file is missing or fails
   to load, a placeholder box takes its place: a rounded wine-tinted box with a
   dashed border, the emoji large in the middle and the short label underneath.
   Dropping the real file into assets/img/ makes it appear with no code change. */

function imgPlaceholderHtml(id, cls) {
  const im = (CONFIG.IMAGES || {})[id];
  if (!im) return "";
  return `<div class="img-placeholder ${cls || ""}" role="img" aria-label="${escapeHtml(im.alt)}" data-img="${id}">
    <span class="img-placeholder-emoji" aria-hidden="true">${im.emoji}</span>
    <span class="img-placeholder-label" aria-hidden="true">${escapeHtml(im.label)}</span>
  </div>`;
}

function imgHtml(id, cls) {
  const im = (CONFIG.IMAGES || {})[id];
  if (!im) return "";
  return `<img class="content-img ${cls || ""}" src="${escapeHtml(im.file)}" alt="${escapeHtml(im.alt)}" data-img="${id}" data-cls="${escapeHtml(cls || "")}" onerror="imgFallback(this)">`;
}

// A picture students can tap or click to see full screen (Level 2 comics and examples).
function zoomImgHtml(id, cls) {
  if (!(CONFIG.IMAGES || {})[id]) return "";
  return `<button type="button" class="zoom-btn" data-zoom="${id}">${imgHtml(id, cls)}<span class="zoom-hint" aria-hidden="true">🔍 Tap to enlarge</span><span class="visually-hidden"> (tap to enlarge)</span></button>`;
}
function openZoom(btn) {
  const img = btn.querySelector("img");
  if (!img) return; // the placeholder box has nothing to enlarge
  const wrap = document.createElement("div");
  wrap.className = "zoom-backdrop";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", "Enlarged picture");
  setGraphicHtml(wrap, `<button type="button" class="btn zoom-close">✕ Close</button><img class="zoom-img" src="${escapeHtml(img.getAttribute("src"))}" alt="${escapeHtml(img.alt)}">`);
  const close = () => { wrap.remove(); if (btn.isConnected) btn.focus(); };
  wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest(".zoom-close")) close(); });
  wrap.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") { e.preventDefault(); wrap.querySelector(".zoom-close").focus(); } // the close button is the only control
  });
  document.body.appendChild(wrap);
  // Phones: a wide comic opens larger than the screen (at most its own file size) and scrolls sideways.
  const big = wrap.querySelector(".zoom-img");
  if (window.innerWidth < 768 && img.naturalWidth > window.innerWidth) {
    wrap.classList.add("zoom-scroll");
    big.style.width = Math.min(img.naturalWidth, Math.round(window.innerWidth * 2.2)) + "px";
  }
  wrap.querySelector(".zoom-close").focus();
}
document.addEventListener("click", e => {
  const btn = e.target.closest(".zoom-btn");
  if (btn) openZoom(btn);
});

function imgFallback(el) {
  const exampleFigure = el.closest(".product-example-figure");
  const wrap = document.createElement("div");
  setGraphicHtml(wrap, imgPlaceholderHtml(el.getAttribute("data-img"), el.getAttribute("data-cls")));
  if (wrap.firstElementChild) el.replaceWith(wrap.firstElementChild);
  // If the graphic fails, show its speech transcript so the example stays usable.
  if (exampleFigure) {
    const caption = exampleFigure.querySelector("figcaption");
    if (caption) caption.classList.remove("visually-hidden");
  }
}

// Replacements keep the original symbol's size as the 1x baseline.
function graphicIconHtml(id, cls) {
  return `<span class="graphic-icon ${cls || ""}" aria-hidden="true">${imgHtml(id)}</span>`;
}
function levelIconHtml(level) {
  return level.iconImg ? graphicIconHtml(level.iconImg) : level.icon;
}

/* ---------------- Levels (home page route) ---------------- */

const LEVELS = [
  { num: 1, icon: "📝", title: "Your Customer Service Stories", desc: "Think about your own experiences as a customer.", badge: "Story Sharer", badgeImg: "BADGE1" },
  { num: 2, icon: "", iconImg: "ICON_LEARN", title: "Learn: Customer Service", desc: "Short notes on quality customer service, the five stages and service recovery.", badge: "Service Scholar", badgeImg: "BADGE2" },
  { num: 3, icon: "💬", title: "Chat with Alex", desc: "Be the customer. Chat with Nexora's customer service officer.", badge: "Service Spotter", badgeImg: "BADGE3" },
  { num: 4, icon: "🛍️", title: "Serve Suzzie at Stylez", desc: "Switch roles. Now you're the customer service officer.", badge: "Service Star", badgeImg: "BADGE4" },
  { num: 5, icon: "✅", title: "Check and Exit Ticket", desc: "Check what you've learnt and tell your teacher how confident you feel.", badge: "Completion Champion", badgeImg: "BADGE5" }
];

/* ---------------- Student record ----------------
   One record per student (class plus register number), kept on this device and
   in the Google Sheet. Sections and how two copies are merged: see mergeRecords. */

const KEYS = {
  active: "ch6_active",          // {cls, reg} of the student using this device
  classes: "ch6_classes",        // cached class list, so a student can log in offline
  queue: "ch6_queue",            // students whose work still has to reach the server
  unlockAll: "ch6_unlock_all",   // Teacher Mode: all levels open on this device
  rec: (key) => "ch6_rec_" + key // one student's work on this device
};

let student = null;  // {cls, reg}
let rec = null;      // that student's record
let renderingTeacherPreview = false;

function profileName(record) { return String(record && record.profile && record.profile.name && record.profile.name.v || ""); }
function profileLabel(record, reg) { const name = profileName(record); return name ? `${name} · Register No. ${reg}` : `Register No. ${reg} (name not added yet)`; }

function studentKey(cls, reg) { return cls + "#" + reg; }
function activeKey() { return student ? studentKey(student.cls, student.reg) : ""; }

function freshRecord(cls, reg, baseClearedAt) {
  return {
    v: 1, cls, reg, updatedAt: "", baseClearedAt: baseClearedAt || "", agreed: null,
    done: {}, submitted: {}, reached: {}, first: {}, second: {}, answers: {}, ui: {}
  };
}

let storageWarned = false;
function saveLocal() {
  if (renderingTeacherPreview || !student || !rec) return;
  if (!lsSet(KEYS.rec(activeKey()), rec) && !storageWarned) {
    storageWarned = true;
    alert("We couldn't save your work on this device. Its storage may be full.");
  }
}

// Merging two copies of a student's work. The same function is in
// apps-script/Code.gs (mergeRecords); keep the two identical.
//   agreed, done, submitted: earliest time kept, never removed
//   reached: highest kept
//   first, second (attempts): never overwritten once recorded ("primary" keeps its own)
//   answers, ui: the newest value of each box wins
const MERGE_RULES = {
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
function isPlainObject(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
function maxText(a, b) { a = a || ""; b = b || ""; return a > b ? a : b; }
function minText(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a < b ? a : b;
}

// Reading and writing answers. Every change saves on the device at once; the
// server save follows the agreed timings (see queueSave).
function getAnswer(key) {
  const a = rec && rec.answers[key];
  return a ? a.v : undefined;
}
function setAnswer(key, value, mode) {
  rec.answers[key] = { v: value, t: nowIso() };
  queueSave(mode || "typing");
}
function setUi(key, value) {
  rec.ui[key] = { v: value, t: nowIso() };
}
function getUi(key) {
  const a = rec && rec.ui[key];
  return a ? a.v : undefined;
}
function raiseReached(key, n) {
  rec.reached[key] = Math.max(Number(rec.reached[key]) || 0, n);
}

/* ---------------- Server (Google Apps Script, or the local test server) ---------------- */

function apiUrl() {
  if (CONFIG.SERVER === "live") return /^https:\/\//.test(CONFIG.LIVE_URL || "") ? CONFIG.LIVE_URL : "";
  return CONFIG.LOCAL_URL || "api";
}

// GET for reads, POST with a text/plain JSON body for everything else (no CORS
// preflight). Throws on a network problem, a timeout or a reply that is not JSON;
// otherwise returns the reply, which may be {ok:false, error}.
async function api(method, data, timeoutMs) {
  const base = apiUrl();
  if (!base) throw new Error("No server address in config.js");
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs || 15000) : null;
  try {
    const opts = { method, signal: ctrl ? ctrl.signal : undefined, cache: "no-store" };
    let url = base;
    if (method === "GET") url += (base.indexOf("?") === -1 ? "?" : "&") + new URLSearchParams(data).toString();
    else opts.body = JSON.stringify(data);
    const res = await fetch(url, opts);
    const reply = await res.json();
    if (!reply || typeof reply !== "object") throw new Error("Bad reply");
    serverUnreachable = false;
    return reply;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Older Google deployments accept load only over GET. Both paths include the name;
// updated deployments enforce the same name check on either method.
async function loadStudentRecord(cls, reg, name) {
  const data = { action: "load", "class": cls, reg: String(reg), name };
  const reply = await api("POST", data, 10000);
  return reply.error === "unknown_action" ? api("GET", data, 10000) : reply;
}

/* ---------------- Saving to the server: queue and retries ----------------
   Ported from V45's offline queue. V45 queued one submission per section; here
   the queue holds one entry per student, and each send carries that student's
   latest whole record from this device, so nothing stale is ever sent.

   Timings (agreed): the device copy saves at once, every time. The server copy
   saves at once on Submit and Finish ("now"); Continue, Next and tab changes
   gather into one save within about 10 seconds ("soon"); typing saves at most
   every 30 seconds ("typing"). Routine saves wait a random 0 to 3 seconds so a
   whole class does not save at the same instant. One request at a time. A failed
   save is retried after 5, 10, 20, 40 seconds, then at most every 5 minutes. */

const SOON_MS = 10000;
const TYPING_MS = 30000;
const RETRY_MS = [5000, 10000, 20000, 40000, 80000, 160000, 300000];
const PERMANENT_ERRORS = ["no_class", "bad_reg", "too_big", "bad_request", "unknown_action", "bad_name", "name_required", "name_mismatch", "profile_setup_required"];

function jitter(ms) { return Math.floor(Math.random() * ms); }
function loadQueue() { return lsGet(KEYS.queue) || {}; }
function saveQueue(q) { lsSet(KEYS.queue, q); }

let lastTypingSend = 0;
let typingTimer = null;

function queueSave(mode) {
  if (renderingTeacherPreview || !student || !rec) return;
  rec.updatedAt = nowIso();
  saveLocal();
  const now = Date.now();
  let due;
  if (mode === "now") due = now;
  else if (mode === "typing") {
    // At most one server save every 30 seconds while typing.
    const next = Math.max(now, lastTypingSend + TYPING_MS);
    if (next > now) {
      if (!typingTimer) typingTimer = setTimeout(() => { typingTimer = null; queueSave("typing"); }, next - now);
      return;
    }
    lastTypingSend = now;
    due = now + jitter(3000);
  } else due = now + SOON_MS + jitter(3000);
  enqueue(activeKey(), due, mode === "now");
}

function enqueue(key, due, urgent) {
  const q = loadQueue();
  const entry = q[key] || { tries: 0, nextAt: due };
  // An entry waiting to retry keeps its wait, unless this is a Submit or Finish.
  if (urgent) { entry.nextAt = due; entry.tries = 0; }
  else if (!entry.tries) entry.nextAt = Math.min(entry.nextAt || due, due);
  entry.forget = false;
  q[key] = entry;
  saveQueue(q);
  scheduleFlush();
}

let flushTimer = null;
function scheduleFlush() {
  const q = loadQueue();
  const keys = Object.keys(q).filter(k => k !== resettingKey);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (!keys.length) return;
  const soonest = Math.min.apply(null, keys.map(k => q[k].nextAt || 0));
  flushTimer = setTimeout(flushQueue, Math.max(0, soonest - Date.now()));
}

// Ignore responses started before a successful reset, including delayed loads and saves.
const resetGenerations = new Map();
let resettingKey = "";
let flushing = false;
let sendProblem = false;        // the last send did not work and work is waiting (V45)
let serverUnreachable = false;  // the server could not be reached at log-in

async function flushQueue() {
  if (flushing) return;
  flushing = true;
  try {
    let networkDown = false;
    while (!networkDown) {
      const q = loadQueue();
      const key = Object.keys(q).find(k => k !== resettingKey && (q[k].nextAt || 0) <= Date.now());
      if (!key) break;
      const record = lsGet(KEYS.rec(key));
      if (!record) { delete q[key]; saveQueue(q); continue; }
      const generation = resetGenerations.get(key) || 0;
      let reply = null;
      try { reply = await api("POST", { action: "save", record, name: profileName(record) }, 20000); }
      catch (e) { networkDown = true; }
      if (generation === (resetGenerations.get(key) || 0)) handleSaveReply(key, record, reply);
    }
  } finally {
    flushing = false;
    sendProblem = sendProblem && Object.keys(loadQueue()).length > 0;
    updateNetBanner();
    scheduleFlush();
  }
}

function retryLater(key) {
  const q = loadQueue();
  const entry = q[key];
  if (!entry) return;
  entry.tries = (entry.tries || 0) + 1;
  const wait = RETRY_MS[Math.min(entry.tries - 1, RETRY_MS.length - 1)];
  entry.nextAt = Date.now() + wait + jitter(wait * 0.2);
  saveQueue(q);
  sendProblem = true;
}

function dropFromQueue(key) {
  const q = loadQueue();
  const entry = q[key];
  delete q[key];
  saveQueue(q);
  // Switch student: the device copy goes once it has reached the server.
  if (entry && entry.forget && key !== activeKey()) lsRemove(KEYS.rec(key));
}

function releaseResetProfile(key) {
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
  lastTypingSend = 0;
  dropFromQueue(key);
  lsRemove(KEYS.rec(key));
  lsRemove(KEYS.active);
  lsRemove(KEYS.unlockAll);
  student = null;
  rec = null;
  history.replaceState(null, "", window.location.pathname);
  render();
  refreshClassList();
}

function handleSaveReply(key, sent, reply) {
  const current = lsGet(KEYS.rec(key));
  if (reply && (reply.ok || reply.error === "cleared") && current && String(current.baseClearedAt || "") > String(reply.clearedAt || "")) return;
  if (!reply || (!reply.ok && !PERMANENT_ERRORS.includes(reply.error) && reply.error !== "cleared")) {
    retryLater(key); // no answer, "busy" or a server problem: try again later
    return;
  }
  if (reply.error === "cleared") {
    // A teacher cleared this student's work: this device's older copy is thrown away.
    lsRemove(KEYS.rec(key));
    dropFromQueue(key);
    if (key === activeKey()) releaseResetProfile(key);
    return;
  }
  if (!reply.ok) {
    if(["name_required","name_mismatch","profile_setup_required"].includes(reply.error) && key === activeKey()){releaseResetProfile(key);return;}
    console.warn(`Save for ${key} refused (${reply.error}); not retrying.`);
    dropFromQueue(key);
    return;
  }
  // Saved. Take in anything the server had that this device did not (work from
  // another device), keeping this device's newer answers.
  const local = lsGet(KEYS.rec(key));
  const merged = mergeRecords(reply.record, local || sent);
  merged.baseClearedAt = reply.clearedAt || merged.baseClearedAt;
  const q = loadQueue();
  const changedSince = local && local.updatedAt !== sent.updatedAt;
  if (key === activeKey()) { rec = merged; saveLocal(); }
  else if (!(q[key] && q[key].forget)) lsSet(KEYS.rec(key), merged);
  if (changedSince && q[key]) { q[key].tries = 0; saveQueue(q); }
  else dropFromQueue(key);
}

// Last chance when the page is closed or hidden: send without waiting for a reply.
// The entry stays in the queue until a normal save is confirmed.
function sendBeaconNow() {
  if (!student || !rec || activeKey() === resettingKey || !navigator.sendBeacon || !apiUrl()) return;
  if (!loadQueue()[activeKey()]) return;
  try {
    navigator.sendBeacon(apiUrl(), new Blob([JSON.stringify({ action: "save", record: rec, name: profileName(rec) })], { type: "text/plain" }));
  } catch (e) { /* the queue will send it next time */ }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") sendBeaconNow(); });
window.addEventListener("pagehide", sendBeaconNow);

window.addEventListener("online", () => {
  const q = loadQueue();
  Object.keys(q).forEach(k => { q[k].nextAt = Date.now(); });
  saveQueue(q);
  updateNetBanner();
  flushQueue();
});
window.addEventListener("offline", updateNetBanner);
setInterval(updateNetBanner, 3000);

// V37: a yellow bar above the page when the device is offline, or work is still waiting.
function updateNetBanner() {
  const offline = navigator.onLine === false || (serverUnreachable && !!student);
  const waiting = Object.keys(loadQueue()).length;
  let msg = "";
  if (offline) msg = "📡 No internet. Your work is saved on this device and will be sent when the connection is back.";
  else if (sendProblem && waiting) msg = "⏳ Your answers have not been sent yet. They are safe on this device. We will keep trying.";
  let bar = document.getElementById("netBanner");
  if (!msg) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "netBanner"; bar.className = "net-banner"; bar.setAttribute("role", "status");
    document.body.insertBefore(bar, document.getElementById("app"));
  }
  if (bar.dataset.message !== msg) { setGraphicHtml(bar, escapeHtml(msg)); bar.dataset.message = msg; }
}

/* ---------------- Class list ---------------- */

// The cached list lets a student who has loaded it once log in offline (as in the LJ).
async function fetchClasses() {
  try {
    const reply = await api("GET", { action: "classes" }, 10000);
    if (reply.ok && Array.isArray(reply.classes)) {
      lsSet(KEYS.classes, reply.classes);
      return reply.classes;
    }
  } catch (e) { /* use the cached list below */ }
  return null;
}

/* ---------------- Page frame: top bar, footer, pop-ups ---------------- */

const app = document.getElementById("app");

// V33: give every answer box a name for screen readers, from the text next to it.
function labelFormControls() {
  document.querySelectorAll("#app input:not([type=hidden]), #app select, #app textarea").forEach(el => {
    if (el.getAttribute("aria-label")) return;
    if (el.labels && el.labels.length) return;
    const box = el.closest(".field, .card, label") || el.parentElement;
    let text = "";
    if (box) {
      const lab = box.querySelector("label, .field-label, p");
      text = (lab ? lab.textContent : box.textContent) || "";
    }
    text = text.replace(/\s+/g, " ").trim().slice(0, 100) || el.getAttribute("placeholder") || "Answer";
    el.setAttribute("aria-label", text);
  });
}
new MutationObserver(() => labelFormControls()).observe(app, { childList: true, subtree: true });

// The sticky top bar. On pages without their own heading, the app title is the h1.
function topBarHtml(opts) {
  const o = opts || {};
  const titleTag = o.titleIsHeading ? "h1" : "p";
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-titles">
          <p class="topbar-label">EBS Chapter 6</p>
          <${titleTag} class="topbar-title">Customer Service</${titleTag}>
          ${o.showSubtitle ? `<p class="topbar-sub">A self-study revision module</p>${Array.isArray(classList) && classList.length ? `<p class="topbar-chip">${escapeHtml(classList[0])}</p>` : ""}` : ""}
          ${o.showChip && student ? `<p class="topbar-chip"><span data-student-text>${escapeHtml(profileName(rec))}</span>${profileName(rec) ? " · " : ""}${escapeHtml(student.cls)} · Register No. ${student.reg}</p>` : ""}
        </div>
        ${o.showHome ? `<a href="#home" class="topbar-home" id="homeBtn" onclick="event.preventDefault();backToRoute('route')">🏠 Home</a>` : ""}
      </div>
    </header>`;
}

function footerHtml() {
  return `
    <footer class="credits">
      <p class="footer-actions"><a href="#teacher" class="teacher-link">Teacher Mode</a>
        <button type="button" class="teacher-link footer-reset" data-reset-progress>Reset progress</button>
        <button type="button" class="teacher-link footer-unlock" data-unlock-progress>Unlock</button></p>
      <p>A team effort by Anthony, Daniel, Joshua and Jufinnie <span class="nowrap">(NIE 2026)</span></p>
      <p class="credits-version">Version ${APP_VERSION}</p>
    </footer>`;
}

// A pop-up in the V45 style. buttons: [{label, primary, onClick}]; the first gets focus.
// Tab stays inside the pop-up while it is open.
function showModal({ id, title, bodyHtml, buttons, className }) {
  if (id && document.getElementById(id)) return null;
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop " + (className || "");
  if (id) wrap.id = id;
  setGraphicHtml(wrap, `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id || "modal"}Title">
      <h2 class="modal-title" id="${id || "modal"}Title">${title}</h2>
      ${bodyHtml || ""}
      <div class="btn-row modal-btns">
        ${buttons.map((b, i) => `<button type="button" class="btn ${b.primary ? "" : "secondary"}" data-i="${i}">${escapeHtml(b.label)}</button>`).join("")}
      </div>
    </div>`);
  const previousFocus=document.activeElement;
  document.body.appendChild(wrap);
  const btns = Array.from(wrap.querySelectorAll("button"));
  btns.forEach((el, i) => el.addEventListener("click", () => { wrap.remove(); if (buttons[i].onClick) buttons[i].onClick(); }));
  wrap.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){e.preventDefault();wrap.remove();if(previousFocus && previousFocus.isConnected)previousFocus.focus();return;}
    if (e.key !== "Tab") return;
    const controls = Array.from(wrap.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]"));
    const first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  btns[0].focus();
  return wrap;
}

// The shared footer is present on every route. No password is stored in the page.
document.addEventListener("click", e => {
  if (e.target.closest("[data-unlock-progress]")) showStudentUnlock();
  if (e.target.closest("[data-reset-progress]") && !resettingKey) showStudentUnlock("reset");
});

function showProgressReset(selectedStudent, verifiedCode) {
  const target = { ...(selectedStudent || student) };
  if (!target.cls || !target.reg) return;
  const key = studentKey(target.cls, target.reg);
  const previousFocus = document.activeElement;
  const wrap = document.createElement("div");
  wrap.id = "progressResetModal";
  wrap.className = "modal-backdrop";
  setGraphicHtml(wrap, `
    <form class="modal" role="dialog" aria-modal="true" aria-labelledby="progressResetTitle" aria-describedby="progressResetDescription">
      <h2 class="modal-title" id="progressResetTitle">Reset progress</h2>
      <p id="progressResetDescription">Clear all answers, badges and progress for ${escapeHtml(target.name || "Student")}, Class ${escapeHtml(target.cls)}, Register No. ${target.reg}, on this device and the server. This cannot be undone. The saved name will be removed and the register number freed for registration again. Other students' work will stay intact.</p>
      <div ${verifiedCode ? "hidden" : ""}><label for="progressResetPassword" class="field-label">Key in the reset password.</label>
      <input type="password" class="text-input" id="progressResetPassword" autocomplete="off" ${verifiedCode ? "" : "required"}></div>
      <p class="form-error" role="alert" id="progressResetError" hidden></p>
      <p role="status" id="progressResetStatus" hidden>Resetting progress…</p>
      <div class="btn-row modal-btns">
        <button type="submit" class="btn">Reset progress</button>
        <button type="button" class="btn secondary" id="cancelProgressReset">Cancel</button>
      </div>
    </form>`);
  document.body.appendChild(wrap);
  const input = wrap.querySelector("input");
  const buttons = Array.from(wrap.querySelectorAll("button"));
  const close = () => { wrap.remove(); if (previousFocus && previousFocus.isConnected) previousFocus.focus(); };
  wrap.querySelector("#cancelProgressReset").addEventListener("click", close);
  wrap.addEventListener("keydown", e => {
    if (e.key === "Escape" && !resettingKey) { e.preventDefault(); close(); }
    if (e.key !== "Tab") return;
    const controls = [input, ...buttons].filter(el => !el.disabled && el.getClientRects().length);
    if (!controls.length) { e.preventDefault(); return; }
    const first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  wrap.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    if (resettingKey) return;
    resettingKey = key;
    scheduleFlush();
    input.disabled = true;
    buttons.forEach(b => { b.disabled = true; });
    const error = wrap.querySelector("#progressResetError");
    const status = wrap.querySelector("#progressResetStatus");
    error.hidden = true;
    status.hidden = false;
    let reply;
    try {
      reply = await api("POST", { action: "resetProgress", code: verifiedCode || input.value, "class": target.cls, reg: target.reg }, 20000);
    } catch (err) { reply = { ok: false, error: "network" }; }
    input.value = "";
    resettingKey = "";
    status.hidden = true;
    if (reply.ok && reply.clearedAt) {
      resetGenerations.set(key, (resetGenerations.get(key) || 0) + 1);
      dropFromQueue(key);
      if (key === activeKey()) {
        close();
        releaseResetProfile(key);
      } else {
        lsRemove(KEYS.rec(key));
        close();
        showModal({id:"studentResetComplete",title:"Profile reset",bodyHtml:`<p>${escapeHtml(target.name || "Student")}, ${escapeHtml(target.cls)}, Register No. ${target.reg}: the name, answers, badges and progress have been cleared. The register number is available again. The student can register with a new name or register number.</p>`,buttons:[{label:"Close",primary:true,onClick:()=>{const b=document.querySelector("[data-reset-progress]");if(b)b.focus();}}]});
      }
      updateNetBanner();
    } else {
      error.textContent = reply.error === "bad_code" ? "Incorrect password. Try again."
        : reply.error === "locked_out" ? "Too many incorrect passwords. Try again in 10 minutes."
        : ["no_reset_code", "unknown_action"].includes(reply.error) ? "Reset is not set up on the server yet. Ask your teacher."
        : "Reset could not be confirmed. Connect to the internet and try again.";
      error.hidden = false;
      input.disabled = false;
      buttons.forEach(b => { b.disabled = false; });
      if (verifiedCode) buttons[0].focus(); else input.focus();
    }
    scheduleFlush();
  });
  if (verifiedCode) buttons[0].focus(); else input.focus();
}

// Unlock credentials stay in this dialog's memory and are checked again on every action.
function showStudentUnlock(mode = "unlock") {
  const resetting = mode === "reset";
  if (document.getElementById("studentUnlockModal")) return;
  const previousFocus = document.activeElement;
  const wrap = document.createElement("div");
  wrap.id = "studentUnlockModal";
  wrap.className = "modal-backdrop";
  let code = "", busy = false, profiles = [], requestNumber = 0;
  setGraphicHtml(wrap, `<form class="modal" role="dialog" aria-modal="true" aria-labelledby="studentUnlockTitle">
    <h2 class="modal-title" id="studentUnlockTitle">${resetting ? "Reset student progress" : "Unlock student levels"}</h2>
    <p>${resetting ? "Select a registered student profile to reset. You will confirm before any work is cleared." : "Select a registered student profile and open selected levels or all five levels. Answers, completed activities and badges will stay unchanged."}</p>
    <div id="unlockSignIn"><label class="field-label" for="unlockPassword">Key in the ${resetting ? "reset" : "unlock"} passcode.</label>
      <input class="text-input" type="password" id="unlockPassword" autocomplete="off" required>
      <div class="btn-row"><button class="btn" type="submit">Continue</button></div></div>
    <div id="unlockSelection" hidden>
      <div class="field"><label class="field-label" for="unlockClass">Class</label><select class="text-input" id="unlockClass"><option value="">Choose a class</option></select></div>
      <div class="field"><label class="field-label" for="unlockStudent">Student profile</label><select class="text-input" id="unlockStudent" disabled><option value="">Choose a student</option></select><p id="unlockIdentity" class="field-note" data-student-text></p></div>
      <p id="unlockExisting" role="status"></p>
      <fieldset class="unlock-levels" ${resetting ? "hidden" : ""}><legend>Select levels to unlock</legend>
        ${LEVELS.map((l,i)=>`<label class="unlock-level-option"><input type="checkbox" value="${i+1}">Level ${i+1}: ${escapeHtml(l.title)}</label>`).join("")}
      </fieldset>
      <div class="btn-row"><button class="btn secondary" type="button" id="unlockAllSelection" ${resetting ? "hidden" : ""}>Select all levels</button>
        <button class="btn" type="submit" id="applyUnlock" disabled>${resetting ? "Continue to reset" : "Unlock selected levels"}</button></div>
      <p class="muted" ${resetting ? "hidden" : ""}>Previously unlocked levels stay open. The student can refresh the app or log in again on another device to use the new access.</p>
    </div>
    <p class="form-error" id="unlockError" role="alert" hidden></p>
    <p id="unlockStatus" role="status" hidden></p>
    <div class="btn-row modal-btns"><button class="btn secondary" type="button" id="cancelUnlock">Cancel</button></div>
  </form>`);
  document.body.appendChild(wrap);
  const input = wrap.querySelector("#unlockPassword");
  const cls = wrap.querySelector("#unlockClass"), reg = wrap.querySelector("#unlockStudent");
  const apply = wrap.querySelector("#applyUnlock"), error = wrap.querySelector("#unlockError"), status = wrap.querySelector("#unlockStatus");
  const checks = Array.from(wrap.querySelectorAll("input[type=checkbox]"));
  const close = () => { code = ""; requestNumber++; wrap.remove(); if (previousFocus && previousFocus.isConnected) previousFocus.focus(); };
  const fail = reply => {
    error.textContent = reply.error === "bad_code" ? "Incorrect passcode. Try again."
      : reply.error === "locked_out" ? "Too many incorrect passcodes. Try again in 10 minutes."
      : ["unknown_action", "no_teacher_code"].includes(reply.error) ? "Unlock is not set up on the server yet. Ask your teacher to update Apps Script."
      : reply.error === "no_student" ? "This student profile is no longer available. Choose another student."
      : "Could not confirm the change. Check your internet connection and try again.";
    error.hidden = false;
  };
  const update = () => {
    apply.disabled = busy || !reg.value || (!resetting && !checks.some(c=>c.checked && !c.disabled));
  };
  const setBusy = value => {
    busy = value;
    wrap.querySelectorAll("button, input, select").forEach(el => { el.disabled = value; });
    if (!value) { reg.disabled = !profiles.length; update(); }
  };
  wrap.querySelector("#cancelUnlock").addEventListener("click", close);
  wrap.addEventListener("keydown", e => {
    if (e.key === "Escape" && !busy) { e.preventDefault(); close(); }
    if (e.key !== "Tab") return;
    const controls = Array.from(wrap.querySelectorAll("button,input,select")).filter(el=>!el.disabled && el.getClientRects().length);
    if (!controls.length) { e.preventDefault(); return; }
    const first = controls[0], last = controls[controls.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  checks.forEach(c=>c.addEventListener("change",update));
  wrap.querySelector("#unlockAllSelection").addEventListener("click",()=>{ checks.forEach(c=>{c.checked=true;}); update(); });
  reg.addEventListener("change",()=>{
    checks.forEach(c=>{c.checked=false;});
    const profile=profiles.find(p=>String(p.reg)===reg.value);
    wrap.querySelector("#unlockIdentity").textContent=profile ? `${profile.name || "Name not added yet"} · Register No. ${profile.reg}` : "";
    const grants=Object.keys((profile && profile.unlockedLevels) || {}).filter(n=>/^[1-5]$/.test(n));
    wrap.querySelector("#unlockExisting").textContent=profile && !resetting ? (grants.length ? `Previously unlocked levels: ${grants.join(", ")}.` : "No levels have been manually unlocked for this student.") : "";
    update();
  });
  cls.addEventListener("change",async()=>{
    const sequence=++requestNumber;
    busy=false;
    profiles=[]; reg.innerHTML='<option value="">Choose a student</option>'; reg.disabled=true;
    checks.forEach(c=>{c.checked=false;}); wrap.querySelector("#unlockExisting").textContent="";wrap.querySelector("#unlockIdentity").textContent=""; error.hidden=true; update();
    if (!cls.value) return;
    busy=true; update(); status.textContent="Loading student profiles…"; status.hidden=false;
    let reply;
    try { reply=await api("POST",{action:"profileList",purpose:mode,code,"class":cls.value},15000); } catch(e) { reply={ok:false,error:"network"}; }
    if (!wrap.isConnected || sequence!==requestNumber) return;
    busy=false; status.hidden=true;
    if (!reply.ok) { fail(reply); update(); return; }
    profiles=reply.students || [];
    reg.innerHTML='<option value="">Choose a student</option>'+profiles.map(p=>`<option value="${p.reg}">${escapeHtml(p.name ? `${p.name} · Register No. ${p.reg}` : `Register No. ${p.reg} (name not added yet)`)}</option>`).join("");
    reg.disabled=!profiles.length;
    if (!profiles.length) { status.textContent="No registered student profiles in this class yet. Students must log in and save their names first."; status.hidden=false; }
    update();
  });
  wrap.querySelector("form").addEventListener("submit",async e=>{
    e.preventDefault(); if(busy) return;
    error.hidden=true; status.hidden=false;
    const signingIn=!wrap.querySelector("#unlockSignIn").hidden;
    if(signingIn) {
      code=input.value; input.value="";
      setBusy(true); status.textContent="Checking passcode…";
      let reply;
      try { reply=await api("POST",{action:"profileClasses",purpose:mode,code},15000); } catch(e) { reply={ok:false,error:"network"}; }
      if(!wrap.isConnected) return;
      status.hidden=true; setBusy(false);
      if(!reply.ok) { code=""; fail(reply); input.focus(); return; }
      input.required=false;
      cls.innerHTML='<option value="">Choose a class</option>'+(reply.classes || []).map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
      wrap.querySelector("#unlockSignIn").hidden=true; wrap.querySelector("#unlockSelection").hidden=false; cls.focus(); return;
    }
    if(resetting && reg.value) {
      const profile=profiles.find(p=>String(p.reg)===reg.value);
      const target={cls:cls.value,reg:Number(reg.value),name:profile && profile.name || ""};
      const resetCode=code;close();showProgressReset(target,resetCode);return;
    }
    const levels=checks.filter(c=>c.checked).map(c=>Number(c.value));
    if(!reg.value || !levels.length) { status.hidden=true; return; }
    const selectedProfile=profiles.find(p=>String(p.reg)===reg.value);
    const target={cls:cls.value,reg:Number(reg.value),name:selectedProfile && selectedProfile.name || ""};
    setBusy(true); status.textContent="Unlocking selected levels…";
    let reply;
    try { reply=await api("POST",{action:"unlockStudent",code,"class":target.cls,reg:target.reg,levels},20000); } catch(e) { reply={ok:false,error:"network"}; }
    if(!wrap.isConnected) return;
    setBusy(false); status.hidden=true;
    if(!reply.ok) { fail(reply); return; }
    const key=studentKey(target.cls,target.reg);
    const local=key===activeKey() ? rec : lsGet(KEYS.rec(key));
    if(!local || String(local.baseClearedAt || "")<=String(reply.clearedAt || "")) {
      const sameEpoch=local && String(local.baseClearedAt || "")===String(reply.clearedAt || "");
      const merged=mergeRecords(reply.record,sameEpoch ? local : null);
      if(key===activeKey()) { rec=merged; saveLocal(); } else lsSet(KEYS.rec(key),merged);
    }
    close(); render();
    showModal({id:"studentUnlocked",title:"Levels unlocked",bodyHtml:`<p>${escapeHtml(target.name || "Student")}, Class ${escapeHtml(target.cls)}, Register No. ${target.reg}: levels ${levels.join(", ")} are now open. Answers and completion remain unchanged.</p>`,buttons:[{label:"Close",primary:true,onClick:()=>{const b=document.querySelector("[data-unlock-progress]");if(b)b.focus();}}]});
  });
  input.focus();
}

/* ---------------- 0.2 Before you start ---------------- */

const BRIEFING_ICONS = ["🗺️", "💾", "🤖", "🔁", "👀"];
const BRIEFING = [
  "Go through the levels in order. Each one opens when you finish the one before.",
  "Your work saves automatically. You can stop and come back any time, even on a different device: just log in with the same class and register number.",
  "Levels 3 and 4 open an AI chatbot in a new tab. Log in with your school Google account if asked, and don't share personal details in the chat.",
  "After you submit, you'll see a hint for anything you got wrong, and you get one more try.",
  "Your teacher can see your answers, so do your best."
];

// Until the student taps "I'm ready", every page shows this pop-up (as in LJ V38).
function showBriefing() {
  const agreed = !!(rec && rec.agreed);
  showModal({
    id: "briefing",
    className: "briefing-modal",
    title: "📋 Before you start",
    bodyHtml: `<ol class="briefing-list">${BRIEFING.map((b, i) => `<li><span class="brief-icon" aria-hidden="true">${BRIEFING_ICONS[i]}</span><span>${escapeHtml(b)}</span></li>`).join("")}</ol>`,
    buttons: [{
      label: agreed ? "Close" : "✅ I'm ready",
      primary: true,
      onClick: () => {
        if (!agreed && rec) {
          rec.agreed = nowIso();
          queueSave("soon");
          if (window.location.hash !== "#home") { window.location.hash = "#home"; return; }
          render();
        }
      }
    }]
  });
}

const STAGE_COLOURS = ["#2563eb","#c2410c","#15803d","#0f766e","#7c3aed"];
function moodFaceHtml(i) {
  const fills=["#ef4444","#f87171","#fb923c","#fdba74","#fde68a","#bef264","#86efac","#22c55e"];
  const mouth=i<3?'<path d="M10 23 Q16 16 22 23" fill="none"/>':i<5?'<path d="M11 21 H21"/>':i<7?'<path d="M10 19 Q16 26 22 19" fill="none"/>':'<path d="M9 18 Q16 30 23 18 Z" fill="#42202a"/><path d="M12 24 Q16 20 20 24" stroke="#fb7185"/>';
  const eyes=i===7?'<path d="M9 13 Q11 9 13 13 M19 13 Q21 9 23 13" fill="none"/>':'<circle cx="11" cy="14" r="1.3" fill="#42202a"/><circle cx="21" cy="14" r="1.3" fill="#42202a"/>';
  return `<svg class="mood-graphic mood-${i}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="${fills[i]}" stroke="#42202a" stroke-width="1.5"/><g stroke="#42202a" stroke-width="1.8" stroke-linecap="round">${eyes}${i<2?'<path d="M8 9 L13 11 M19 11 L24 9"/>':""}${mouth}</g></svg>`;
}
// The shared chat link: any pasted text that contains "gemini" is accepted (no server check).
const CONVERSATION_LINK_HELP = "Please paste the link to your Gemini chat. It should contain the word Gemini.";
function conversationReady(n){return /gemini/i.test(String(getAnswer(`s${n}.link`)||""));}
// Show the help line once something is pasted (or the tick box is ticked) without "gemini".
function conversationLinkProblem(n){return !conversationReady(n) && (!!String(getAnswer(`s${n}.link`)||"").trim() || getAnswer(`s${n}.tick`)===true);}
function conversationLinkHtml(n,readOnly) {
  return `<section class="card conversation-share" aria-label="Your conversation link"><label class="field-label" for="conversationLink${n}">Paste your Gemini conversation share link</label><p class="field-note" id="conversationHelp${n}">Use Share in Gemini and copy the conversation link then paste it below.</p><input class="text-input" type="url" id="conversationLink${n}" value="${escapeHtml(getAnswer(`s${n}.link`)||"")}" placeholder="https://gemini.google.com/share/..." aria-describedby="conversationHelp${n} conversationError${n}" ${readOnly?"readonly":""}><p class="field-note link-error" id="conversationError${n}" role="status">${conversationLinkProblem(n)?escapeHtml(CONVERSATION_LINK_HELP):""}</p></section>`;
}
function wireConversationLink(el,n){
  const input=el.querySelector(`#conversationLink${n}`);if(!input)return;
  const status=el.querySelector(`#conversationError${n}`);
  const update=()=>{status.textContent=conversationLinkProblem(n)?CONVERSATION_LINK_HELP:"";const next=document.getElementById('nextBtn');if(next && !isDone(n))next.disabled=!(getAnswer(`s${n}.tick`)===true && conversationReady(n));};
  input.addEventListener('input',()=>{setAnswer(`s${n}.link`,input.value.trim(),'typing');update();});
  input.addEventListener('change',()=>{setAnswer(`s${n}.link`,input.value.trim(),'soon');update();});
}

const ROLEPLAY_STAGE_LABELS=["Approach","Present","Close","Support","Recovery"];
function roleplayStagesHtml(readOnly){const chosen=getAnswer('s4.stages')||[];return `<fieldset class="card roleplay-stages"><legend class="field-label">1. Which stages did you do?</legend><p>Select every stage you used: Approach, Present, Close, Support, Recovery.</p><div class="stage-checklist">${ROLEPLAY_STAGE_LABELS.map((name,i)=>`<label class="stage-chip" style="--stage-colour:${STAGE_COLOURS[i]}"><input type="checkbox" data-roleplay-stage="${name}" ${chosen.includes(name)?'checked':''} ${readOnly?'disabled':''}>${uiGraphicHtml(STAGES[i].icon)} ${name}</label>`).join('')}</div></fieldset>`;}
function wireRoleplayStages(el){el.querySelectorAll('[data-roleplay-stage]').forEach(x=>x.addEventListener('change',()=>setAnswer('s4.stages',Array.from(el.querySelectorAll('[data-roleplay-stage]:checked')).map(x=>x.dataset.roleplayStage),'soon')));}
function popConfetti(){
  if(reducedMotion())return;
  document.querySelector('.confetti-burst')?.remove();const layer=document.createElement('div');layer.className='confetti-burst';layer.setAttribute('aria-hidden','true');
  for(let i=0;i<48;i++){const piece=document.createElement('i');piece.style.cssText=`--x:${(i*37)%100}%;--drift:${(i%2?-1:1)*(30+i%90)}px;--delay:${i%8*0.06}s;background:${STAGE_COLOURS[i%5]}`;layer.appendChild(piece);}document.body.appendChild(layer);setTimeout(()=>layer.remove(),2600);
}
function lessonCards(){
  const groups=[
    {label:"Customer service",parts:[[0,0]]},
    {label:"Why good service matters",parts:[[0,1]]},
    {label:"Skills and product knowledge",parts:[[0,2],[0,3]]},
    {label:"The Five Stages",parts:[[1,0]]},
    {label:"Approaching customers",parts:[[1,1],[1,2],[1,3]],key:"s2.video"},
    {label:"Presenting and supporting",parts:[[1,4],[1,5]]},
    {label:"Breakdown and recovery",parts:[[2,0]]},
    {label:"The eight recovery steps",recovery:true,parts:[[2,1]]},
    {label:"Learning from poor recovery",parts:[[2,2]],key:"s2.think1"},
    {label:"Returns and exchanges",parts:[[2,3],[2,4]],key:"s2.think2"}
  ];
  return groups.map(group=>({...group,t:group.parts[0][0],p:group.parts[0][1],
    html:ctx=>group.recovery ? recoveryLessonHtml() : group.parts.map(([t,p],i)=>`<div class="lesson-subsection" data-subpart="${i}">${L2_TABS[t].parts[p].html(ctx)}</div>`).join(""),
    wire:(el,ctx)=>{if(group.recovery){wireRecoveryLesson(el);return;}group.parts.forEach(([t,p],i)=>{const section=el.querySelector(`[data-subpart="${i}"]`);L2_TABS[t].parts[p].wire?.(section,ctx);wireReflections(section);});}
  }));
}
function recoveryLessonHtml(){
  return `<div class="head-row"><h2>The eight service recovery steps</h2>${listenButtonHtml()}</div><p>To perform service recovery, follow these 8 steps:</p><p>Follow Nexora's staff member as he handles a customer whose new phone screen has cracked.</p>${recoveryPathHtml(8,false)}${afterPathHtml()}`;
}
function wireRecoveryLesson(el){raiseReached("s2.path",8);saveLocal();wireListen(el);}

function renderLessonCard(){
  stopSpeaking();setUi('route.level',2);
  const cards=lessonCards();
  if(getUi('s2.cardLayout')!=="compact10"){const map=[0,1,2,2,3,4,4,5,5,6,7,7,7,7,7,7,7,7,8,9,9];const old=Number(getUi('s2.card'))||0;setUi('s2.card',map[old]??0);if(old>=10 && old<=17)setUi('s2.recoveryStep',old-10);setUi('s2.cardLayout','compact10');saveLocal();}
  let pos=Number(getUi('s2.card'))||0;pos=Math.max(0,Math.min(pos,cards.length-1));const card=cards[pos];
  const ctx={n:2,t:card.t,readOnly:isDone(2),fresh:true};
  setGraphicHtml(app,`${topBarHtml({showHome:true,showChip:true})}<main class="page level-page lesson-single" id="levelMain"><h1 class="page-title">Level 2: Learn: Customer Service</h1><div class="lesson-card-progress"><p id="lessonProgressText">${pos+1} of ${cards.length} · ${escapeHtml(card.label)}</p><div class="progress-track" role="progressbar" aria-label="Lesson cards" aria-valuemin="1" aria-valuemax="${cards.length}" aria-valuenow="${pos+1}"><div class="progress-fill" style="width:${(pos+1)/cards.length*100}%"></div></div></div><section class="card lesson-card" id="lessonCard">${card.html(ctx)}</section><div class="btn-row lesson-card-nav"><button class="btn secondary" id="lessonBack" ${pos===0?'disabled':''}>Back</button><button class="btn" id="lessonNext">${pos===cards.length-1?'Finish Level 2':'Next →'}</button></div></main>${footerHtml()}`);
  syncStickyOffsets();const el=document.getElementById('lessonCard');el.querySelector('#finishBtn')?.remove();card.wire(el,ctx);
  if(rec.agreed && !isStarted(2))raiseReached('s2.t0',1);
  document.getElementById('lessonBack').onclick=()=>{setUi('s2.card',pos-1);queueSave('now');renderLessonCard();revealFocus(document.getElementById('lessonCard'));};
  document.getElementById('lessonNext').onclick=()=>{if(!requireReflections(card.key?[card.key]:[]))return;if(pos===cards.length-1){finishLevel(2);return;}setUi('s2.card',pos+1);raiseReached('s2.cardReached',pos+1);raiseReached(`s2.t${card.t}`,card.p+1);queueSave('now');renderLessonCard();revealFocus(document.getElementById('lessonCard'));};
}

/* ---------------- Router ---------------- */

let routeReturnLevel = null;
function backToRoute(n){routeReturnLevel=n || Number(getUi("route.level")) || 1;if(location.hash === "#home")render();else location.hash="#home";}

function render() {
  const hash = window.location.hash;
  document.querySelectorAll(".modal-backdrop").forEach(m => { if (m.id !== "briefing") m.remove(); });
  document.querySelectorAll(".zoom-backdrop").forEach(m => m.remove());
  if (hash === "#teacher") { renderTeacher(); window.scrollTo(0, 0); return; }
  const teacherLevel = hash.match(/^#teacher-preview-([1-5])$/);
  if (teacherLevel) {
    if (teacher) renderTeacherLesson(Number(teacherLevel[1]));
    else renderTeacherGate();
    window.scrollTo(0, 0);
    return;
  }
  if (!student) { renderLanding(); return; }
  const m = hash.match(/^#level([1-5])$/);
  if (hash === "#terms") renderTerms();
  else if (hash === "#report") renderReport();
  else if (m && isUnlocked(Number(m[1]))) renderLevel(Number(m[1]));
  else {
    if (hash !== "#home" && hash !== "") { history.replaceState(null, "", "#home"); }
    renderHome();
  }
  syncStickyOffsets();
  window.scrollTo(0, 0);
  if((hash === "#home" || hash === "") && routeReturnLevel){const target=routeReturnLevel==="route"?document.getElementById("routeProgress"):document.getElementById(`levelCard${routeReturnLevel}`);routeReturnLevel=null;requestAnimationFrame(()=>revealFocus(target));}
  if (rec && !rec.agreed && !document.getElementById("briefing")) showBriefing();
}
window.addEventListener("hashchange", render);

/* ---------------- 0.1 Landing page and log-in ---------------- */

let classList = lsGet(KEYS.classes);  // null until loaded once
let classListFailed = false;

function renderLanding() {
  const loaded = Array.isArray(classList);
  const empty = loaded && classList.length === 0;
  const note = !loaded && classListFailed
    ? "Connect to the internet to load your class list, then refresh this page."
    : empty ? "No classes are available to select yet. Ask your teacher." : "";
  const typed = (document.getElementById("regInput") || {}).value || "";
  const typedName = (document.getElementById("nameInput") || {}).value || "";
  setGraphicHtml(app, `
    ${topBarHtml({ titleIsHeading: true, showSubtitle: true })}
    <main class="page">
      <div class="block landing-banner">${imgHtml("WELCOME", "welcome-activity-banner")}</div>
      <div class="block">
        <div class="card login-card">
          <h2 class="card-title">Step 1: Log in</h2>
          <div class="field"><label for="classInput" class="field-label">Your class</label><input id="classInput" class="text-input" readonly value="${escapeHtml(loaded && !empty ? classList[0] : "")}"></div>
          ${note ? `<p class="field-note" id="classNote">${escapeHtml(note)}</p>` : ""}
          <div class="field"><label for="nameInput" class="field-label">Your name</label><input type="text" id="nameInput" class="text-input" maxlength="80" autocomplete="name" value="${escapeHtml(typedName)}"><p class="field-note">Use the same name, class and register number each time to find your progress.</p></div>
          <div class="field">
            <label for="regInput" class="field-label">Choose your register number.</label>
            <select id="regInput" class="select-input reg-input"><option value="" ${typed ? "" : "selected"}>Choose your register number…</option>${Array.from({length:50},(_,i)=>i+1).map(n=>`<option value="${n}" ${String(n)===typed ? "selected" : ""}>${n}</option>`).join("")}</select>
          </div>
          <p id="loginError" class="form-error" role="alert" hidden></p>
          <div class="btn-row"><button class="btn" id="startBtn" type="button">Start</button></div>
        </div>
      </div>
      <div class="block">
        <p class="lead">Hi! In this module, you'll revise Chapter 6: Customer Service. You'll read short notes, chat with an AI customer service officer, serve an AI customer yourself, and check what you've learnt.</p>
      </div>

    </main>
    ${footerHtml()}
  `);
  document.getElementById("startBtn").addEventListener("click", startLogin);
}

// Load the class list for the landing page, then redraw it if anything changed.
async function refreshClassList() {
  const fresh = await fetchClasses();
  if (fresh) {
    const changed = JSON.stringify(fresh) !== JSON.stringify(classList);
    classList = fresh;
    classListFailed = false;
    if (changed && !student && !/^#teacher/.test(window.location.hash)) renderLanding();
  } else if (!Array.isArray(classList)) {
    classListFailed = true;
    if (!student && !window.location.hash) renderLanding();
  }
}

async function startLogin() {
  const cls = document.getElementById("classInput").value;
  const regText = document.getElementById("regInput").value.trim();
  const name = document.getElementById("nameInput").value.trim().replace(/\s+/g," ");
  const errEl = document.getElementById("loginError");
  const btn = document.getElementById("startBtn");
  const showError = (msg) => { errEl.textContent = msg; errEl.hidden = false; };
  errEl.hidden = true;
  if (!cls) { showError("No registration class is available. Ask your teacher to select a class."); return; }
  btn.disabled = true;
  const available = await fetchClasses();
  btn.disabled = false;
  if (available && available[0] !== cls) {
    classList = available; renderLanding();
    const error = document.getElementById("loginError");
    error.textContent = "Your teacher changed the registration class. Check the class at the top, then save again.";
    error.hidden = false; return;
  }
  if (!regText) { showError("Please choose your register number."); return; }
  const reg = Number(regText);
  if (!/^\d+$/.test(regText) || reg < 1 || reg > 50) { showError("Choose a register number from 1 to 50."); return; }

  if (!name) { showError("Please key in your name at the top of the page."); document.getElementById("nameInput").focus(); return; }
  btn.disabled = true;
  btn.textContent = "Checking...";
  const key = studentKey(cls, reg);
  let local = lsGet(KEYS.rec(key));
  let reply = null;
  try { reply = await loadStudentRecord(cls, reg, name); }
  catch (e) { reply = null; }

  if (reply && !reply.ok && reply.error === "no_class") {
    // The class was removed since the list was loaded.
    btn.disabled = false; btn.textContent = "Start";
    await refreshClassList();
    renderLanding();
    document.getElementById("regInput").value = regText;
    document.getElementById("loginError").textContent = "Please choose your class.";
    document.getElementById("loginError").hidden = false;
    return;
  }

  if(reply && !reply.ok){
    btn.disabled=false;btn.textContent="Start";
    showError(reply.error === "profile_setup_required" ? "Ask your teacher to set up the name for this existing profile." : "This register number has already been registered to a student profile. Check the class, register number and saved name.");
    return;
  }
  let returning;
  let record;
  if (reply && reply.ok) {
    // Work cleared by a teacher after this device's copy was made is thrown away.
    if (local && reply.clearedAt && String(local.baseClearedAt || "") < reply.clearedAt) local = null;
    returning = !!(reply.record || local);
    record = returning ? mergeRecords(reply.record, local) : freshRecord(cls, reg, reply.clearedAt);
    record.baseClearedAt = reply.clearedAt || record.baseClearedAt || "";
  } else {
    // Offline (or the server could not answer): use the work saved on this device.
    serverUnreachable = true;
    returning = !!local;
    record = local || freshRecord(cls, reg, "");
  }
  const savedName = profileName(record);
  if (savedName && savedName.toLocaleLowerCase() !== name.toLocaleLowerCase()) {
    btn.disabled=false;btn.textContent="Start";
    showError("This register number has already been registered to a student profile. Enter the saved name to open that profile; the name and register number cannot be changed.");
    document.getElementById("nameInput").focus();return;
  }
  record.cls = cls;
  record.reg = reg;
  record.profile = record.profile || {};
  if (!profileName(record)) record.profile.name = {v:name,t:nowIso()};

  student = { cls, reg };
  rec = record;
  lsSet(KEYS.active, student);
  saveLocal();
  // Send anything this device had that the server did not (and check the connection).
  enqueue(key, Date.now(), false);
  updateNetBanner();
  justLoggedIn = true;
  if (window.location.hash === "#home") render();
  else window.location.hash = "#home";
}

/* ---------------- Progress helpers ---------------- */

function isDone(num) { return !!(rec && rec.done && rec.done[num]); }
function doneCount() { return LEVELS.filter(s => isDone(s.num)).length; }
function unlockAllOnDevice() { return lsGet(KEYS.unlockAll) === true; }
function hasLevelGrant(num) { return !!(rec && rec.unlockedLevels && rec.unlockedLevels[num]); }
function isUnlocked(num) { return num === 1 || isDone(num - 1) || hasLevelGrant(num) || unlockAllOnDevice(); }

// "In progress" once the student has done anything in the level.
function isStarted(num) {
  if (!rec) return false;
  const re = new RegExp("^s" + num + "(\\D|$)");
  return ["answers", "reached", "ui", "submitted", "first"].some(sec => Object.keys(rec[sec] || {}).some(k => re.test(k)));
}

function levelStatus(num) {
  if (isDone(num)) return "done";
  if (!isUnlocked(num)) return "locked";
  return isStarted(num) ? "progress" : "new";
}

/* ---------------- 0.3 Home page ---------------- */

// Agreed with the group (see docs/progress.md), replacing the storyboard's shorter lines.
// justLoggedIn: the first home page after logging in, when "Your work has been loaded." is shown.
let justLoggedIn = false;
function welcomeLine(done, loaded) {
  if (done === 0) return "👋 Welcome to Chapter 6: Customer Service! In 5 short levels, you'll find out what great customer service looks like, chat with an AI customer service officer, and even serve a customer yourself. Take your time, and do your best. Start with Level 1 below. You've got this!";
  if (done === LEVELS.length) return "🎉 Amazing work! You've finished all 5 levels. Have a look at your learning report to see how you did.";
  return `👋 Welcome back! ${loaded ? "Your work has been loaded. " : ""}You've finished ${done} of 5 levels. Great progress! Carry on with Level ${done + 1} below.`;
}

function renderLevelCard(s) {
  const status = levelStatus(s.num);
  const pill = status === "done" ? `<span class="status-pill done">✅ ${escapeHtml(s.badge)}</span>`
    : status === "locked" ? `<span class="status-pill locked">🔒 Locked</span>`
    : status === "progress" ? `<span class="status-pill progress">In progress</span>`
    : `<span class="status-pill">Not started</span>`;
  return `
    <li class="level-item">
      <button type="button" class="level-card status-${status}" id="levelCard${s.num}" data-num="${s.num}" ${status === "locked" ? `aria-disabled="true" aria-describedby="lockedMsg${s.num}"` : ""}>
        <span class="num-badge" aria-hidden="true">${status === "done" ? "✓" : status === "locked" ? "🔒" : s.num}</span>
        <span class="info">
          <span class="level-name ${s.iconImg ? "with-graphic" : ""}"><span aria-hidden="true">${levelIconHtml(s)}</span> <span><span class="visually-hidden">Level ${s.num}: </span>${escapeHtml(s.title)}</span></span>
          <span class="level-desc">${escapeHtml(s.desc)}</span>
          ${pill}
        </span>
      </button>
      <p class="locked-msg" id="lockedMsg${s.num}" role="status" hidden></p>
    </li>`;
}

function badgeShelfHtml() {
  return `<ul class="badge-shelf">${LEVELS.map(s => {
    const got = isDone(s.num);
    return `<li class="shelf-badge ${got ? "earned" : ""}">
      <div class="shelf-img">${imgHtml(s.badgeImg, "badge-img")}</div>
      <div class="shelf-name">${escapeHtml(s.badge)}<span class="visually-hidden">${got ? ", earned" : ", not earned yet"}</span></div>
    </li>`;
  }).join("")}</ul>`;
}

function renderHome() {
  const done = doneCount();
  const loaded = justLoggedIn;
  justLoggedIn = false;
  setGraphicHtml(app, `
    ${topBarHtml({ titleIsHeading: true, showChip: true })}
    <main class="page">
      <div class="block landing-banner">${imgHtml("WELCOME", "welcome-activity-banner")}</div>
      ${profileName(rec) ? "" : `<form class="card block" id="studentNameForm"><div class="field home-class-field"><label class="field-label" for="studentClassInput">Your class</label><input class="text-input" id="studentClassInput" readonly value="${escapeHtml(student.cls)}"></div><label class="field-label" for="studentNameInput">Your name</label><input class="text-input" id="studentNameInput" maxlength="80" autocomplete="name" value="${escapeHtml(profileName(rec))}" ${profileName(rec) ? "readonly" : "required"}><div class="field home-register-field"><label class="field-label" for="studentRegisterInput">Register number</label><select class="select-input" id="studentRegisterInput" disabled aria-describedby="studentRegisterNote">${student.reg > 50 ? `<option value="${student.reg}" selected>${student.reg}</option>` : ""}${Array.from({length:50},(_,i)=>i+1).map(n=>`<option value="${n}" ${n === Number(student.reg) ? "selected" : ""}>${n}</option>`).join("")}</select><p class="field-note" id="studentRegisterNote">Your register number is tied to this profile and cannot be edited.</p></div>${profileName(rec) ? "" : `<div class="btn-row"><button type="submit" class="btn secondary">Save name</button></div>`}<p id="studentNameStatus" role="status">${profileName(rec) ? "Profile saved. Name and register number cannot be edited." : "Check your name before saving. Once saved, it cannot be edited."}</p></form>`}
      <div class="block">
        ${done === LEVELS.length ? "" : `<div class="welcome-card"><p class="welcome-text">${escapeHtml(welcomeLine(done, loaded))}</p></div>`}
        <p class="home-links">
          <a href="#" id="howLink">📋 How this works</a>
          <span class="dot-sep" aria-hidden="true">·</span>
          <a href="#" id="switchLink">🔄 Sharing this device? Switch student</a>
        </p>
      </div>
      <div class="block">
        <a href="#terms" class="terms-card">
          ${graphicIconHtml("ICON_TERMS", "terms-guide-graphic")}
          <span><strong>Start here: 4 key terms</strong><br><span class="terms-sub">A 1-minute look before Level 2</span></span>
        </a>
      </div>
      <section class="block" aria-labelledby="routeTitle">
        <h2 class="section-title" id="routeTitle">Your route</h2>
        <div class="journey-progress" id="routeProgress">
          <p class="journey-count">${done} of 5 levels done</p>
          <div class="progress-track" role="progressbar" aria-label="Levels done" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${done}"><div class="progress-fill" style="width:${done / 5 * 100}%"></div></div>
        </div>
        <ol class="route">${LEVELS.map(renderLevelCard).join("")}</ol>
      </section>
      <section class="block" aria-labelledby="badgesTitle">
        <h2 class="section-title" id="badgesTitle">🏅 Your badges</h2>
        ${badgeShelfHtml()}
      </section>
      ${done === LEVELS.length ? `<section class="block home-learning-report" aria-label="Learning report"><div class="welcome-card"><p class="welcome-text">${escapeHtml(welcomeLine(done, loaded))}</p><div class="btn-row welcome-btn"><a href="#report" class="btn">📊 My learning report</a></div></div></section>` : ""}
    </main>
    ${footerHtml()}
  `);
  document.getElementById("studentNameForm")?.addEventListener("submit", e=>{
    e.preventDefault();const name=document.getElementById("studentNameInput").value.trim().replace(/\s+/g," ");
    if(!name || profileName(rec))return;
    rec.profile=rec.profile || {};rec.profile.name={v:name,t:nowIso()};queueSave("now");
    // Saved: the profile card goes, so "Your route" sits near the top. The name stays in the header chip.
    renderHome();syncStickyOffsets();
  });
  document.getElementById("howLink").addEventListener("click", (e) => { e.preventDefault(); showBriefing(); });
  document.getElementById("switchLink").addEventListener("click", (e) => { e.preventDefault(); confirmSwitchStudent(); });
  LEVELS.forEach(s => {
    document.getElementById(`levelCard${s.num}`).addEventListener("click", () => {
      if (levelStatus(s.num) === "locked") {
        const msg = document.getElementById(`lockedMsg${s.num}`);
        msg.textContent = `Finish Level ${s.num - 1} first to open this level.`;
        msg.hidden = false;
        return;
      }
      window.location.hash = `#level${s.num}`;
    });
  });
}

/* ---------------- Switch student ---------------- */

function confirmSwitchStudent() {
  showModal({
    id: "switchModal",
    title: "🔄 Switch student",
    bodyHtml: `<p>Log in as a different student? The work for Class ${escapeHtml(student.cls)}, Register No. ${student.reg} stays saved.</p>`,
    buttons: [
      { label: "Switch student", primary: true, onClick: switchStudent },
      { label: "Cancel" }
    ]
  });
}

function switchStudent() {
  const key = activeKey();
  saveLocal();
  // The device copy is deleted once it has reached the server; unsent work stays queued until it goes.
  const q = loadQueue();
  if (q[key]) { q[key].forget = true; q[key].nextAt = Date.now(); saveQueue(q); }
  else lsRemove(KEYS.rec(key));
  lsRemove(KEYS.active);
  student = null;
  rec = null;
  serverUnreachable = false;
  updateNetBanner();
  flushQueue();
  if (window.location.hash) window.location.hash = "";
  else render();
  refreshClassList();
}

/* ---------------- 0.4 4 key terms ---------------- */

const KEY_TERMS = [
  { term: "Customer service", icon: "TERM_SERVICE", tone: "service", text: "Refers to what businesses do for their customers so that they are happy and satisfied." },
  { term: "Quality customer service", icon: "TERM_QUALITY", tone: "quality", text: "Means doing more for customers to exceed their expectations." },
  { term: "Service breakdown", icon: "TERM_BREAKDOWN", tone: "breakdown", text: "Occurs when customers make a complaint about a product or service." },
  { term: "Service recovery", icon: "TERM_RECOVERY", tone: "recovery", text: "A process whereby a business takes action in response to service breakdown or failure." }
];

function renderTerms() {
  setGraphicHtml(app, `
    ${topBarHtml({ showHome: true, showChip: true })}
    <main class="page">
      <div class="block">
        <div class="head-row">
          <h1 class="page-title graphic-heading">${graphicIconHtml("ICON_TERMS")}<span>4 key terms</span></h1>
          ${listenButtonHtml("termsBlock")}
        </div>
        <p class="lead">You'll meet these words in Level 2. Read them once now.</p>
        <section class="terms-block" id="termsBlock" aria-label="4 key terms">
          <ul class="term-list">
            ${KEY_TERMS.map(t => `<li><div class="definition term-definition term-${t.tone}" role="note"><span class="term-graphic" aria-hidden="true">${imgHtml(t.icon)}</span><div class="def-body"><p><strong>${escapeHtml(t.term)}</strong>: ${escapeHtml(t.text)}</p></div></div></li>`).join("")}
          </ul>
        </section>
        <div class="btn-row"><a href="#home" class="btn" id="termsDone" onclick="event.preventDefault();backToRoute()">Got it, back to my route</a></div>
      </div>
    </main>
    ${footerHtml()}
  `);
  wireListen(app);
}

/* ---------------- Levels: shared engine ----------------
   Each level has one or more step tabs; each tab has parts. "Continue ↓" reveals
   the next part below on the same page; "Next →" moves to the next tab. Tabs
   unlock in order once the tab before has been read to the end.

   Progress kept in the record (all merge safely across devices):
     reached["s<n>.tabs"]    highest tab index unlocked (0 = first tab only)
     reached["s<n>.t<i>"]    how many parts of tab i have been shown
     ui["s<n>.tab"]          the tab the student is on
     submitted["s<n>..."]    when a question group was submitted
     done[n]                 when the level was finished */

const ANSWER_MAX = 1500; // characters per answer box (keeps a record well under the Sheet's cell limit)

function lvl(n) { return LEVELS[n - 1]; }
function tabsUnlocked(n) { return Number(rec.reached[`s${n}.tabs`]) || 0; }
function partsShown(n, t) { return hasLevelGrant(n) ? LEVEL_CONTENT[n].tabs[t].parts.length : Math.max(1, Number(rec.reached[`s${n}.t${t}`]) || 0); }
function isTabUnlocked(n, t) { return t === 0 || isDone(n) || tabsUnlocked(n) >= t || hasLevelGrant(n) || unlockAllOnDevice(); }

function currentTab(n) {
  const content = LEVEL_CONTENT[n];
  let t = Number(getUi(`s${n}.tab`)) || 0;
  if (t >= content.tabs.length || !isTabUnlocked(n, t)) t = 0;
  return t;
}

// Smooth scrolling and focus for newly revealed content; no motion if the student asked for less.
function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
function revealFocus(el) {
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
}

// Sticky step tabs sit just under the sticky top bar, whatever its height.
function syncStickyOffsets() {
  const bar = document.querySelector(".topbar");
  if (bar) document.documentElement.style.setProperty("--topbar-h", bar.offsetHeight + "px");
}
window.addEventListener("resize", syncStickyOffsets);

function tabBarHtml(n, current) {
  const content = LEVEL_CONTENT[n];
  if (content.tabs.length < 2) return "";
  return `
    <nav class="step-tabs" aria-label="Steps in Level ${n}">
      <ol class="step-tabs-list" style="--tab-count:${content.tabs.length}">
        ${content.tabs.map((t, i) => {
          const open = isTabUnlocked(n, i);
          // Finished: the student has moved on with Next, or finished the level.
          const finished = isDone(n) || tabsUnlocked(n) > i;
          const cls = (i === current ? "current" : open ? "" : "locked") + (finished ? " finished" : "");
          return `<li><button type="button" class="step-tab ${cls}" data-tab="${i}"
            ${i === current ? `aria-current="step"` : ""} ${open ? "" : `aria-disabled="true"`}>
            <span class="step-num" aria-hidden="true">${finished ? "✓" : open ? i + 1 : "🔒"}</span>
            <span class="step-label">${escapeHtml(t.label)}${open ? "" : `<span class="visually-hidden"> (locked)</span>`}${finished ? `<span class="visually-hidden"> (finished)</span>` : ""}</span>
          </button></li>`;
        }).join("")}
      </ol>
    </nav>`;
}

// Draws the level page: arriving at a level, switching tab, or after Next or Submit.
function renderLevel(n) {
  if(n === 2){renderLessonCard();return;}
  setUi("route.level",n);
  pathShownNow = 0; // arriving at a level: the path works out again how much to show
  const s = lvl(n);
  const content = LEVEL_CONTENT[n];
  const t = currentTab(n);
  const tab = content.tabs[t];
  setGraphicHtml(app, `
    ${topBarHtml({ showHome: true, showChip: true })}
    <div class="level-head"><div class="level-head-inner">
      <h1 class="page-title ${s.iconImg ? "graphic-heading" : ""}">${levelIconHtml(s)} <span>Level ${n}: ${escapeHtml(s.title)}</span></h1>
      <p class="level-sub">${escapeHtml(s.desc)}</p>
    </div></div>
    ${tabBarHtml(n, t)}
    <main class="page level-page" id="levelMain"></main>
    ${footerHtml()}
  `);
  syncStickyOffsets();
  // Opening a level counts as starting it ("In progress" on the home page), but not
  // while the Before you start pop-up is still waiting for "I'm ready".
  if (rec.agreed && !isStarted(n)) { raiseReached(`s${n}.t${t}`, 1); queueSave("soon"); }
  app.querySelectorAll(".step-tab").forEach(b => b.addEventListener("click", () => {
    const i = Number(b.getAttribute("data-tab"));
    if (!isTabUnlocked(n, i) || i === t) return;
    if(n === 2 && i > t && !requireReflections(i > 1 ? ["s2.video", ...visibleReflectionKeys()] : visibleReflectionKeys()))return; // locked tabs cannot be opened
    setUi(`s${n}.tab`, i);
    queueSave("soon");
    renderLevel(n);
    window.scrollTo(0, 0);
  }));
  drawTab(n, t, tab, { fresh: true });
}

// Draws every part of the tab shown so far, then the button that comes next.
function drawTab(n, t, tab, o) {
  const main = document.getElementById("levelMain");
  const shown = Math.min(partsShown(n, t), tab.parts.length);
  const ctx = { n, t, readOnly: isDone(n), fresh: !!o.fresh };
  setGraphicHtml(main, tab.parts.slice(0, shown).map((part, i) =>
    `<section class="block part" id="part${i}" aria-labelledby="part${i}Title">${part.html(ctx)}</section>`).join(""));
  tab.parts.slice(0, shown).forEach((part, i) => {
    const sec = document.getElementById(`part${i}`);
    const title = sec.querySelector(":scope > h2, :scope > .head-row > h2, :scope > .head-row > p, :scope > p, :scope > h3");
    if (title) title.id = `part${i}Title`;
    if (part.wire) part.wire(sec, ctx);
    wireReflections(sec);
  });

  const last = shown === tab.parts.length;
  const part = tab.parts[shown - 1];
  const gateOpen = !part.continueWhen || part.continueWhen(ctx);
  let nav = "";
  if (!last && gateOpen) nav = `<button type="button" class="btn" id="continueBtn">Continue ↓</button>`;
  else if (last && tab.next) {
    // nextState: "show", "disabled" (greyed until a tick box is ticked) or "hidden"
    // (held back until every wrong item has had its Check again).
    const state = tab.nextState ? tab.nextState(ctx) : "show";
    if (state !== "hidden") nav = `<button type="button" class="btn" id="nextBtn" ${state === "disabled" ? `disabled aria-describedby="nextNote"` : ""}>${escapeHtml(tab.next)}</button>`
      + (state === "disabled" && tab.nextDisabledNote ? `<p class="next-note" id="nextNote">${escapeHtml(tab.nextDisabledNote)}</p>` : "");
  }
  if (nav) main.insertAdjacentHTML("beforeend", `<div class="block nav-row">${nav}</div>`);

  const cont = document.getElementById("continueBtn");
  if (cont) cont.addEventListener("click", () => {
    if(n === 2 && !requireReflections([...visibleReflectionKeys(), ...(t > 1 ? ["s2.video"] : [])]))return;
    raiseReached(`s${n}.t${t}`, shown + 1);
    queueSave("soon");
    drawTab(n, t, tab, {});
    revealFocus(document.getElementById(`part${shown}Title`));
  });
  const next = document.getElementById("nextBtn");
  if (next) next.addEventListener("click", () => {
    if(n===5 && t===0 && isBlank("s5.q5")){showNotFinished([{el:main.querySelector('[data-key="s5.q5"]'),name:"Q3"}]);return;}
    if(n === 2 && !requireReflections([...visibleReflectionKeys(), ...(t > 1 ? ["s2.video"] : [])]))return;
    raiseReached(`s${n}.tabs`, t + 1);
    setUi(`s${n}.tab`, t + 1);
    queueSave("soon");
    renderLevel(n);
    window.scrollTo(0, 0);
  });
}

/* ---------- Shared pieces: answer boxes, recap card, finish ---------- */

// A text answer box. Saves on the device as the student types; the server copy follows
// the typing timing. Read-only once its question group is submitted.
function answerBoxHtml(key, { label, hint, readOnly, rows, labelHtml, cls, icon }) {
  const v = getAnswer(key);
  return `
    <div class="field answer-field ${cls || ""}" data-key="${escapeHtml(key)}">
      ${icon ? `<span class="answer-icon" aria-hidden="true">${icon}</span>` : ""}
      <label class="field-label" for="ans_${cssId(key)}">${labelHtml || escapeHtml(label)}</label>
      <textarea id="ans_${cssId(key)}" class="textarea-input" data-answer="${escapeHtml(key)}" rows="${rows || 4}"
        maxlength="${ANSWER_MAX}" placeholder="${escapeHtml(hint || "")}" ${readOnly ? "readonly" : ""}>${escapeHtml(v == null ? "" : v)}</textarea>
    </div>`;
}
function cssId(key) { return String(key).replace(/[^a-zA-Z0-9_-]/g, "_"); }

function wireAnswerBoxes(el) {
  el.querySelectorAll("textarea[data-answer]").forEach(box => {
    if (box.readOnly) return;
    box.addEventListener("input", () => setAnswer(box.getAttribute("data-answer"), box.value, "typing"));
  });
}
const MIN_RESPONSE_CHARS = 20;
function responseLongEnough(key){return String(getAnswer(key) || "").trim().length >= MIN_RESPONSE_CHARS;}
const REFLECTION_KEYS = ["s2.video", "s2.think1", "s2.think2"];
function reflectionSaved(key) {
  return responseLongEnough(key);
}
function reflectionHtml(key, label) {
  return `<div class="card think-card" data-reflection="${key}"><h3 class="think-title">${hIcon("🤔")}Think about it</h3>
    ${answerBoxHtml(key,{label,hint:`Write at least ${MIN_RESPONSE_CHARS} characters...`,readOnly:isDone(2) && reflectionSaved(key)})}
    <p class="field-note" role="status" data-reflection-status>Your progress saves automatically. Next saves your answer.</p></div>`;
}
function requireReflections(keys) {
  const missing=keys.filter(key=>!responseLongEnough(key));
  if(!missing.length){keys.forEach(key=>{if(rec.answers[key])setUi(`${key}.saved`,rec.answers[key].t);});queueSave("now");return true;}
  const short=missing.some(key=>!isBlank(key));
  showModal({id:"reflectionRequired",title:short?"Answer too short":"Complete all questions",bodyHtml:`<p>${short?"Your answer is too short.":"Please complete all questions before moving on."} Write at least ${MIN_RESPONSE_CHARS} characters in each answer.</p>`,buttons:[{label:"Back to questions",primary:true,onClick:()=>{
    const card=lessonCards().findIndex(x=>x.key===missing[0]);if(card>=0 && document.getElementById("lessonCard")){setUi("s2.card",card);renderLessonCard();}
    document.getElementById(`ans_${cssId(missing[0])}`)?.focus();
  }}]});return false;
}
function visibleReflectionKeys(){return Array.from(document.querySelectorAll('[data-reflection]')).map(x=>x.dataset.reflection);}
function wireReflections(el){wireAnswerBoxes(el);}

function isBlank(key) { return !String(getAnswer(key) == null ? "" : getAnswer(key)).trim(); }

// 📌 Remember this (V45's re-teach card). 💡 is kept for tips.
function recapHtml(text) {
  return `<div class="card recap-card" role="note">
    <h3 class="recap-title">📌 Remember this</h3>
    <p>${rich(text)}</p>
  </div>`;
}

function finishButtonHtml(n) {
  return isDone(n) ? "" : `<div class="btn-row"><button type="button" class="btn" id="finishBtn">Finish Level ${n}</button></div>`;
}
function wireFinish(el, n) {
  const b = el.querySelector("#finishBtn");
  if (b) b.addEventListener("click", () => finishLevel(n));
}

function finishLevel(n) {
  if(n === 1 && !L1_BOXES.every(b=>responseLongEnough(b.key))){renderLevel(1);return;}
  if(n === 2 && !requireReflections(REFLECTION_KEYS))return;
  if (!rec.done[n]) rec.done[n] = nowIso();
  queueSave("now");
  showBadgePopup(n);
}

// Badge pop-up (V45 badge modal). Badge 5 has its own pop-up, built with Level 5.
function showBadgePopup(n) {
  const s = lvl(n);
  showModal({
    id: "badgeModal",
    className: "badge-modal",
    title: s.iconImg ? `<span class="graphic-heading">${levelIconHtml(s)}<span>${escapeHtml(s.badge)}</span></span>` : `${(CONFIG.IMAGES[s.badgeImg] || {}).emoji || s.icon} ${escapeHtml(s.badge)}`, // the badge's own emoji (e.g. 🔍 for Badge 3)
    bodyHtml: `<div class="badge-pop-img">${imgHtml(s.badgeImg, "badge-img")}</div>
      <p class="badge-pop-text">You earned the ${escapeHtml(s.badge)} badge!</p>`,
    buttons: [{ label: "Back to my route", primary: true, onClick: () => { backToRoute(n); } }]
  });
}

/* ---------- "Not finished yet" (V45 submit guard) ----------
   missing: [{el, name}]. Each is outlined in red with "✗ Not done yet" and listed by
   name in the pop-up. All required questions offer only "Go back"; empty work cannot bypass validation. */
function showNotFinished(missing) {
  missing.forEach(m => m.el.classList.add("incomplete"));
  const count = missing.length;
  showModal({
    id: "notFinished",
    title: "⚠️ Not finished yet",
    bodyHtml: `
      <p>${count} ${count === 1 ? "item is" : "items are"} not done. ${count === 1 ? "It is" : "They are"} marked in <strong class="red-text">red</strong>.</p>
      <ul class="missing-list">${missing.map(m => `<li>✗ ${escapeHtml(m.name)}</li>`).join("")}</ul>`,
    buttons: [
      { label: "Go back", primary: true, onClick: () => revealFocus(missing[0].el) }
    ]
  });
}
// The red mark goes as soon as the student fills that item in (V45).
document.addEventListener("input", (e) => { const x = e.target.closest && e.target.closest(".incomplete"); if (x) x.classList.remove("incomplete"); });
document.addEventListener("change", (e) => { const x = e.target.closest && e.target.closest(".incomplete"); if (x) x.classList.remove("incomplete"); });

/* ---------------- Visual building blocks ----------------
   Mayer's signalling and multimedia principles for G1 students: icons beside
   headings, textbook definitions in one consistent box, lists turned into icon
   cards. These change how the storyboard wording looks, never what it says. */

function hIcon(icon) { return `<span class="h-icon" aria-hidden="true">${icon}</span> `; }

// A textbook definition, the one to learn: the same 📖 box everywhere.
function definitionHtml(innerHtml, iconId) {
  return `<div class="definition" role="note">${graphicIconHtml(iconId, "definition-graphic")}<div class="def-body">${innerHtml}</div></div>`;
}

// A row of icon cards (stacks on phones). items: [{icon, html}]
function iconCardsHtml(items, cls) {
  return `<ul class="icon-cards ${cls || ""}" style="--cards:${items.length}">${items.map(it =>
    `<li class="icon-card"><span class="ic-icon" aria-hidden="true">${it.icon}</span><div class="ic-body">${it.html}</div></li>`).join("")}</ul>`;
}

// A card with a name on its own line (bold) and its description below.
function namedCardHtml(name, desc) {
  return `<strong class="ic-name">${escapeHtml(name)}</strong> <span class="ic-desc">${escapeHtml(desc)}</span>`;
}

// 💡 always means Tip.
function tipHtml(text) {
  return `<p class="tip"><span class="tip-icon" aria-hidden="true">💡</span> ${escapeHtml(text)}</p>`;
}

// An example line shown as a speech bubble (the quotation marks stay, so the wording is unchanged).
// It always sits on its own line, under the sentence it belongs to.
function sayHtml(quote) { return `<p class="say">${escapeHtml(quote)}</p>`; }

// Two images side by side at the same height (stacked on phones). Each image's share of
// the row is set from its own shape once it loads, so new files of any shape still line up.
function imgPairHtml(ids) {
  return `<div class="img-pair">${ids.map(id => `<div class="img-pair-item">${zoomImgHtml(id, "screenshot-img").replace("<img ", `<img onload="fitPairImage(this)" `)}</div>`).join("")}</div>`;
}
function fitPairImage(img) {
  const item = img.closest(".img-pair-item");
  if (img.naturalWidth && img.naturalHeight && item) item.style.flexGrow = String(img.naturalWidth / img.naturalHeight);
}

/* ---------------- 🔊 Listen: read a block of notes aloud ----------------
   Uses the browser's own speech (no audio files, works offline with the device's
   voices). Shown only where the browser supports it. Notes only, never questions. */

const canSpeak = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance === "function";
let speakingBtn = null;

// The button sits in its heading's row. targetId names the block it reads when that block
// is not the button's own section (the 4 key terms page).
function listenButtonHtml(targetId) {
  return canSpeak ? `<button type="button" class="btn secondary listen-btn" aria-pressed="false" ${targetId ? `data-target="${targetId}"` : ""}>🔊 Read aloud</button>` : "";
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices() || [];
  const want = v => /^en[-_](GB|SG)/i.test(v.lang);
  return voices.find(v => want(v) && v.localService) || voices.find(want) || null;
}

let speechWords=[],speechClock=null;
function clearSpeechWords(){clearInterval(speechClock);speechClock=null;speechWords.forEach(x=>{if(x.el.isConnected)x.el.replaceWith(document.createTextNode(x.el.textContent));});speechWords=[];}
function prepareSpeechWords(block){
  const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('button,textarea,input,select,svg,video,iframe,.video-link,.think-card,.listen-row,[aria-hidden="true"],.nav-row,[data-student-text]'))continue;if(node.textContent.trim())nodes.push(node);}
  const words=[];let index=0;nodes.forEach(node=>{const frag=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(text=>{if(!text)return;if(/^\s+$/.test(text)){frag.append(text);return;}const span=document.createElement('span');span.className='speech-word';span.textContent=text;words.push({el:span,start:index,text});index+=text.length+1;frag.append(span);});node.replaceWith(frag);});speechWords=words;return words.map(x=>x.text).join(' ');
}
function highlightSpeechWord(index){speechWords.forEach((x,i)=>x.el.classList.toggle('reading-now',i===index));}

function stopSpeaking() {
  clearSpeechWords();
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  if (speakingBtn) { setGraphicHtml(speakingBtn, "🔊 Read aloud"); speakingBtn.setAttribute("aria-pressed", "false"); }
  speakingBtn = null;
}

// The words of a block, without buttons, answer boxes, questions or icons.
function blockSpeechText(block) {
  const copy = block.cloneNode(true);
  copy.querySelectorAll("button, textarea, input, select, video, iframe, .video-link, .think-card, .listen-row, [aria-hidden='true'], .nav-row").forEach(x => x.remove());
  copy.querySelectorAll("p, li, h2, h3, h4, th, td, div").forEach(x => x.append(" "));
  copy.querySelectorAll("img").forEach(x => x.remove());
  return copy.textContent.replace(/\s+/g, " ").trim();
}

function wireListen(el) {
  if (!canSpeak) return;
  el.querySelectorAll(".listen-btn").forEach(btn => btn.addEventListener("click", () => {
    if (speakingBtn === btn) { stopSpeaking(); return; }
    stopSpeaking();
    const target = btn.getAttribute("data-target");
    const block = (target && document.getElementById(target)) || btn.closest("section") || el;
    // Short sentences one after another: some browsers stop long speech part-way.
    const speechText=prepareSpeechWords(block);
    const sentences = speechText.match(/[^.!?]+[.!?]*["')]*\s*/g) || [];
    let sentenceOffset=0;
    const voice = pickVoice();
    speakingBtn = btn;
    setGraphicHtml(btn, "⏹ Stop");
    btn.setAttribute("aria-pressed", "true");
    sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.trim());
      u.lang = voice ? voice.lang : "en-GB";
      if (voice) u.voice = voice;
      u.rate = 0.9;
      const start=speechText.indexOf(s.trim(),sentenceOffset);sentenceOffset=start+s.trim().length;
      const firstWord=speechWords.findIndex(x=>x.start>=start),lastWord=speechWords.findLastIndex(x=>x.start<sentenceOffset);
      let word=firstWord,boundarySeen=false;
      u.onstart=()=>{if(speakingBtn!==btn)return;highlightSpeechWord(word);clearInterval(speechClock);speechClock=setInterval(()=>{if(!boundarySeen && word<lastWord)highlightSpeechWord(++word);},400);};
      u.onboundary=e=>{if(speakingBtn!==btn)return;boundarySeen=true;clearInterval(speechClock);const pos=start+e.charIndex;let index=speechWords.findLastIndex(x=>x.start<=pos);if(index>=0)highlightSpeechWord(index);};
      u.onerror=()=>{if(speakingBtn===btn)stopSpeaking();};
      if (i === sentences.length - 1) u.onend = () => { if (speakingBtn === btn) stopSpeaking(); };
      window.speechSynthesis.speak(u);
    });
  }));
}
// Leaving a page stops any reading.
window.addEventListener("hashchange", stopSpeaking);

/* ---------------- Level 1: Your Customer Service Stories ---------------- */

const L1_BOXES = [
  { key: "s1.q1", num: 1, icon: "😊", text: "Think of a time you got GOOD customer service (e.g. at a bubble tea shop, a hawker stall, or when ordering on GrabFood). What did the staff do?", hint: "The staff member..." },
  { key: "s1.q2", num: 2, icon: "😞", text: "Think of a time you got BAD customer service. What happened?", hint: "What happened was..." },
  { key: "s1.q3", num: 3, icon: "🤔", text: "Look at your two stories. What do you think makes customer service good or bad?", hint: "I think customer service is good when... and bad when..." }
];

const L1_PART = {
  html: (ctx) => {
    const submitted = !!rec.submitted.s1 && L1_BOXES.every(b=>responseLongEnough(b.key));
    return `
      <h2 class="visually-hidden">Your stories</h2>
      <p>There are no right or wrong answers.</p>
      ${tipHtml("Tip: don't name real people. Your teacher will read your answers.")}
      <div class="story-cards">
        ${L1_BOXES.map(b => answerBoxHtml(b.key, {
          cls: "story-card", icon: b.icon,
          labelHtml: `<strong>${b.num}.</strong> ${escapeHtml(b.text)}`, hint: b.hint, readOnly: submitted, rows: 6
        })).join("")}
      </div>
      ${submitted ? `
        ${recapHtml("Keep your stories in mind. In Level 2, see whether your ideas match what businesses call quality customer service.")}
        ${finishButtonHtml(1)}` : `
        <p>Type at least one sentence (at least 20 characters) in each box, then tap Submit.</p>
        <div class="btn-row"><button type="button" class="btn" id="submitL1">Submit</button></div>`}`;
  },
  wire: (el) => {
    wireAnswerBoxes(el);
    wireFinish(el, 1);
    const btn = el.querySelector("#submitL1");
    if (!btn) return;
    const submit = () => {
      rec.submitted.s1 = nowIso();
      queueSave("now");
      renderLevel(1);
      revealFocus(document.querySelector(".recap-card"));
    };
    btn.addEventListener("click", () => {
      const missing = L1_BOXES.filter(b => !responseLongEnough(b.key))
        .map(b => ({ el: el.querySelector(`[data-key="${b.key}"]`), name: `Box ${b.num}: write at least ${MIN_RESPONSE_CHARS} characters` }));
      if (missing.length) showNotFinished(missing);
      else submit();
    });
  }
};

/* ---------------- Level 2: Learn: Customer Service ---------------- */

const STAGES = [
  { icon: "👋", name: "Approaching customers", text: "Greet the customer, show you're happy to help." },
  { icon: "📱", name: "Presenting product information", text: "Find out their needs, present a suitable product, explain why it suits their needs, handle questions or objections (when the customer is unsure or disagrees)." },
  { icon: "✅", name: "Closing the customer experience positively", text: "Summarise what the customer decided and any next steps (e.g. warranty, collection date), thank the customer, leave a good final impression." },
  { icon: "🛡️", name: "Provide support services", text: "Help customers after purchase through warranty cover, repairs and support in-store, by phone or online." },
  { icon: "🛠️", name: "Performing service recovery", text: "Respond well when something goes wrong." }
];

// The 8 service recovery steps: textbook wording, with the approved example lines.
const RECOVERY_STEPS = [
  { icon: "👂", label: "Listen", text: "Listen carefully to the complaint. Give customers full attention.", bubble: "(Puts his own phone away and faces the customer.)", face: "😠", mood: "angry" },
  { icon: "⏳", label: "Be patient", text: "Be patient. Do not interrupt customers when they are describing their unhappiness.", bubble: "(Nods and lets her finish.)", face: "😠", mood: "angry" },
  { icon: "🙏", label: "Apologise", text: "Apologise to the customers for the inconvenience caused.", bubble: "\"I'm really sorry for the trouble this has caused you.\"", face: "😣", mood: "upset" },
  { icon: "💙", label: "Acknowledge", text: "Acknowledge their feelings and assure them of help to solve the problem.", bubble: "\"I understand why you're upset. I'll help you sort this out.\"", face: "😐", mood: "calmer" },
  { icon: "❓", label: "Ask questions", text: "Ask questions if more information is needed.", bubble: "\"When did you buy it, and when did you first notice the crack?\"", face: "😐", mood: "calmer" },
  { icon: "🛠️", label: "Offer solutions", text: "Offer solutions.", bubble: "\"Since it's still under warranty, I can give you a replacement phone today.\"", face: "🙂", mood: "reassured" },
  { icon: "🧑‍💼", label: "Refer", text: "Refer customers to more senior staff if unable to provide them with an acceptable solution.", bubble: "\"If you'd prefer something else, my manager can look at other options for you.\"", face: "🙂", mood: "reassured" },
  { icon: "😊", label: "Thank", text: "Thank customers for bringing the problem to our attention.", bubble: "\"Thank you for letting us know about this.\"", face: "😄", mood: "happy" }
];

// How many path stops are on screen. The path starts with Step 1 only; a student
// coming back to the tab later sees all 8 at once.
let pathShownNow = 0;
function pathShown() { return Number(rec.reached["s2.path"]) || 0; }

function recoveryStopHtml(step, i, animate) {
  const actionLine = /^\(/.test(step.bubble);
  return `
    <li class="path-stop ${animate ? "slide-in" : ""}" id="pathStop${i + 1}">
      <div class="path-circle" aria-hidden="true"><span class="path-icon">${step.icon}</span><span class="path-num">${i + 1}</span></div>
      <div class="path-card">
        <h4 class="path-label" id="pathLabel${i + 1}"><span class="visually-hidden">Step ${i + 1}: </span>${escapeHtml(step.label)}</h4>
        <p class="path-text">${escapeHtml(step.text)}</p>
        <p class="path-bubble ${actionLine ? "action" : ""}"><span class="visually-hidden">The staff member: </span>${escapeHtml(step.bubble)}</p>
        <p class="path-face"><span aria-hidden="true">${moodFaceHtml(i)}</span><span class="visually-hidden">Customer feels ${step.mood}</span></p>
      </div>
    </li>`;
}

function recoveryPathHtml(count, animateLast) {
  return `
    <div class="recovery-path-wrap">
      <ol class="recovery-path" aria-label="The Service Recovery Path">
        ${RECOVERY_STEPS.slice(0, count).map((s, i) => recoveryStopHtml(s, i, animateLast && i === count - 1)).join("")}
      </ol>
      ${count < 8 ? `<div class="btn-row path-more"><button type="button" class="btn secondary" id="showStepBtn">Show Step ${count + 1} ↓</button></div>` : ""}
    </div>`;
}

// Part wrappers for notes: the 🔊 Listen button sits at the top of each block of notes.
// The Listen button goes in the row of the block's first heading: heading left, button right.
function notesPart(htmlFn, extra) {
  return Object.assign({
    html: (ctx) => htmlFn(ctx).replace(/<h2 [\s\S]*?<\/h2>|<p>[\s\S]*?<\/p>/, h => `<div class="head-row">${h}${listenButtonHtml()}</div>`),
    wire: (el, ctx) => { wireListen(el); if (extra && extra.wireMore) extra.wireMore(el, ctx); }
  }, extra || {});
}

// Optional illustrated examples do not change answers, progress or level locks.
const PRODUCT_KNOWLEDGE_EXAMPLES = [
  { id: "features", icon: "📋", image: "PK_FEATURES", title: "Product features and specifications (e.g. screen size, battery life)",
    dialogue: "This phone has a large screen for reading. Let me show you its screen size and battery details." },
  { id: "price", icon: "💲", image: "PK_PRICE", title: "Price and available options",
    dialogue: "This model comes in blue or black. Let me check the price for the storage option you want." },
  { id: "care", icon: "🧴", image: "PK_CARE", title: "How to use or care for the product",
    dialogue: "You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition." },
  { id: "warranty", icon: "🛡️", image: "PK_WARRANTY", title: "Warranty and after-sales support",
    dialogue: "Please keep your receipt as proof of purchase for warranty and exchanges. Let me explain what the warranty covers and how to get help after you purchase." },
  { id: "selling-point", icon: "⭐", image: "PK_SELLING_POINT", title: "Unique selling points of the product (why your product is better than competitors' products)",
    dialogue: "Compared with this other model, this phone has a longer battery life. It may suit you if you use your phone often." }
];

function productKnowledgeCardsHtml() {
  return `<ul class="icon-cards chips product-knowledge-cards">${PRODUCT_KNOWLEDGE_EXAMPLES.map(example => `
    <li><button type="button" class="icon-card product-knowledge-card" data-product-example="${example.id}" aria-haspopup="dialog">
      <span class="ic-icon" aria-hidden="true">${example.icon}</span>
      <span class="ic-body">${escapeHtml(example.title)}<span class="product-example-link">View example</span></span>
    </button></li>`).join("")}</ul>`;
}

function showProductKnowledgeExample(id, trigger) {
  const example = PRODUCT_KNOWLEDGE_EXAMPLES.find(item => item.id === id);
  if (!example) return;
  const restoreFocus = () => { if (trigger && trigger.isConnected) trigger.focus(); };
  const wrap = showModal({
    id: "productExampleModal",
    className: "product-example-modal",
    title: escapeHtml(example.title),
    bodyHtml: `<figure class="product-example-figure">
      ${imgHtml(example.image, "product-example-image")}
      <figcaption class="visually-hidden">The staff member says: ${escapeHtml(example.dialogue)} AI-generated illustration of a fictional example.</figcaption>
      </figure>`,
    buttons: [{ label: "Close", primary: true, onClick: restoreFocus }]
  });
  if (wrap) wrap.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); wrap.remove(); restoreFocus(); }
  });
}

document.addEventListener("click", e => {
  const trigger = e.target.closest("[data-product-example]");
  if (trigger) showProductKnowledgeExample(trigger.dataset.productExample, trigger);
});

const L2_TABS = [
  {
    label: "Quality Customer Service",
    next: "Next: The Five Stages →",
    parts: [
      notesPart(() => `
        <h2 class="section-title">${hIcon("🤝")}What is customer service?</h2>
        ${definitionHtml(`<p><strong>Customer service</strong> refers to what businesses do for their customers so that they are happy and satisfied.</p>`, "TERM_SERVICE")}
        <p>It takes place the moment a customer enters a shop, a restaurant or an attraction, and continues even after the customer has made a purchase and left the venue.</p>
        <h2 class="section-title">${hIcon("⭐")}What is quality customer service?</h2>
        ${definitionHtml(`<p><strong>Quality customer service</strong> means doing more for customers to exceed their expectations.</p>`, "TERM_QUALITY")}
`),
      notesPart((ctx) => `
        <h2 class="section-title">${hIcon("❓")}Why does quality customer service matter?</h2>
        <p>If a business provides quality customer service:</p>
        ${iconCardsHtml([
          { icon: "🔁", html: "Customers will have a positive experience and they will choose to <strong>return repeatedly</strong>;" },
          { icon: "🗣️", html: "Customers will <strong>recommend</strong> the business to their relatives and friends; and" },
          { icon: "🤝", html: "<strong>Customer loyalty</strong> is created, ensuring the <strong>continuity of the business</strong>." }
        ], "cols-3")}
        ${zoomImgHtml("C01", "comic-img")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("🧑‍💼")}Skills and qualities of a good customer service employee</h2>
        <p>Some skills and qualities customer service employees need:</p>
        ${iconCardsHtml([
          { icon: "😊", html: namedCardHtml("Approachable", "Friendly and easy to talk to, so customers feel comfortable asking for help") },
          { icon: "🎯", html: namedCardHtml("Customer-focused", "Paying attention to what each customer needs and putting those needs first") },
          { icon: "💬", html: namedCardHtml("Clear communication skills", "Explaining things simply") },
          { icon: "🧠", html: namedCardHtml("Knowledgeable", "Knowing the products well, so you can answer questions accurately") },
          { icon: "🛠️", html: namedCardHtml("Problem-solving skills", "Providing solutions, not just apologising") },
          { icon: "👋", html: namedCardHtml("Able to close the customer experience positively", "Ending on a good note, e.g. thanking the customer and inviting them back") }
        ], "cols-3 grid-6")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("📱")}Good product knowledge</h2>
        <p>Staff need good product knowledge to answer questions accurately, not guess. This includes:</p>
        <p class="product-example-instruction">Tap a card to see the Nexora staff member explain it.</p>
        ${productKnowledgeCardsHtml()}
        ${zoomImgHtml("N02", "notes-img")}`)
    ]
  },
  {
    label: "The Five Stages",
    next: "Next: Breakdown and Recovery →",
    parts: [
      notesPart(() => `
        <h2 class="section-title">${hIcon("🗺️")}The five stages of providing customer service</h2>
        <table class="stage-table">
          <thead class="visually-hidden"><tr><th scope="col">Stage</th><th scope="col">What to do</th></tr></thead>
          <tbody>
            ${STAGES.map((s, i) => `<tr class="stage-row stage-${i + 1}"><th scope="row"><span class="stage-head"><span class="stage-icon" aria-hidden="true">${s.icon}</span><span>${i + 1}. ${escapeHtml(s.name)}</span></span></th><td>${escapeHtml(s.text)}</td></tr>`).join("")}
          </tbody>
        </table>
        ${zoomImgHtml("C02", "comic-img")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("👋")}Approaching customers: 3 approaches</h2>
        <p class="when-box"><span class="when-icon" aria-hidden="true">⏰</span> <span><strong>When to approach:</strong> as soon as a customer enters the store. If you are busy serving someone else, still acknowledge the new customer by making eye contact, smiling and greeting them politely.</span></p>
        <ul class="approach-cards">
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">👋</span>
            <h3 class="approach-name">1. Greeting Approach</h3>
            <p>Greet the customer in a friendly way as they enter, e.g.</p>
            ${sayHtml("\"Good morning!\"")}
            <p>For a regular customer, use their name:</p>
            ${sayHtml("\"Good morning, Mr Tan!\"")}
          </li>
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">🙋</span>
            <h3 class="approach-name">2. Service Approach</h3>
            <p>Ask a polite question to show you're ready to help, e.g.</p>
            ${sayHtml("\"How may I assist you?\"")}
            <p>If a customer comes up to you to ask for something or to pay, serve them as quickly as possible.</p>
            <p class="approach-combine">You can also combine the greeting and service approaches:</p>
            ${sayHtml("\"Good morning! How may I assist you?\"")}
          </li>
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">📱</span>
            <h3 class="approach-name">3. Product Approach</h3>
            <p>When a customer is looking closely at a product, ask a question about it to help them go from just being interested to actually buying it, e.g.</p>
            ${sayHtml("\"This phone has a great camera. Would you like to try it out?\"")}
          </li>
        </ul>
`),
      notesPart(() => `
        <p>Whether salespeople use the greeting, service or product approach, the purpose is to:</p>
        ${iconCardsHtml([
          { icon: "😊", html: "Make customers feel comfortable or welcome in the store so that they are likely to buy from the business; and" },
          { icon: "🔁", html: "Ensure customers return to the business again in the future." }
        ], "cols-2")}
        ${zoomImgHtml("C03", "comic-img")}`),
      notesPart(() => `
        ${youtubeVideoHtml("betterWelcome", { heading: "Watch: A better welcome at Nexora", prompt: "Watch this video showing poor and good service. Notice what Alex does differently and how June responds.", frameTitle: "Video: A better welcome at Nexora" })}
        ${reflectionHtml("s2.video", "What did Alex do to make June feel welcome? Why did she bring her friend back?")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("🎯")}Presenting product information: suitability</h2>
        ${zoomImgHtml("SUITABILITY", "notes-img suitability-img")}
        <p>Don't just list every good feature. Point out the features that match what this customer needs. For example, a customer who takes lots of photos should hear information about the phone's camera, not how good the phone looks.</p>`)
    ]
  },
  {
    label: "Breakdown and Recovery",
    parts: [
      notesPart(() => `
          <h2 class="section-title">${hIcon("⚠️")}Service breakdown and service recovery</h2>
          ${definitionHtml(`<p><strong>Service breakdown:</strong> A service breakdown occurs when customers make a complaint about a product or service.</p><p class="def-more">Common causes: unfriendly or unhelpful staff, a product that does not meet expectations, or an advertised product that is not available in the store.</p>`, "TERM_BREAKDOWN")}
          ${definitionHtml(`<p><strong>Service recovery:</strong> Service recovery is a process whereby a business takes action in response to service breakdown or failure.</p>`, "TERM_RECOVERY")}`),
      notesPart((ctx) => {
        // First time on the path: Step 1 only. Coming back later: all 8 at once.
        if (ctx.fresh || !pathShownNow) pathShownNow = hasLevelGrant(2) || pathShown() >= 1 ? 8 : 1;
        if (pathShown() < pathShownNow) { raiseReached("s2.path", pathShownNow); saveLocal(); }
        return `
          <p>To perform service recovery, follow these 8 steps:</p>
          <p>Follow Nexora's staff member as he handles a customer whose new phone screen has cracked.</p>
          <h3 class="path-title">${hIcon("🛤️")}The Service Recovery Path</h3>
          <div id="pathHolder">${recoveryPathHtml(pathShownNow, false)}</div>
          <div id="afterPath">${pathShownNow >= 8 ? afterPathHtml() : ""}</div>`;
      }, {
        // Continue ↓ appears only once all 8 stops of the path have been shown.
        continueWhen: () => pathShownNow >= 8,
        wireMore: (el, ctx) => wirePath(el, ctx)
      }),
      notesPart((ctx) => `
        <h2 class="section-title">${hIcon("📉")}Real-life example: poor service recovery</h2>
        <p>A customer complained to a food delivery app that their orders from one restaurant had been cancelled 4 times. The replies? "oh" and "so sad", followed by a $3.30 voucher "to say we're sorry".</p>
        ${imgPairHtml(["R01", "R02"])}
        ${reflectionHtml("s2.think1", "Was this good service recovery? Which of the 8 steps above were missing?")}`),
      notesPart((ctx) => `
        <h2 class="section-title">${hIcon("↩️")}Handling returns of unsatisfactory products</h2>
        <p>If a customer returns a product they are unhappy with, the business can offer:</p>
        ${iconCardsHtml([
          { icon: "🔁", html: namedCardHtml("Replacement", "Replace it with the same product.") },
          { icon: "🔄", html: namedCardHtml("Exchange", "Offer to exchange it with a different product.") },
          { icon: "💵", html: namedCardHtml("Refund", "Give a refund.") }
        ], "cols-3")}
        ${zoomImgHtml("N03", "comic-img")}
`),
      notesPart((ctx) => `
        <p>Many businesses also set clear rules for returns, such as a time limit and needing the receipt. For example, Uniqlo, as shown below.</p>
        ${zoomImgHtml("R03", "uniqlo-img")}
        ${reflectionHtml("s2.think2", "Name ONE item Uniqlo will not accept for return. Why do you think a business would have this rule?")}
        ${recapHtml("The five stages are approaching customers, presenting product information, closing the customer experience positively, providing support services and performing service recovery.")}
        ${finishButtonHtml(2)}`, { wireMore: (el) => { wireFinish(el, 2); } })
    ]
  }
];

L2_TABS[1].parts.push(notesPart(()=>`<h2 class="section-title">${hIcon("🛡️")}Provide support services</h2><p>After a purchase, help customers use their product and get help when they need it.</p>${iconCardsHtml([{icon:"🛡️",html:namedCardHtml("Warranty","Explain what the warranty covers and remind customers to keep their receipt.")},{icon:"🛠️",html:namedCardHtml("Repairs","Explain how to arrange a repair and what happens next.")},{icon:"💬",html:namedCardHtml("Multi-channel support","Offer help in-store, by phone or through online chat.")}],"cols-3")}`));

// A YouTube video: heading, one-line instruction, the privacy-enhanced player (never
// starts by itself) in a 16:9 box, and a link for networks that block embedded YouTube.
function youtubeVideoHtml(key, { heading, prompt, frameTitle }) {
  const id = encodeURIComponent(CONFIG.VIDEOS[key].youtubeId);
  return `<h3 class="video-title" id="video_${key}_title">${escapeHtml(heading)}</h3>
    <p class="video-prompt" id="video_${key}_prompt">${escapeHtml(prompt)}</p>
    <div class="video-frame" data-video="${key}"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${escapeHtml(frameTitle)}" aria-describedby="video_${key}_prompt" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <p class="video-link"><a href="https://youtu.be/${id}" target="_blank" rel="noopener">Video not loading? Watch it on YouTube</a></p>`;
}

function afterPathHtml() {
  return `<div class="lesson-video">${youtubeVideoHtml("serviceRecovery", { heading: "Watch: The 8 steps in action", prompt: "Watch Alex use all 8 steps to help June with her cracked phone.", frameTitle: "Video: Alex uses the 8 steps of service recovery to help June with her cracked phone" })}</div>
    <p class="after-path">Handled well, a service breakdown can improve customer loyalty. If it is handled badly, you can lose the customer to your competitors.</p>
    ${zoomImgHtml("C04", "comic-img")}`;
}

function wirePath(el, ctx) {
  const btn = el.querySelector("#showStepBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    pathShownNow = Math.min(8, pathShownNow + 1);
    raiseReached("s2.path", pathShownNow);
    queueSave("soon");
    if (pathShownNow < 8) {
      setGraphicHtml(el.querySelector("#pathHolder"), recoveryPathHtml(pathShownNow, true));
      wirePath(el, ctx);
      revealFocus(document.getElementById(`pathLabel${pathShownNow}`));
      return;
    }
    // All 8 shown: the button goes, the rest of the part and Continue ↓ appear.
    drawTab(2, 2, L2_TABS[2], {});
    const stop = document.getElementById("pathStop8");
    if (stop && !reducedMotion()) stop.classList.add("slide-in");
    revealFocus(document.getElementById("pathLabel8"));
  });
}

/* ---------------- Marked questions: hint, one retry, then the answer ----------------
   Level 3 Q2 and Level 5 Q1 and Q2. Submit records the first attempt (never
   overwritten). Each wrong item shows its own hint and can be changed once, then
   "Check again" records the second attempt. Still wrong: the right answer with its
   reason. Feedback sits directly under its item, with ✓ or ✗ (never colour alone).

   An item: {id, answerKey, attemptKey, type: "select" | "tf" | "mcq", options,
   correct, right (the "Correct: ..." message), hint (one hint) or hints (by answer),
   answerLabel (the right answer's name for "The answer is ...")} */

function itemState(item) {
  const first = rec.first[item.attemptKey];
  if (!first) return "open";
  const second = rec.second[item.attemptKey];
  if(item.answerKey.startsWith("s5.") && second)return second.ok?"right":"revealed";
  if (first.ok) return "right";
  if (!second) return "retry";
  return second.ok ? "right" : "revealed";
}
function itemsResolved(items) { return items.every(it => ["right", "revealed"].includes(itemState(it))); }
function itemsSubmitted(items) { return items.every(it => !!rec.first[it.attemptKey]); }
function isCorrect(item, value) { return value === item.correct; }

function itemFeedbackHtml(item) {
  const state = itemState(item);
  if (state === "open") return "";
  if (state === "right") return `<p class="feedback right" role="status">✓ ${escapeHtml(item.right)}</p>`;
  if (state === "retry") {
    const a = rec.first[item.attemptKey].a;
    const hint = item.hints ? item.hints[a] : item.hint;
    if (getAnswer(item.answerKey) !== a) {
      return `<p class="check-prompt" role="status"><span aria-hidden="true">👆</span> Tap Check again to see if you're right.</p>
        <p class="feedback wrong faded"><span class="visually-hidden">Earlier hint: </span>✗ ${escapeHtml(hint)}</p>`;
    }
    return `<p class="feedback wrong" role="status">✗ ${escapeHtml(hint)}</p>`;
  }
  // Still wrong after Check again: the right answer, with the same reason as the correct message.
  const reason = item.right.replace(/^Correct: /, "");
  return `<p class="feedback wrong" role="status">✗ The answer is ${escapeHtml(item.answerLabel)}: ${escapeHtml(reason)}</p>`;
}

function itemEditable(item) {
  if(item.answerKey.startsWith("s5.") && !rec.second[item.attemptKey] && !isDone(5) && L5_MARKED.some(it=>itemState(it)==="retry"))return true;
  if (isDone(Number(item.answerKey.charAt(1)))) return false;
  const st = itemState(item);
  return st === "open" || st === "retry";
}

// The answer control for an item. Nothing is pre-selected: only the student's own answer shows.
const CORRECT_TAG = `<span class="answer-tag right-tag">✓ Correct answer</span>`;
const WRONG_MARK = `<span class="answer-tag wrong-tag" aria-hidden="true">✗</span><span class="visually-hidden"> (your answer, not correct)</span>`;

function itemControlHtml(item) {
  const v = getAnswer(item.answerKey);
  const off = !itemEditable(item);
  const revealed = itemState(item) === "revealed";
  // When the answer is revealed: is this option the right one, or the student's wrong pick?
  const marks = (val) => {
    if (!revealed) return { cls: "", tag: "" };
    if (val === item.correct) return { cls: "correct-answer", tag: CORRECT_TAG };
    if (val === v) return { cls: "wrong-pick", tag: WRONG_MARK };
    return { cls: "", tag: "" };
  };
  if (item.type === "select") {
    // Locked: the answer as a read-only box that wraps, so a long stage name is never cut off
    // on a phone (a disabled dropdown cannot be opened to read it).
    if (off && v !== undefined) {
      const box = `<div class="select-input locked-answer ${revealed ? "wrong-pick" : ""}" id="sel_${item.id}" data-item="${item.id}" aria-disabled="true"><span class="visually-hidden">Your answer: </span>${escapeHtml(item.options[v])}</div>`;
      if (!revealed) return box;
      return `<div class="select-row">${WRONG_MARK}${box}<span class="answer-tag right-tag">✓ Correct answer: ${escapeHtml(item.answerLabel)}</span></div>`;
    }
    const select = `<select style="border-left:6px solid ${v===undefined?"#9ca3af":STAGE_COLOURS[v===3?4:v===4?3:v]}" class="select-input item-select ${revealed ? "wrong-pick" : ""}" data-item="${item.id}" ${off ? "disabled" : ""}>
      <option value="" disabled ${v === undefined ? "selected" : ""}>Choose a stage…</option>
      ${[0,1,2,4,3].map(i => `<option value="${i}" style="color:${STAGE_COLOURS[i===3?4:i===4?3:i]}" ${v === i ? "selected" : ""}>${escapeHtml(item.options[i])}</option>`).join("")}
    </select>`;
    if (!revealed) return select;
    return `<div class="select-row">${WRONG_MARK}${select}<span class="answer-tag right-tag">✓ Correct answer: ${escapeHtml(item.answerLabel)}</span></div>`;
  }
  if (item.type === "tf") {
    return `<div class="tf-pair" role="group" aria-label="True or False">
      ${[["True", true], ["False", false]].map(([label, val]) => { const m = marks(val); return `<div class="tf-cell"><button type="button" class="choice-btn tf-btn ${v === val ? "picked" : ""} ${m.cls}" data-item="${item.id}" data-value="${val}" aria-pressed="${v === val}" ${off ? "disabled" : ""}>${label}${m.cls === "wrong-pick" ? m.tag : ""}</button>${m.cls === "correct-answer" ? m.tag : ""}</div>`; }).join("")}
    </div>`;
  }
  return `<div class="mcq-options" role="group" aria-label="Choose one answer">
    ${item.options.map(o => { const m = marks(o.letter); return `<button type="button" class="choice-btn mcq-btn ${v === o.letter ? "picked" : ""} ${m.cls}" data-item="${item.id}" data-value="${o.letter}" aria-label="${escapeHtml(`${o.letter}. ${o.text}${m.cls === "correct-answer" ? " Correct answer." : m.cls === "wrong-pick" ? " Your answer, not correct." : ""}`)}" aria-pressed="${v === o.letter}" ${off ? "disabled" : ""}>
      <span class="mcq-letter" aria-hidden="true">${o.letter}</span><span class="mcq-text">${escapeHtml(o.text)}${m.tag ? `<span class="mcq-tag">${m.tag}</span>` : ""}</span></button>`; }).join("")}
  </div>`;
}

// Wires every answer control in el. After a change the tab is redrawn in place.
function wireItems(el, items, redraw) {
  const byId = {};
  items.forEach(it => { byId[it.id] = it; });
  el.querySelectorAll("select.item-select").forEach(sel => sel.addEventListener("change", () => {
    const it = byId[sel.getAttribute("data-item")];
    setAnswer(it.answerKey, Number(sel.value), "soon");
    redraw(sel);
  }));
  el.querySelectorAll(".choice-btn").forEach(btn => btn.addEventListener("click", () => {
    const it = byId[btn.getAttribute("data-item")];
    const raw = btn.getAttribute("data-value");
    setAnswer(it.answerKey, it.type === "tf" ? raw === "true" : raw, "soon");
    redraw(btn);
  }));
}

// Redraws the current tab, keeping the page where it was and focus on the same control.
function redrawInPlace(n, t, focusSelector) {
  const y = window.scrollY;
  drawTab(n, t, LEVEL_CONTENT[n].tabs[t], {});
  window.scrollTo(0, y);
  if (focusSelector) { const f = document.querySelector(focusSelector); if (f) f.focus({ preventScroll: true }); }
}

function recordAttempts(items, which) {
  const now = nowIso();
  items.forEach(it => {
    const v = getAnswer(it.answerKey);
    const rec1 = { a: v === undefined ? null : v, ok: isCorrect(it, v), t: now };
    if (which === "first" && !rec.first[it.attemptKey]) rec.first[it.attemptKey] = rec1;
    if (which === "second" && (itemState(it) === "retry" || (it.answerKey.startsWith("s5.") && rec.first[it.attemptKey])) && !rec.second[it.attemptKey]) rec.second[it.attemptKey] = rec1;
  });
}

// One Check again per tab, at the bottom: it checks every item still waiting.
function checkAgainHtml(items) {
  return items.some(it => itemState(it) === "retry")
    ? `<div class="btn-row check-row"><button type="button" class="btn" id="checkAgainBtn">Check again</button></div>` : "";
}

// 5. After the marked items are settled (V45's missedHtml): all right first time, or the
// approved "Look at these again" lines for items wrong on the first try (no repeats).
function summaryCardHtml(items) {
  const lines = [];
  items.forEach(it => { const f = rec.first[it.attemptKey]; if (f && !f.ok && !lines.includes(it.lookAgain)) lines.push(it.lookAgain); });
  if (!lines.length) {
    return `<div class="card missed-card all-good" role="status"><h3 class="missed-title">🎉 Great work!</h3><p>You got everything right on the first try.</p></div>`;
  }
  return `<div class="card missed-card" role="status"><h3 class="missed-title">💪 Let's learn from these</h3>
    <p class="missed-intro">Good effort! Here ${lines.length === 1 ? "is one thing" : `are ${lines.length} things`} to look at again:</p>
    <ul class="missed-list">${lines.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`;
}

// A self-check note after Submit for open-text questions (not marked).
function checkNoteHtml(text) {
  return `<p class="check-note" role="note"><span class="check-icon" aria-hidden="true">🔎</span> <span>${escapeHtml(text)}</span></p>`;
}

// A chatbot tab (Levels 3 and 4): picture beside the intro, a tick box that unlocks Next.
function tickHtml(key, label, readOnly) {
  const v = getAnswer(key) === true;
  return `<label class="tick-row"><input type="checkbox" class="tick-input" data-answer="${key}" ${v ? "checked" : ""} ${readOnly ? "disabled" : ""}> <span>${escapeHtml(label)}</span></label>`;
}
function wireTick(el,n,t,key){
  const box=el.querySelector(`input.tick-input[data-answer="${key}"]`);if(!box)return;
  box.addEventListener("change",()=>{
    setAnswer(key,box.checked,box.checked?"now":"soon");
    redrawInPlace(n,t,`input.tick-input[data-answer="${key}"]`);
  });
}

function gemButtonHtml(url, label) {
  return `<div class="btn-row"><a class="btn gem-btn" href="${escapeHtml(url || "#")}" target="_blank" rel="noopener">${escapeHtml(label)}</a></div>`;
}

/* ---------------- Level 3: Chat with Alex ---------------- */

// Preserve historical answer values: recovery remains 3; support is 4.
const STAGE_NAMES = [STAGES[0].name,STAGES[1].name,STAGES[2].name,STAGES[4].name,STAGES[3].name];

// "Look at these again" (agreed wording): the topic and where to find it, for each marked item.
// Used by the summary card after feedback and by the learning report.
const LOOK_AGAIN = {
  "s3q2.P": "Performing service recovery (Level 2, Breakdown and Recovery)",
  "s3q2.Q": "Presenting product information (Level 2, The Five Stages)",
  "s3q2.R": "Closing the customer experience positively (Level 2, The Five Stages)",
  "s3q2.S": "Approaching customers (Level 2, The Five Stages)",
  "s5q3.i": "What customer service is (Level 2, Quality Customer Service)",
  "s5q3.ii": "Good product knowledge (Level 2, Quality Customer Service)",
  "s5q3.iii": "The 8 steps of service recovery (Level 2, Breakdown and Recovery)",
  "s5q3.iv": "Service breakdown (Level 2, Breakdown and Recovery)",
  "s5q4": "The 8 steps of service recovery (Level 2, Breakdown and Recovery)"
};

const L3_Q2 = [
  { id: "P", quote: "\"Could you tell me when the screen first stopped working? Then we can arrange a repair or replacement for you.\"", correct: 3,
    hint: "This officer asks when the screen stopped working and offers a repair. Has something gone wrong for this customer?",
    right: "Correct: asking questions (Step 5) and offering a solution (Step 6) are part of service recovery." },
  { id: "Q", quote: "\"Since you play a lot of games, the Nexora Prime's fast processor would suit you best.\"", correct: 1,
    hint: "The officer matches a phone feature to something the customer does a lot. Which stage is about presenting a suitable product?",
    right: "Correct: matching a feature to the customer's needs is presenting product information." },
  { id: "R", quote: "\"Your purchase is confirmed: the Nexora Core with the 256GB upgrade and the one-year warranty. You can collect it on Friday. Thank you for shopping at Nexora. Have a great day!\"", correct: 2,
    hint: "The officer sums up what the customer chose and when to collect it. Is this the start or the end of the interaction?",
    right: "Correct: summing up the decision and the next steps closes the customer experience positively." },
  { id: "S", quote: "\"Good afternoon! Is there anything I can help you find today?\"", correct: 0,
    hint: "This is the first thing the officer says to the customer. Which stage starts the conversation?",
    right: "Correct: a greeting with an offer of help is approaching customers." }
].map(it => Object.assign(it, {
  type: "select", options: STAGE_NAMES, answerKey: `s3.q2.${it.id}`, attemptKey: `s3q2.${it.id}`, answerLabel: STAGE_NAMES[it.correct],
  lookAgain: LOOK_AGAIN[`s3q2.${it.id}`]
}));

const L3_TABS = [
  {
    label: "Chat",
    next: "Next: Think back →",
    nextDisabledNote: "Tick the box above when you've finished.",
    nextState: () => ((getAnswer("s3.tick") === true && conversationReady(3)) || isDone(3) ? "show" : "disabled"),
    parts: [{
      html: (ctx) => `
        <h2 class="visually-hidden">Chat with Alex</h2>
        <div class="intro-with-pic">
          <div class="intro-pic">${imgHtml("N04", "avatar-img")}</div>
          <p>Meet Alex, a customer service officer at Nexora Mobile. You are the customer. During your chat, try to:</p>
        </div>
        ${iconCardsHtml([
          { icon: "📱", html: "Ask about at least one product, and its price" },
          { icon: "🤔", html: "Ask a follow-up question or disagree with something (for example, say the price is too high)" },
          { icon: "🛠️", html: "Report a problem with a product, and see how Alex responds" }
        ], "cols-3")}
        <details class="tip-details">
          <summary><span class="tip-icon" aria-hidden="true">💡</span> Not sure what to ask? Try these:</summary>
          <div class="tip-examples">
            ${sayHtml("\"How much does the Nexora Core cost?\"")}
            ${sayHtml("\"Why is the Nexora Prime so expensive?\"")}
            ${sayHtml("\"My phone's screen stopped working. What can I do?\"")}
          </div>
        </details>
        <p>Watch how Alex starts the chat, presents information, and responds when something has gone wrong.</p>
        ${gemButtonHtml(CONFIG.GEMS && CONFIG.GEMS.alex, "💬 Open chat with Alex (new tab) ↗")}
        ${conversationLinkHtml(3,ctx.readOnly)}${tickHtml("s3.tick", "I have finished chatting with Alex.", ctx.readOnly)}`,
      wire: (el, ctx) => {wireConversationLink(el,3);wireTick(el, 3, 0, "s3.tick");}
    }]
  },
  {
    label: "Think back",
    parts: [{
      html: (ctx) => {
        const submitted = itemsSubmitted(L3_Q2);
        const ro = submitted || ctx.readOnly;
        const resolved = submitted && itemsResolved(L3_Q2);
        return `
          <h2 class="visually-hidden">Think back</h2>
          <p>Answer these without reopening the chat with Alex.</p>
          <section class="question card" data-q="q1" aria-labelledby="l3q1">
            <h3 class="q-title" id="l3q1"><span class="q-num">Q1.</span> Think back to your conversation with Alex. Identify ONE skill or quality he showed.</h3>
            ${answerBoxHtml("s3.q1a", { label: "Skill or quality:", readOnly: ro, rows: 2 })}
            ${answerBoxHtml("s3.q1b", { label: "This is important to customers because", readOnly: ro, rows: 3 })}
            ${submitted ? checkNoteHtml("Check your reason: does it say how this skill or quality helps the customer? For example, a knowledgeable officer answers questions accurately, so the customer doesn't get wrong information.") : ""}
          </section>
          <section class="question card" data-q="q2" aria-labelledby="l3q2">
            <h3 class="q-title" id="l3q2"><span class="q-num">Q2.</span> Match each line to the stage of providing customer service. Choose a stage for each line.</h3>
            <ol class="match-list">
              ${L3_Q2.map(it => `
                <li class="match-item" data-key="${it.answerKey}">
                  <div class="match-line"><span class="match-letter">${it.id}.</span> ${sayHtml(it.quote)}</div>
                  <label class="visually-hidden" for="sel_${it.id}">Stage for line ${it.id}</label>
                  ${itemControlHtml(it).replace("<select ", `<select id="sel_${it.id}" `)}
                  ${itemFeedbackHtml(it)}
                </li>`).join("")}
            </ol>
          </section>
          ${checkAgainHtml(L3_Q2)}
          ${!submitted ? `<div class="btn-row"><button type="button" class="btn" id="submitL3">Submit</button></div>` : ""}
          ${resolved ? `${summaryCardHtml(L3_Q2)}${recapHtml("The same five stages happen in every customer interaction, whether it's in a shop or in a chat.")}${finishButtonHtml(3)}` : ""}`;
      },
      wire: (el, ctx) => {
        wireAnswerBoxes(el);
        wireItems(el, L3_Q2, (ctl) => redrawInPlace(3, 1, ctl.id ? `#${ctl.id}` : null));
        wireFinish(el, 3);
        const submit = el.querySelector("#submitL3");
        if (submit) submit.addEventListener("click", () => {
          const missing = [];
          if (isBlank("s3.q1a")) missing.push({ el: el.querySelector('[data-key="s3.q1a"]'), name: "Q1 (skill or quality)" });
          if (isBlank("s3.q1b")) missing.push({ el: el.querySelector('[data-key="s3.q1b"]'), name: "Q1 (why it is important)" });
          L3_Q2.forEach(it => { if (getAnswer(it.answerKey) === undefined) missing.push({ el: el.querySelector(`[data-key="${it.answerKey}"]`), name: `Q2 ${it.id}` }); });
          if (missing.length) { showNotFinished(missing); return; }
          recordAttempts(L3_Q2, "first");
          rec.submitted["s3.q"] = nowIso();
          queueSave("now");
          redrawInPlace(3, 1);
          revealFocus(el.ownerDocument.querySelector('[data-q="q1"] .check-note'));
        });
        const again = el.querySelector("#checkAgainBtn");
        if (again) again.addEventListener("click", () => {
          recordAttempts(L3_Q2, "second");
          queueSave("now");
          redrawInPlace(3, 1);
          const fin = document.querySelector(".missed-card");
          if (fin) revealFocus(fin);
        });
      }
    }]
  }
];

/* ---------------- Level 4: Serve Suzzie at Stylez ---------------- */

// Store facts copied from Section 2 of the supplied Stylez roleplay document.
const STYLEZ_INTRO = "Stylez is a casual clothing retailer for teenagers and young adults. It sells affordable everyday clothing in-store and online, including T-shirts, jeans, hoodies, dresses, shorts and accessories.";
const STYLEZ_INFORMATION = [
  {
    "title": "About Stylez",
    "icon": "🏬",
    "facts": [
      [
        "Business",
        "Casual clothing retailer for teenagers and young adults; sells affordable everyday clothing in-store and online."
      ],
      [
        "Products",
        "T-shirts, jeans, hoodies, dresses, shorts and accessories."
      ],
      [
        "Sizes",
        "XS to XL."
      ]
    ]
  },
  {
    "title": "Products and prices",
    "icon": "💲",
    "facts": [
      [
        "Basic T-shirt",
        "$18 each. Available colours: black, white, navy blue and grey."
      ],
      [
        "Jeans",
        "$39 each."
      ],
      [
        "Hoodie",
        "$35 each."
      ]
    ]
  },
  {
    "title": "Promotions",
    "icon": "🎟️",
    "facts": [
      [
        "Promotion 1",
        "Buy 2 Basic T-shirts for $30."
      ],
      [
        "Promotion 2",
        "Stylez members get 10% off regular-priced items."
      ],
      [
        "Promo code",
        "STYLE10 gives 10% off the first online order."
      ],
      [
        "Promotion condition",
        "Promotions cannot be combined."
      ]
    ]
  },
  {
    "title": "Exchanges and defective items",
    "icon": "🔁",
    "facts": [
      [
        "Exchange",
        "Exchange within 14 days with receipt."
      ],
      [
        "Exchange conditions",
        "Item must be unworn, unwashed and have its original tags."
      ],
      [
        "Sale items",
        "No exchange."
      ],
      [
        "Defective items",
        "Customer may bring the item and receipt to the store for assistance."
      ]
    ]
  },
  {
    "title": "Payment, delivery and support",
    "icon": "💬",
    "facts": [
      [
        "Payment",
        "Cash, cards and common mobile payment methods."
      ],
      [
        "Online delivery",
        "Free delivery for orders of $60 or more."
      ],
      [
        "Customer support",
        "Available in-store or through Stylez online chat."
      ]
    ]
  }
];

// The store facts fold out on the Level 4 page, next to the chat button, so students keep one tab.
function stylezFactsHtml() {
  return `<details class="facts-details" id="stylezFacts">
    <summary><span class="facts-icon" aria-hidden="true">🏬</span> Stylez store facts</summary>
    <div class="facts-body">${STYLEZ_INFORMATION.map((group, i) => `
      <section class="stylez-info-group" aria-labelledby="stylezGroup${i}">
        <h3 class="facts-title" id="stylezGroup${i}">${hIcon(group.icon)}${escapeHtml(group.title)}</h3>
        <dl class="stylez-facts">${group.facts.map(([label, value]) => `
          <div class="stylez-fact"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
      </section>`).join("")}
    </div>
  </details>`;
}

const L4_BOXES = [
  { key: "s4.q1", num: 2, icon: "👍", text: "What is one thing you feel you did well when serving Suzzie?", hint: "I did well at..." },
  { key: "s4.q2", num: 3, icon: "🔄", text: "What is one thing you would do differently next time?", hint: "Next time, I would..." }
];

const L4_TABS = [
  {
    label: "Roleplay",
    next: "Next: Reflect →",
    nextDisabledNote: "Tick the box above when you've finished.",
    nextState: () => ((getAnswer("s4.tick") === true && conversationReady(4)) || isDone(4) ? "show" : "disabled"),
    parts: [{
      html: (ctx) => `
        <h2 class="visually-hidden">Roleplay</h2>
        <div class="intro-with-pic">
          <div class="intro-pic">${imgHtml("N05", "avatar-img")}</div>
          <p>Now switch roles. You are a customer service officer at Stylez, a retail store. The AI plays Suzzie, a customer with a question or a problem.</p>
        </div>
        <section class="card stylez-intro" aria-labelledby="aboutStylezTitle">
          <h3 class="section-title" id="aboutStylezTitle">${hIcon("🏬")}About Stylez</h3>
          <p>${escapeHtml(STYLEZ_INTRO)}</p>
        </section>
        <div class="start-box">
          <p><strong>You are the customer service officer. Suzzie is your customer.</strong> In a fresh chat, greet Suzzie to begin. Try:</p>
          ${sayHtml("\"Hi, welcome to Stylez! How may I assist you?\"")}
        </div>
        <p class="stages-box"><span class="when-icon" aria-hidden="true">🗺️</span> <span>Try to use the five stages from Level 2: approach Suzzie, present product information, close positively, provide support services, and if there's a problem, perform service recovery.</span></p>
        ${gemButtonHtml(CONFIG.GEMS && CONFIG.GEMS.suzzie, "🛍️ Open chat with Suzzie (new tab) ↗")}
        ${stylezFactsHtml()}
        ${conversationLinkHtml(4,ctx.readOnly)}${tickHtml("s4.tick", "I have finished serving Suzzie.", ctx.readOnly)}`,
      wire: (el) => {wireConversationLink(el,4);wireTick(el, 4, 0, "s4.tick");}
    }]
  },
  {
    label: "Reflect",
    parts: [{
      html: (ctx) => {
        const submitted = !!rec.submitted.s4;
        return `
          <h2 class="visually-hidden">Reflect</h2>
          <p>Think about your roleplay with Suzzie.</p>${roleplayStagesHtml(submitted || ctx.readOnly)}
          <div class="story-cards cols-2-cards">
            ${L4_BOXES.map(b => answerBoxHtml(b.key, {
              cls: "story-card", icon: b.icon,
              labelHtml: `<strong>${b.num}.</strong> ${escapeHtml(b.text)}`, hint: b.hint, readOnly: submitted || ctx.readOnly, rows: 5
            })).join("")}
          </div>
          ${submitted ? `${recapHtml("Look back at the five stages. Which one would you like to practise more?")}${finishButtonHtml(4)}`
            : `<div class="btn-row"><button type="button" class="btn" id="submitL4">Submit</button></div>`}`;
      },
      wire: (el) => {
        wireAnswerBoxes(el);
        wireRoleplayStages(el);
        wireFinish(el, 4);
        const btn = el.querySelector("#submitL4");
        if (btn) btn.addEventListener("click", () => {
          if(!Array.isArray(getAnswer("s4.stages")) || !getAnswer("s4.stages").length){showNotFinished([{el:el.querySelector(".roleplay-stages"),name:"Q1: choose the stages you used"}]);return;}
          const missing = L4_BOXES.filter(b => isBlank(b.key)).map(b => ({ el: el.querySelector(`[data-key="${b.key}"]`), name: `Box ${b.num}` }));
          if (missing.length) { showNotFinished(missing); return; }
          rec.submitted.s4 = nowIso();
          queueSave("now");
          redrawInPlace(4, 1);
          revealFocus(document.querySelector(".recap-card"));
        });
      }
    }]
  }
];

/* ---------------- Level 5: Check and Exit Ticket ---------------- */

const L5_Q3 = [
  { id: "i", text: "Customer service ends once the customer has paid.", correct: false,
    hint: "Look back at what customer service means. Does it stop the moment the customer pays, or continue after the purchase?",
    right: "Correct: customer service continues even after the customer has made a purchase." },
  { id: "ii", text: "Good product knowledge helps a customer service officer answer customer questions confidently.", correct: true,
    hint: "Think about Alex. How did knowing the prices and features help him answer your questions?",
    right: "Correct: knowing the product lets staff answer accurately instead of guessing." },
  { id: "iii", text: "Service recovery is complete once the staff member has apologised.", correct: false,
    hint: "Count the 8 steps of service recovery. Is apologising the last step?",
    right: "Correct: apologising is only Step 3; the officer still needs to acknowledge feelings, ask questions and offer solutions." },
  { id: "iv", text: "A service breakdown occurs when customers make a complaint about a product or service.", correct: true,
    hint: "Look at the definition of service breakdown in Level 2. When does a service breakdown occur?",
    right: "Correct: that is the textbook definition of service breakdown." }
].map(it => Object.assign(it, {
  type: "tf", answerKey: `s5.q3.${it.id}`, attemptKey: `s5q3.${it.id}`, answerLabel: it.correct ? "True" : "False",
  lookAgain: LOOK_AGAIN[`s5q3.${it.id}`]
}));

const L5_Q4 = [{
  id: "q4", type: "mcq", answerKey: "s5.q4", attemptKey: "s5q4", correct: "B", answerLabel: "B", lookAgain: LOOK_AGAIN.s5q4,
  options: [
    { letter: "A", text: "\"I'm sorry about that. Our chargers usually work fine, so it may be your phone.\"" },
    { letter: "B", text: "\"I'm sorry you've had to call so many times. Let me personally make sure this gets fixed today.\"" },
    { letter: "C", text: "\"I'm sorry about that. Please call our hotline again tomorrow, and they will check it for you.\"" },
    { letter: "D", text: "\"Thank you for telling us about this. I'll pass your feedback on to our team.\"" }
  ],
  hints: {
    A: "The staff member apologised, but then blamed the customer's phone. Which step is about acknowledging feelings and assuring help?",
    C: "There is an apology, but is a solution offered? Look at Step 6.",
    D: "Thanking the customer is Step 8, but was the problem solved? Look at Step 6."
  },
  right: "Correct: B acknowledges the customer's frustration and offers a solution: making sure the charger is fixed today."
}];

const L5_MARKED = L5_Q3.concat(L5_Q4);

const CONFIDENCE_ROWS = [
  "I can explain why quality customer service matters to a business",
  "I can name the skills and qualities a good customer service employee needs",
  "I can describe the five stages of providing customer service",
  "I can explain what service breakdown is, and how to perform service recovery"
];
const FACES = [["😟", "Not yet"], ["🙁", "A little"], ["🙂", "Confident"], ["😄", "Very confident"]];

const L5_TABS = [
  {
    label: "Check",
    next: "Next: Exit ticket →",
    // Held back until Submit and every wrong item has had its Check again.
    nextState: () => (isDone(5) || (itemsSubmitted(L5_MARKED) && itemsResolved(L5_MARKED)) ? "show" : "hidden"),
    parts: [{
      html: (ctx) => {
        const submitted = itemsSubmitted(L5_MARKED);
        return `
          <h2 class="visually-hidden">Check your understanding</h2>
          <p>Try these without going back to the notes. It is okay to get some wrong!</p>
          <section class="question card" data-q="q3" aria-labelledby="l5q3">
            <h3 class="q-title" id="l5q3"><span class="q-num">Q1.</span> True or false? Tap True or False for each.</h3>
            <ol class="tf-list">
              ${L5_Q3.map(it => `
                <li class="tf-item" data-key="${it.answerKey}">
                  <p class="tf-text"><span class="tf-num">${it.id}.</span> ${escapeHtml(it.text)}</p>
                  ${itemControlHtml(it)}
                  ${itemFeedbackHtml(it)}
                </li>`).join("")}
            </ol>
          </section>
          <section class="question card" data-q="q4" aria-labelledby="l5q4">
            <h3 class="q-title" id="l5q4"><span class="q-num">Q2.</span> A customer at a mobile phone shop says, "This is the third time I've called about the same faulty charger, and nobody has fixed it!" Which response best shows good service recovery? Tap one.</h3>
            <div class="mcq-item" data-key="s5.q4">
              ${itemControlHtml(L5_Q4[0])}
              ${itemFeedbackHtml(L5_Q4[0])}
            </div>
          </section>
          <section class="question card" data-q="q5" aria-labelledby="l5q5">
            <h3 class="q-title" id="l5q5"><span class="q-num">Q3.</span> Explain why quality customer service matters to a business. Give ONE reason.</h3>
            ${answerBoxHtml("s5.q5", { label: "Quality customer service matters because", readOnly: ctx.readOnly, rows: 3 })}
            ${submitted ? checkNoteHtml("Check your answer: did you name one reason (customers return repeatedly, customers recommend the business to their relatives and friends, or customer loyalty ensures the continuity of the business) and explain what it means for the business?") : ""}
          </section>
          ${!submitted ? `<div class="btn-row"><button type="button" class="btn" id="submitL5">Check answer</button></div>` : ""}
          ${checkAgainHtml(L5_MARKED)}
          ${submitted && itemsResolved(L5_MARKED) ? summaryCardHtml(L5_MARKED) : ""}`;
      },
      wire: (el) => {
        wireAnswerBoxes(el);
        wireItems(el, L5_MARKED, () => redrawInPlace(5, 0));
        const submit = el.querySelector("#submitL5");
        if (submit) submit.addEventListener("click", () => {
          const missing = [];
          L5_Q3.forEach(it => { if (getAnswer(it.answerKey) === undefined) missing.push({ el: el.querySelector(`[data-key="${it.answerKey}"]`), name: `Q1 ${it.id}` }); });
          if (getAnswer("s5.q4") === undefined) missing.push({ el: el.querySelector('[data-key="s5.q4"]'), name: "Q2" });
          if (isBlank("s5.q5")) missing.push({ el: el.querySelector('[data-key="s5.q5"]'), name: "Q3" });
          if (missing.length) { showNotFinished(missing); return; }
          recordAttempts(L5_MARKED, "first");
          rec.submitted["s5.check"] = nowIso();
          queueSave("now");
          redrawInPlace(5, 0);
          revealFocus(document.querySelector('[data-q="q3"] .feedback'));
        });
        const again = el.querySelector("#checkAgainBtn");
        if (again) again.addEventListener("click", () => {
          if(isBlank("s5.q5")){showNotFinished([{el:el.querySelector('[data-key="s5.q5"]'),name:"Q3"}]);return;}
          recordAttempts(L5_MARKED, "second");
          queueSave("now");
          redrawInPlace(5, 0);
          const card = document.querySelector(".missed-card");
          if (card) revealFocus(card);
        });
      }
    }]
  },
  {
    label: "Exit ticket",
    parts: [{
      html: (ctx) => {
        const submitted = !!rec.submitted["s5.exit"];
        const ro = submitted || ctx.readOnly;
        return `
          <h2 class="visually-hidden">Exit ticket</h2>
          <section class="question card" data-q="q6" aria-labelledby="l5q6">
            ${answerBoxHtml("s5.q6", { labelHtml: `<span class="q-num">Q4.</span> What is one thing you have learnt about customer service?`, hint: "One thing I learnt is...", readOnly: ro, rows: 3 })}
          </section>
          <section class="question card" data-q="q7" aria-labelledby="l5q7">
            ${answerBoxHtml("s5.q7", { labelHtml: `<span class="q-num">Q5.</span> What is one question you still have about this chapter?`, hint: "I am still not sure about...", readOnly: ro, rows: 3 })}
          </section>
          <section class="question card" data-q="q8" aria-labelledby="l5q8">
            <h3 class="q-title" id="l5q8"><span class="q-num">Q6.</span> How confident are you that you can do each of these? Tap one face for each.</h3>
            ${CONFIDENCE_ROWS.map((row, r) => {
              const key = `s5.q8.${r + 1}`;
              const v = getAnswer(key);
              return `
              <div class="face-row" data-key="${key}">
                <p class="face-statement">${escapeHtml(row)}</p>
                <div class="face-options" role="group" aria-label="${escapeHtml(row)}">
                  ${FACES.map(([face, label], i) => `<button type="button" class="face-btn ${v === i ? "picked" : ""}" data-key="${key}" data-value="${i}" aria-pressed="${v === i}" ${ro ? "disabled" : ""}>
                    <span class="face-emoji" aria-hidden="true">${moodFaceHtml([2,3,5,7][i])}</span><span class="face-label">${label}</span></button>`).join("")}
                </div>
              </div>`;
            }).join("")}
          </section>
          ${submitted ? "" : `<div class="btn-row"><button type="button" class="btn" id="submitExit">Submit my exit ticket</button></div>`}`;
      },
      wire: (el) => {
        // The answer boxes sit inside question cards labelled by their own label.
        el.querySelectorAll('section[data-q="q6"], section[data-q="q7"]').forEach(s => s.removeAttribute("aria-labelledby"));
        wireAnswerBoxes(el);
        el.querySelectorAll(".face-btn").forEach(b => b.addEventListener("click", () => {
          setAnswer(b.getAttribute("data-key"), Number(b.getAttribute("data-value")), "soon");
          redrawInPlace(5, 1, `.face-btn[data-key="${b.getAttribute("data-key")}"][data-value="${b.getAttribute("data-value")}"]`);
        }));
        const submit = el.querySelector("#submitExit");
        if (submit) submit.addEventListener("click", () => {
          const missing = [];
          if (isBlank("s5.q6")) missing.push({ el: el.querySelector('[data-key="s5.q6"]'), name: "Q4" });
          if (isBlank("s5.q7")) missing.push({ el: el.querySelector('[data-key="s5.q7"]'), name: "Q5" });
          CONFIDENCE_ROWS.forEach((row, r) => { const key = `s5.q8.${r + 1}`; if (getAnswer(key) === undefined) missing.push({ el: el.querySelector(`.face-row[data-key="${key}"]`), name: `Q6 (row ${r + 1})` }); });
          if (missing.length) { showNotFinished(missing); return; }
          rec.submitted["s5.exit"] = nowIso();
          if (!rec.done[5]) rec.done[5] = nowIso();
          queueSave("now");
          redrawInPlace(5, 1);
          showChampionPopup();
        });
      }
    }]
  }
];

// Level 5 completion pop-up with Badge 5.
function showChampionPopup() {
  popConfetti();
  showModal({
    id: "badgeModal",
    className: "badge-modal",
    title: "🎉 You've finished Chapter 6!",
    bodyHtml: `<div class="badge-pop-img">${imgHtml("BADGE5", "badge-img")}</div>
      <p class="badge-pop-text">🏆 Completion Champion</p>`,
    buttons: [
      { label: "📊 See my learning report", primary: true, onClick: () => { window.location.hash = "#report"; } },
      { label: "Back to my route", onClick: () => backToRoute(5) }
    ]
  });
}

const LEVEL_CONTENT = {
  1: { tabs: [{ label: "Your stories", parts: [L1_PART] }] },
  2: { tabs: L2_TABS },
  3: { tabs: L3_TABS },
  4: { tabs: L4_TABS },
  5: { tabs: L5_TABS }
};

/* ---------------- Reading any student's record ----------------
   Used by the learning report (this student) and by Teacher Mode (any student). */

const ALL_MARKED = () => L3_Q2.concat(L5_MARKED);
function recAnswer(r, key) { const a = r && r.answers && r.answers[key]; return a ? a.v : undefined; }
function recDone(r, n) { return r && r.done ? r.done[n] : null; }
function recLevelsDone(r) { return r && r.done ? Object.keys(r.done).length : 0; }
// Right on the first try, out of the items, or null until every item has a first try.
function recFirstTry(r, items) {
  const first = (r && r.first) || {};
  if (!items.every(it => first[it.attemptKey])) return null;
  return items.filter(it => first[it.attemptKey].ok).length;
}
// The approved "Look at these again" lines for items wrong on the first try (no repeats).
function recLookAgain(r) {
  const lines = [];
  ALL_MARKED().forEach(it => {
    const f = r && r.first && r.first[it.attemptKey];
    if (f && !f.ok && !lines.includes(it.lookAgain)) lines.push(it.lookAgain);
  });
  return lines;
}
// Today's date in Singapore time as yyyy-mm-dd (for file names).
function sgDateStamp(date) {
  const p = {};
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(date || new Date()).forEach(x => { p[x.type] = x.value; });
  return `${p.year}-${p.month}-${p.day}`;
}
// Dates students and teachers see are in Singapore time.
function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
}
// How an attempt reads in Teacher Mode and the CSV, e.g. "Presenting product information (wrong)".
function attemptText(item, att) {
  if (!att) return "";
  let label = att.a;
  if (item.type === "select") label = item.options[att.a];
  if (item.type === "tf") label = att.a === true ? "True" : att.a === false ? "False" : "";
  return `${label == null ? "(blank)" : label} (${att.ok ? "right" : "wrong"})`;
}

function reportAnswerHtml(label, value) {
  const blank = value == null || String(value).trim() === "";
  return `<div class="qa"><h4 class="qa-q">${escapeHtml(label)}</h4><p class="qa-a" data-student-text>${escapeHtml(blank ? "Not answered yet" : String(value))}</p></div>`;
}

function reportChoiceLabel(item, value) {
  if (value === undefined || value === null || value === "") return "Not answered yet";
  if (item.type === "select") return item.options[value] || "Not answered yet";
  if (item.type === "tf") return value === true ? "True" : value === false ? "False" : "Not answered yet";
  const option = item.options.find(o => o.letter === value);
  return option ? `${option.letter}. ${option.text}` : "Not answered yet";
}

function reportMarkedHtml(item, r) {
  const first = r && r.first && r.first[item.attemptKey];
  const second = r && r.second && r.second[item.attemptKey];
  let value = recAnswer(r, item.answerKey);
  if (value === undefined) value = second ? second.a : first ? first.a : undefined;
  const title = item.type === "select" ? `Q2 ${item.id}. ${item.quote}`
    : item.type === "tf" ? `Q1 ${item.id}. ${item.text}`
    : `Q2. A customer at a mobile phone shop says, "This is the third time I've called about the same faulty charger, and nobody has fixed it!" Which response best shows good service recovery? Tap one.`;
  return `<div class="report-marked-answer">${reportAnswerHtml(title, reportChoiceLabel(item, value))}
    <dl class="report-attempts"><dt>First try</dt><dd data-student-text>${escapeHtml(first ? `${reportChoiceLabel(item, first.a)} (${first.ok ? "right" : "wrong"})` : "Not attempted yet")}</dd>
      <dt>Second try</dt><dd data-student-text>${escapeHtml(second ? `${reportChoiceLabel(item, second.a)} (${second.ok ? "right" : "wrong"})`
        : first && first.ok ? "Not needed: right on the first try" : "Not attempted yet")}</dd></dl></div>`;
}

function learningAnswersHtml(r) {
  const qa = (label, key) => reportAnswerHtml(label, recAnswer(r, key));
  const tick = key => recAnswer(r,key) === true ? "Yes" : recAnswer(r,key) === false ? "No" : undefined;
  const groups = [
    L1_BOXES.map(b => qa(`${b.num}. ${b.text}`,b.key)).join(""),
    qa("What did Alex do to make June feel welcome? Why did she bring her friend back?","s2.video") + qa("Was this good service recovery? Which of the 8 steps above were missing?","s2.think1") + qa("Name ONE item Uniqlo will not accept for return. Why do you think a business would have this rule?","s2.think2"),
    reportAnswerHtml("Alex conversation link",recAnswer(r,"s3.link")) + reportAnswerHtml("I have finished chatting with Alex.",tick("s3.tick")) + qa("Q1. Think back to your conversation with Alex. Identify ONE skill or quality he showed. Skill or quality:","s3.q1a") + qa("This is important to customers because","s3.q1b") + L3_Q2.map(it=>reportMarkedHtml(it,r)).join(""),
    reportAnswerHtml("Suzzie conversation link",recAnswer(r,"s4.link")) + reportAnswerHtml("Which stages did you do?",(recAnswer(r,"s4.stages") || []).join(", ")) + reportAnswerHtml("I have finished serving Suzzie.",tick("s4.tick")) + L4_BOXES.map(b=>qa(`${b.num}. ${b.text}`,b.key)).join(""),
    L5_MARKED.map(it=>reportMarkedHtml(it,r)).join("") + qa("Q3. Quality customer service matters because","s5.q5") + qa("Q4. What is one thing you have learnt about customer service?","s5.q6") + qa("Q5. What is one question you still have about this chapter?","s5.q7") + CONFIDENCE_ROWS.map((row,i)=>{const v=recAnswer(r,`s5.q8.${i+1}`);return reportAnswerHtml(`Q6. ${row}`,typeof v==="number" && FACES[v] ? FACES[v][1] : undefined);}).join("")
  ];
  return groups.map((html,i)=>`<section class="card report-answer-level" aria-labelledby="answerLevel${i+1}"><h3 class="section-title" id="answerLevel${i+1}">Level ${i+1}: ${escapeHtml(LEVELS[i].title)}</h3>${html}</section>`).join("");
}

/* ---------------- 6.1 My learning report ---------------- */

function renderReport() {
  const r = rec;
  const q2 = recFirstTry(r, L3_Q2);
  const q34 = recFirstTry(r, L5_MARKED);
  const look = recLookAgain(r);
  // "Nothing to look at again" only once Level 3 Q2 and Level 5 Q1 and Q2 have all been tried.
  const allTried = ALL_MARKED().every(it => r && r.first && r.first[it.attemptKey]);
  setGraphicHtml(app, `
    ${topBarHtml({ showHome: true, showChip: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">📊 My learning report</h1>
        <p class="level-sub"><span data-student-text>${escapeHtml(profileName(r))}</span>${profileName(r) ? " · " : ""}Class ${escapeHtml(student.cls)}, Register No. ${student.reg}</p>
      </div>
      <div class="block">
        <ul class="report-levels">
          ${LEVELS.map(s => {
            const when = recDone(r, s.num);
            const badge = s.iconImg ? levelIconHtml(s) : (CONFIG.IMAGES[s.badgeImg] || {}).emoji || s.icon;
            return `<li class="report-level ${when ? "done" : ""}">
              <div class="report-badge">${imgHtml(s.badgeImg, "badge-img")}</div>
              <div class="report-level-body">
                <p class="report-level-name">Level ${s.num}: ${escapeHtml(s.title)}</p>
                <p class="report-level-when">${when ? `✅ ${escapeHtml(shortDate(when))}` : "Not finished yet"}</p>
                <p class="report-level-badge ${s.iconImg ? "graphic-heading" : ""}">${when ? `${badge} ${escapeHtml(s.badge)}` : ""}</p>
              </div>
            </li>`;
          }).join("")}
        </ul>
      </div>
      <div class="block">
        ${iconCardsHtml([
          { icon: "🎯", html: `Level 3, Q2: first try <strong>${q2 == null ? "–" : q2} / 4</strong>.` },
          { icon: "🎯", html: `Level 5, Q1 and Q2: first try <strong>${q34 == null ? "–" : q34} / 5</strong>.` }
        ], "cols-2 report-scores")}
      </div>
      <section class="block" aria-labelledby="lookTitle">
        <h2 class="section-title" id="lookTitle">${hIcon("🔁")}Look at these again</h2>
        ${look.length ? `<ul class="look-list">${look.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : ""}
        ${!allTried ? `<p class="look-none">Finish Levels 3 and 5 to see what to look at again.</p>`
          : !look.length ? `<p class="look-none">Nothing to look at again. You got everything right on the first try! 🎉</p>` : ""}
      </section>
      <section class="block" aria-labelledby="confTitle">
        <h2 class="section-title" id="confTitle">${hIcon("💭")}How confident you felt</h2>
        <ul class="conf-list">
          ${CONFIDENCE_ROWS.map((row, i) => {
            const v = recAnswer(r, `s5.q8.${i + 1}`);
            return `<li class="conf-row"><span class="conf-text">${escapeHtml(row)}</span>
              <span class="conf-face">${typeof v === "number" ? `<span aria-hidden="true">${FACES[v][0]}</span> ${FACES[v][1]}` : "–"}</span></li>`;
          }).join("")}
        </ul>
      </section>
      <section class="block learning-answers" aria-labelledby="allAnswersTitle">
        <h2 class="section-title" id="allAnswersTitle">Your answers to every question</h2>
        <p>These are your saved answers. Questions you have not answered are marked “Not answered yet”.</p>
        ${learningAnswersHtml(r)}
      </section>
      <div class="block"><div class="btn-row"><a href="#home" class="btn" id="reportBack" onclick="event.preventDefault();backToRoute()">Back to my route</a></div></div>
    </main>
    ${footerHtml()}
  `);
}

/* ---------------- Teacher Mode ----------------
   T.1 sign in, T.2 Classes, T.3 Results, T.4 This device.
   The code is kept only in memory while the page is open, never stored. */

let teacher = null; // {code, classes, removed, tab}

const TEACHER_ERRORS = {
  bad_code: "Incorrect code.",
  locked_out: "Too many wrong codes. Wait 10 minutes and try again.",
  no_teacher_code: "The teacher code has not been set up yet. See the setup guide.",
  server: "The server could not load the results. Wait a minute and try again."
};

async function teacherCall(body) {
  try { return await api("POST", Object.assign({ code: teacher ? teacher.code : "" }, body), 20000); }
  catch (e) { return { ok: false, error: "server" }; }
}
function teacherErrorText(reply) { return TEACHER_ERRORS[reply.error] || TEACHER_ERRORS.server; }

function renderTeacher() {
  if (!teacher) renderTeacherGate();
  else renderTeacherHome();
}

function renderTeacherGate() {
  setGraphicHtml(app, `
    ${topBarHtml({ showHome: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">Teacher Mode</h1>
        <div class="card">
          <label for="teacherCode" class="field-label">Key in the teacher code.</label>
          <div class="input-row">
            <input type="password" id="teacherCode" class="text-input" autocomplete="off">
            <button class="btn" id="teacherEnter" type="button">Enter</button>
          </div>
          <p id="teacherError" class="form-error" role="alert" hidden></p>
        </div>
      </div>
    </main>
    ${footerHtml()}
  `);
  const input = document.getElementById("teacherCode");
  const btn = document.getElementById("teacherEnter");
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
  btn.addEventListener("click", async () => {
    const code = input.value.trim();
    const errEl = document.getElementById("teacherError");
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "Checking...";
    let reply;
    try { reply = await api("POST", { action: "teacherCheck", code }, 20000); }
    catch (e) { reply = { ok: false, error: "server" }; }
    if (!reply.ok) {
      errEl.textContent = teacherErrorText(reply);
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = "Enter";
      return;
    }
    teacher = { code, classes: reply.classes || [], removed: reply.removed || [], hidden: reply.hidden || [], tab: "classes", results: null, view: null, notice: "" };
    if (/^#teacher-preview-[1-5]$/.test(window.location.hash)) render();
    else renderTeacherHome();
  });
}

/* T.2 Classes */
function renderClassesTab(el, message) {
  const list = teacher.classes;
  setGraphicHtml(el, `
    <h2 class="section-title">Your classes</h2>
    <p>Select the class students will register under. Only one class is shown to students at a time. Each class has register numbers 1 to 50. Saved profiles stay in their original class.</p>
    ${list.length ? `<ul class="class-list">${list.map((c, i) => `
      <li class="class-row"><span class="class-name">${escapeHtml(c)}</span>
        <label class="class-visibility"><input type="radio" name="registrationClass" data-class-visible="${i}" aria-label="Show ${escapeHtml(c)} to students" ${teacher.classes.filter(name=>!(teacher.hidden || []).includes(name))[0] === c ? "checked" : ""}>Show to students</label>
        <button type="button" class="btn secondary small" data-remove="${i}">Remove</button></li>`).join("")}</ul>`
      : `<p class="muted">No classes yet.</p>`}
    <div class="card add-class">
      <label for="newClass" class="field-label">Add a class</label>
      <div class="input-row">
        <input type="text" id="newClass" class="text-input" maxlength="40" autocomplete="off" placeholder="e.g. 3E1">
        <button class="btn" id="addClassBtn" type="button">Add</button>
      </div>
      <p id="classError" class="form-error" role="alert" ${message ? "" : "hidden"}>${escapeHtml(message || "")}</p>
      <p class="field-note">The selected class appears at the top left of the student sign-in page. New students register in that class. Select another class to change registration.</p>
    </div>
  `);
  el.querySelectorAll("[data-class-visible]").forEach(box=>box.addEventListener("change",async()=>{
    const index=Number(box.dataset.classVisible), name=teacher.classes[index], visible=box.checked;
    el.querySelectorAll("button,input").forEach(control=>{control.disabled=true;});
    const reply=await teacherCall({action:"setClassVisibility",name,visible});
    if(!reply.ok){renderClassesTab(el,reply.error === "unknown_action" ? "Class visibility is not set up on the server yet. Ask your teacher to update Apps Script." : teacherErrorText(reply));return;}
    teacher.classes=reply.classes;teacher.hidden=reply.hidden || [];teacher.removed=reply.removed || [];
    classList=teacher.classes.filter(c=>!teacher.hidden.includes(c)).slice(0,1);lsSet(KEYS.classes,classList);
    renderClassesTab(el);
    const replacement=el.querySelector(`[data-class-visible="${index}"]`);if(replacement)replacement.focus();
  }));
  const input = el.querySelector("#newClass");
  const addBtn = el.querySelector("#addClassBtn");
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") addBtn.click(); });
  addBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    const err = (msg) => { const p = el.querySelector("#classError"); p.textContent = msg; p.hidden = false; };
    if (!name) { err("Key in a class name."); return; }
    if (name.length > 20) { err("Class names can be at most 20 characters."); return; }
    if (teacher.classes.some(c => c.toLowerCase() === name.toLowerCase())) { err(`${name} is already in your classes.`); return; }
    addBtn.disabled = true;
    const reply = await teacherCall({ action: "addClass", name });
    if (!reply.ok) {
      addBtn.disabled = false;
      if (reply.error === "duplicate") err(`${name} is already in your classes.`);
      else if (reply.error === "too_long") err("Class names can be at most 20 characters.");
      else if (reply.error === "blank") err("Key in a class name.");
      else err(teacherErrorText(reply));
      return;
    }
    teacher.classes = reply.classes;
    teacher.removed = reply.removed || [];
    teacher.hidden = reply.hidden || [];
    renderClassesTab(el);
    el.querySelector("#newClass").focus();
  });
  el.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
    const name = teacher.classes[Number(b.getAttribute("data-remove"))];
    showModal({
      id: "removeClassModal",
      title: "Remove class",
      bodyHtml: `<p>Remove ${escapeHtml(name)}? Students' saved answers are kept.</p>`,
      buttons: [
        {
          label: "Remove", primary: true, onClick: async () => {
            const reply = await teacherCall({ action: "removeClass", name });
            if (!reply.ok) { renderClassesTab(el, teacherErrorText(reply)); return; }
            teacher.classes = reply.classes;
            teacher.removed = reply.removed || [];
            teacher.hidden = reply.hidden || [];
            renderClassesTab(el);
          }
        },
        { label: "Cancel" }
      ]
    });
  }));
}

function teacherLessonLinksHtml(current) {
  return `<nav class="teacher-lesson-links" aria-label="Teacher lesson preview">${LEVELS.map(level=>`<a class="btn secondary" href="#teacher-preview-${level.num}" ${current===level.num ? 'aria-current="page"' : ""}>Level ${level.num}</a>`).join("")}</nav>`;
}

function renderTeacherLesson(n) {
  // Render against an isolated, temporary record. Never load or write student answers.
  const previousRecord = rec;
  const previousPath = pathShownNow;
  let content;
  renderingTeacherPreview = true;
  try {
    rec = freshRecord("",0,"");
    rec.agreed = "preview";
    rec.reached["s2.path"] = 8;
    pathShownNow = 8;
    content = LEVEL_CONTENT[n].tabs.map((tab,t)=>`<section class="teacher-lesson-step" aria-labelledby="teacherStep${t}">
      <h2 class="teacher-step-title" id="teacherStep${t}">${escapeHtml(tab.label)}</h2>
      ${tab.parts.map((part,i)=>`<section class="block part teacher-lesson-part" id="teacherPart${n}_${t}_${i}">${part.html({n,t,readOnly:true,fresh:false})}</section>`).join("")}
    </section>`).join("");
  } finally {
    rec = previousRecord;
    pathShownNow = previousPath;
    renderingTeacherPreview = false;
  }
  setGraphicHtml(app,`${topBarHtml({})}<main class="page teacher-lesson">
    <div class="block"><h1 class="page-title">Level ${n}: ${escapeHtml(lvl(n).title)}</h1>
      <p class="teacher-preview-note">Teacher preview: all sections are open. Activities are view-only and do not change student progress.</p>
      <div class="btn-row"><a class="btn secondary" href="#teacher">Back to Teacher Mode</a></div>
      ${teacherLessonLinksHtml(n)}</div>${content}</main>${footerHtml()}`);
  app.querySelectorAll(".teacher-lesson-part input, .teacher-lesson-part select, .teacher-lesson-part textarea, .teacher-lesson-part button").forEach(el=>{
    if (!el.matches(".listen-btn, [data-product-example]")) el.disabled = true;
  });
  app.querySelectorAll(".teacher-lesson [aria-labelledby]").forEach(el=>{
    if (!el.getAttribute("aria-labelledby").split(/\s+/).every(id=>document.getElementById(id))) el.removeAttribute("aria-labelledby");
  });
  wireListen(app);
  labelFormControls();
}

function renderTeacherHome() {
  const tabs = [["classes", "Classes"], ["results", "Results"], ["device", "This device"]];
  const cur = teacher.tab || "classes";
  setGraphicHtml(app, `
    ${topBarHtml({ showHome: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">Teacher Mode</h1>
        <p>View any level without completing the activities.</p>
        ${teacherLessonLinksHtml()}
        <div class="tabs" role="tablist" aria-label="Teacher Mode">
          ${tabs.map(([id, label]) => `<button type="button" role="tab" class="tab ${cur === id ? "current" : ""}" aria-selected="${cur === id}" id="tab_${id}" data-tab="${id}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="block" id="teacherPanel" role="tabpanel" aria-labelledby="tab_${cur}"></div>
    </main>
    ${footerHtml()}
  `);
  app.querySelectorAll(".tabs .tab").forEach(b => b.addEventListener("click", () => {
    teacher.tab = b.getAttribute("data-tab");
    renderTeacherHome();
  }));
  const panel = document.getElementById("teacherPanel");
  if (cur === "results") renderResultsTab(panel);
  else if (cur === "device") renderDeviceTab(panel);
  else renderClassesTab(panel);
}

/* ---------------- T.3 Results ----------------
   One class at a time: the records come from the server ("results"), and the class
   summary, students table, full reports and CSV are worked out here. */

function itemTeacherLabel(it) {
  if (it.type === "select") return `Q2 ${it.id} (answer: ${it.answerLabel})`;
  if (it.type === "tf") return `Q1 ${it.id}: ${it.text} (answer: ${it.answerLabel})`;
  return `Q2 (answer: ${it.answerLabel})`;
}

async function loadResults(cls) {
  teacher.results = { cls, loading: true, students: [] };
  const reply = await teacherCall({ action: "results", "class": cls });
  if (!reply.ok) { teacher.results = { cls, error: teacherErrorText(reply), students: [] }; return; }
  teacher.results = { cls, students: reply.students || [] };
}

function renderResultsTab(el) {
  const res = teacher.results || {};
  const options = teacher.classes.map(c => ({ value: c, label: c }))
    .concat((teacher.removed || []).map(c => ({ value: c, label: `${c} (removed)` })));
  setGraphicHtml(el, `
    <div class="field">
      <label for="resultsClass" class="field-label">Choose a class</label>
      <select id="resultsClass" class="select-input results-class">
        <option value="" disabled ${res.cls ? "" : "selected"}>Choose a class…</option>
        ${options.map(o => `<option value="${escapeHtml(o.value)}" ${o.value === res.cls ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}
      </select>
    </div>
    <div id="resultsBody"></div>
  `);
  el.querySelector("#resultsClass").addEventListener("change", async (e) => {
    const cls = e.target.value;
    teacher.view = null;
    teacher.notice = "";
    setGraphicHtml(el.querySelector("#resultsBody"), `<p class="muted">Loading…</p>`);
    await loadResults(cls);
    renderResultsTab(el);
  });
  const body = el.querySelector("#resultsBody");
  if (!res.cls) return;
  if (res.error) { setGraphicHtml(body, `<p class="form-error" role="alert">${escapeHtml(res.error)}</p>`); return; }
  if (teacher.view != null) { renderStudentReport(body, el); return; }
  renderClassResults(body, el);
}

function renderClassResults(body, panel) {
  const res = teacher.results;
  const students = res.students;
  const withWork = students.filter(s => s.record);
  const n = withWork.length;
  const marked = ALL_MARKED();
  const missed = marked.map(it => {
    const tried = withWork.filter(s => s.record.first && s.record.first[it.attemptKey]);
    const wrong = tried.filter(s => !s.record.first[it.attemptKey].ok).length;
    return { it, tried: tried.length, wrong };
  }).filter(m => m.wrong > 0).sort((a, b) => b.wrong - a.wrong); // only items someone got wrong
  const q7 = withWork.map(s => ({ reg: s.reg, v: recAnswer(s.record, "s5.q7") })).filter(x => x.v && String(x.v).trim());

  setGraphicHtml(body, `
    ${teacher.notice ? `<p class="notice" role="status">${escapeHtml(teacher.notice)}</p>` : ""}
    <section class="card results-summary" aria-labelledby="sumTitle">
      <h2 class="section-title" id="sumTitle">Class summary: ${escapeHtml(res.cls)}</h2>
      <p class="muted">${n} student${n === 1 ? "" : "s"} with saved work.</p>
      <h3 class="sum-head">Levels finished</h3>
      <ul class="sum-list">${LEVELS.map(s => `<li>Level ${s.num}: ${withWork.filter(x => recDone(x.record, s.num)).length} of ${n}</li>`).join("")}</ul>
      <h3 class="sum-head">Most missed on the first try</h3>
      ${missed.length ? `<ul class="sum-list">${missed.map(m => `<li>${escapeHtml(itemTeacherLabel(m.it))}: wrong for ${m.wrong} of ${m.tried}</li>`).join("")}</ul>` : `<p class="muted">Nothing missed on the first try yet.</p>`}
      <h3 class="sum-head">Confidence</h3>
      <div class="table-wrap"><table class="results-table">
        <thead><tr><th scope="col">Statement</th>${FACES.map(f => `<th scope="col"><span aria-hidden="true">${f[0]}</span> ${f[1]}</th>`).join("")}</tr></thead>
        <tbody>${CONFIDENCE_ROWS.map((row, i) => `<tr><th scope="row">${escapeHtml(row)}</th>${FACES.map((f, v) => `<td>${withWork.filter(x => recAnswer(x.record, `s5.q8.${i + 1}`) === v).length}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <h3 class="sum-head">Q5: one question I still have</h3>
      ${q7.length ? `<ul class="sum-list">${q7.map(x => `<li><strong>No. ${x.reg}:</strong> <span data-student-text>${escapeHtml(x.v)}</span></li>`).join("")}</ul>` : `<p class="muted">No answers yet.</p>`}
    </section>
    <section class="card" aria-labelledby="tableTitle">
      <h2 class="section-title" id="tableTitle">Students</h2>
      <p class="muted">Tap a row to open the student's full report.</p>
      <div class="table-wrap"><table class="results-table students-table">
        <thead><tr><th scope="col">Register No.</th><th scope="col">Levels done</th><th scope="col">Q2 first try</th><th scope="col">Q1 and Q2 first try</th><th scope="col">Confidence</th></tr></thead>
        <tbody>${students.map((s, i) => {
          const r = s.record;
          const q2 = recFirstTry(r, L3_Q2), q34 = recFirstTry(r, L5_MARKED);
          const faces = CONFIDENCE_ROWS.map((row, k) => { const v = recAnswer(r, `s5.q8.${k + 1}`); return typeof v === "number" ? `<span class="confidence-summary" role="img" aria-label="${FACES[v][1]}" title="${FACES[v][1]}">${FACES[v][0]}</span>` : "·"; }).join(" ");
          return `<tr class="student-row" data-i="${i}">
            <td><button type="button" class="row-link" data-i="${i}"><span data-student-text>${escapeHtml(profileName(r))}</span>${profileName(r) ? " · " : ""}No. ${s.reg}</button>${r ? "" : `<span class="muted"> (cleared)</span>`}</td>
            <td>${r ? recLevelsDone(r) : 0}</td><td>${q2 == null ? "–" : `${q2} / 4`}</td><td>${q34 == null ? "–" : `${q34} / 5`}</td><td class="faces-cell">${faces}</td>
          </tr>`;
        }).join("") || `<tr><td colspan="5">No students yet.</td></tr>`}</tbody>
      </table></div>
      <div class="btn-row"><button type="button" class="btn secondary" id="downloadCsv">⬇️ Download CSV</button></div>
    </section>
  `);
  const open = (i) => { teacher.view = i; teacher.notice = ""; renderResultsTab(panel); window.scrollTo(0, 0); };
  body.querySelectorAll(".student-row").forEach(row => row.addEventListener("click", () => open(Number(row.getAttribute("data-i")))));
  body.querySelector("#downloadCsv").addEventListener("click", () => downloadClassCsv(res));
}

// A student's full report (Teacher Mode).
function qa(label, value) {
  const v = value == null || String(value).trim() === "" ? "(blank)" : String(value);
  return `<div class="qa"><p class="qa-q">${escapeHtml(label)}</p><p class="qa-a" data-student-text>${escapeHtml(v)}</p></div>`;
}
function attemptsTable(items, firstCol) {
  return `<div class="table-wrap"><table class="results-table">
    <thead><tr><th scope="col">${firstCol}</th><th scope="col">First try</th><th scope="col">Second try</th></tr></thead>
    <tbody>${items.map(it => `<tr><th scope="row">${escapeHtml(it.type === "select" ? `${it.id}. ${it.quote}` : it.type === "tf" ? `${it.id}. ${it.text}` : "Q2. Best service recovery response")}</th>
      <td>${escapeHtml(attemptText(it, it._r.first && it._r.first[it.attemptKey]) || "–")}</td>
      <td>${escapeHtml(attemptText(it, it._r.second && it._r.second[it.attemptKey]) || "–")}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

function renderStudentReport(body, panel) {
  const res = teacher.results;
  const s = res.students[teacher.view];
  const r = s.record || {};
  const withR = items => items.map(it => Object.assign({ _r: r }, it));
  setGraphicHtml(body, `
    <div class="btn-row"><button type="button" class="btn secondary" id="backToClass">← Back to the class</button></div>
    <section class="card student-report" aria-labelledby="stuTitle">
      <h2 class="section-title" id="stuTitle"><span data-student-text>${escapeHtml(profileName(r))}</span>${profileName(r) ? " · " : ""}Class ${escapeHtml(res.cls)}, Register No. ${s.reg}</h2>
      <p class="muted">Levels done: ${recLevelsDone(r)} of 5${s.lastSaved ? ` · Last saved ${escapeHtml(s.lastSaved)}` : ""}${s.clearedAt ? ` · Work cleared ${escapeHtml(s.clearedAt)}` : ""}</p>
      <h3 class="sum-head">Level 1: stories</h3>
      ${L1_BOXES.map(b => qa(`${b.num}. ${b.text}`, recAnswer(r, b.key))).join("")}
      <h3 class="sum-head">Level 2: Think about it</h3>
      ${qa("What did Alex do to make June feel welcome? Why did she bring her friend back?", recAnswer(r, "s2.video"))}
      ${qa("Was this good service recovery? Which of the 8 steps above were missing?", recAnswer(r, "s2.think1"))}
      ${qa("Name ONE item Uniqlo will not accept for return. Why do you think a business would have this rule?", recAnswer(r, "s2.think2"))}
      <h3 class="sum-head">Level 3: Q1</h3>
      ${qa("Skill or quality:", recAnswer(r, "s3.q1a"))}
      ${qa("This is important to customers because", recAnswer(r, "s3.q1b"))}
      <h3 class="sum-head">Level 3: Q2</h3>
      ${attemptsTable(withR(L3_Q2), "Line")}
      <h3 class="sum-head">Level 4: reflections</h3>
      ${qa("Which stages did you do?",(recAnswer(r,"s4.stages") || []).join(", "))}${qa("Suzzie conversation link",recAnswer(r,"s4.link"))}${L4_BOXES.map(b => qa(`${b.num}. ${b.text}`, recAnswer(r, b.key))).join("")}
      <h3 class="sum-head">Level 5: Q1 and Q2</h3>
      ${attemptsTable(withR(L5_MARKED), "Item")}
      ${qa("Q3. Quality customer service matters because", recAnswer(r, "s5.q5"))}
      <h3 class="sum-head">Exit ticket</h3>
      ${qa("Q4. What is one thing you have learnt about customer service?", recAnswer(r, "s5.q6"))}
      ${qa("Q5. What is one question you still have about this chapter?", recAnswer(r, "s5.q7"))}
      <ul class="conf-list">${CONFIDENCE_ROWS.map((row, i) => { const v = recAnswer(r, `s5.q8.${i + 1}`); return `<li class="conf-row"><span class="conf-text">${escapeHtml(row)}</span><span class="conf-face">${typeof v === "number" ? `<span aria-hidden="true">${FACES[v][0]}</span> ${FACES[v][1]}` : "–"}</span></li>`; }).join("")}</ul>
    </section>
    <div class="btn-row"><button type="button" class="btn secondary danger" id="clearStudent">Clear this student's work</button></div>
  `);
  body.querySelector("#backToClass").addEventListener("click", () => { teacher.view = null; renderResultsTab(panel); });
  body.querySelector("#clearStudent").addEventListener("click", () => {
    showModal({
      id: "clearModal",
      title: "Clear this student's work",
      bodyHtml: `<p>Clear all work for ${escapeHtml(profileName(r) || "Student")}, Class ${escapeHtml(res.cls)}, Register No. ${s.reg}? This deletes their answers, first attempts, badges and progress, and cannot be undone. Download the CSV first if you want a copy.</p>`,
      buttons: [
        {
          label: "Clear work", primary: true, onClick: async () => {
            const reply = await teacherCall({ action: "clearStudent", "class": res.cls, reg: s.reg });
            if (!reply.ok) { teacher.notice = teacherErrorText(reply); }
            else {
              await loadResults(res.cls);
              teacher.notice = "Work cleared. This student starts again from Level 1 the next time they log in.";
            }
            teacher.view = null;
            renderResultsTab(panel);
          }
        },
        { label: "Cancel" }
      ]
    });
  });
}

// CSV for one class (V45's csvCell and download, with a byte order mark for Excel).
function csvCell(v) {
  const s = String(v == null ? "" : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadClassCsv(res) {
  const header = ["Class", "Register No.", "Student name", "Levels done"]
    .concat(LEVELS.map(s => `Level ${s.num} finished`))
    .concat(["Q2 first try (/4)", "Q1 and Q2 first try (/5)"])
    .concat(L1_BOXES.map(b => `Level 1 story ${b.num}`))
    .concat(["Level 2 Video reflection", "Level 2 Think about it 1", "Level 2 Think about it 2", "Level 3 Q1 skill or quality", "Level 3 Q1 why important"])
    .concat(L3_Q2.reduce((a, it) => a.concat([`Q2 ${it.id} first try`, `Q2 ${it.id} second try`]), []))
    .concat(["Alex conversation link","Suzzie conversation link","Level 4 stages used"]).concat(L4_BOXES.map(b => `Level 4 reflection ${b.num}`))
    .concat(L5_Q3.reduce((a, it) => a.concat([`Q1 ${it.id} first try`, `Q1 ${it.id} second try`]), []))
    .concat(["Q2 first try", "Q2 second try", "Q3", "Q4", "Q5"])
    .concat(CONFIDENCE_ROWS.map((row, i) => `Q6 confidence ${i + 1}: ${row}`))
    .concat(["Last saved", "Cleared at"]);
  const rows = res.students.map(s => {
    const r = s.record || {};
    const att = (it, which) => attemptText(it, r[which] && r[which][it.attemptKey]);
    const q2 = recFirstTry(r, L3_Q2), q34 = recFirstTry(r, L5_MARKED);
    return [res.cls, s.reg, profileName(r), recLevelsDone(r)]
      .concat(LEVELS.map(lv => shortDate(recDone(r, lv.num))))
      .concat([q2 == null ? "" : q2, q34 == null ? "" : q34])
      .concat(L1_BOXES.map(b => recAnswer(r, b.key)))
      .concat(["s2.video", "s2.think1", "s2.think2", "s3.q1a", "s3.q1b"].map(k => recAnswer(r, k)))
      .concat(L3_Q2.reduce((a, it) => a.concat([att(it, "first"), att(it, "second")]), []))
      .concat([recAnswer(r,"s3.link"),recAnswer(r,"s4.link"),(recAnswer(r,"s4.stages") || []).join("; ")]).concat(L4_BOXES.map(b => recAnswer(r, b.key)))
      .concat(L5_MARKED.reduce((a, it) => a.concat([att(it, "first"), att(it, "second")]), []))
      .concat(["s5.q5", "s5.q6", "s5.q7"].map(k => recAnswer(r, k)))
      .concat(CONFIDENCE_ROWS.map((row, i) => { const v = recAnswer(r, `s5.q8.${i + 1}`); return typeof v === "number" ? FACES[v][1] : ""; }))
      .concat([s.lastSaved || "", s.clearedAt || ""]);
  });
  const csv = "﻿" + [header].concat(rows).map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `EBS-Ch6-${String(res.cls).replace(/[^A-Za-z0-9_-]/g, "_")}-results-${sgDateStamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------------- T.4 This device ---------------- */

function renderDeviceTab(el, message) {
  const on = unlockAllOnDevice();
  setGraphicHtml(el, `
    ${message ? `<p class="notice" role="status">${escapeHtml(message)}</p>` : ""}
    <section class="card device-card" aria-labelledby="unlockTitle">
      <h2 class="section-title" id="unlockTitle">${hIcon("🔓")}Unlock all levels</h2>
      <p>For demos and for students who need to skip ahead.</p>
      ${on ? `<p class="notice" role="status">All levels are unlocked on this device.</p>
        <div class="btn-row"><button type="button" class="btn secondary" id="unlockToggle">Turn off</button></div>`
        : `<div class="btn-row"><button type="button" class="btn" id="unlockToggle">Unlock all levels on this device</button></div>`}
    </section>
    <section class="card device-card" aria-labelledby="resetTitle">
      <h2 class="section-title" id="resetTitle">${hIcon("🧹")}Reset this device</h2>
      <p>Use the same reset as Reset progress: enter the reset passcode, choose a registered student profile and confirm. The saved name, answers, badges and progress will be cleared, and the register number will be available again.</p>
      <div class="btn-row"><button type="button" class="btn secondary" id="resetDevice">Reset this device</button></div>
    </section>
  `);
  el.querySelector("#unlockToggle").addEventListener("click", () => {
    if (on) lsRemove(KEYS.unlockAll); else lsSet(KEYS.unlockAll, true);
    renderDeviceTab(el);
  });
  el.querySelector("#resetDevice").addEventListener("click", () => showStudentUnlock("reset"));
}

/* ---------------- Start ---------------- */

(function start() {
  const saved = lsGet(KEYS.active);
  if (saved && saved.cls && saved.reg) {
    student = { cls: saved.cls, reg: saved.reg };
    rec = lsGet(KEYS.rec(activeKey())) || freshRecord(saved.cls, saved.reg, "");
    syncActiveFromServer();
  }
  render();
  if (!student) refreshClassList();
  updateNetBanner();
  flushQueue();
})();

// On opening the app, pick up work saved from another device.
async function syncActiveFromServer() {
  const key = activeKey();
  const generation = resetGenerations.get(key) || 0;
  let reply;
  try { reply = await loadStudentRecord(student.cls, student.reg, profileName(rec)); }
  catch (e) { serverUnreachable = true; updateNetBanner(); return; }
  if(key !== activeKey() || generation !== (resetGenerations.get(key) || 0))return;
  if(!reply.ok){if(["name_required","name_mismatch","profile_setup_required"].includes(reply.error))releaseResetProfile(key);return;}
  if (String(rec.baseClearedAt || "") > String(reply.clearedAt || "")) return;
  const before = JSON.stringify(rec);
  if (reply.clearedAt && String(rec.baseClearedAt || "") < reply.clearedAt) {
    releaseResetProfile(key);
    return;
  } else {
    rec = mergeRecords(reply.record, rec);
    rec.baseClearedAt = reply.clearedAt || rec.baseClearedAt;
  }
  saveLocal();
  updateNetBanner();
  const h = window.location.hash;
  if (JSON.stringify(rec) !== before && (h === "" || h === "#home")) render();
}
