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
   ============================================================ */

const APP_VERSION = "0.2.1";
const CONFIG = window.APP_CONFIG || {};

/* ---------------- Utilities ---------------- */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
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

function imgFallback(el) {
  const wrap = document.createElement("div");
  wrap.innerHTML = imgPlaceholderHtml(el.getAttribute("data-img"), el.getAttribute("data-cls"));
  if (wrap.firstElementChild) el.replaceWith(wrap.firstElementChild);
}

/* ---------------- Levels (home page route) ---------------- */

const STATIONS = [
  { num: 1, icon: "📝", title: "Your Customer Service Stories", desc: "Think about your own experiences as a customer.", badge: "Story Sharer", badgeImg: "BADGE1" },
  { num: 2, icon: "📘", title: "Learn: Customer Service", desc: "Short notes on quality customer service, the four stages and service recovery.", badge: "Service Scholar", badgeImg: "BADGE2" },
  { num: 3, icon: "💬", title: "Chat with Alex", desc: "Be the customer. Chat with Nexora's customer service officer.", badge: "Service Spotter", badgeImg: "BADGE3" },
  { num: 4, icon: "🛍️", title: "Serve Suzzie at Stylez", desc: "Switch roles. Now you're the customer service officer.", badge: "Service Star", badgeImg: "BADGE4" },
  { num: 5, icon: "✅", title: "Check and Exit Ticket", desc: "Check what you've learnt and tell your teacher how confident you feel.", badge: "Chapter 6 Champion", badgeImg: "BADGE5" }
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
let homeNotice = ""; // "Welcome back!" line, shown once at the top of the home page

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
  if (!student || !rec) return;
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
  first: "keep", second: "keep", answers: "newest", ui: "newest"
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
    agreed: minText(p.agreed, o.agreed)
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
const PERMANENT_ERRORS = ["no_class", "bad_reg", "too_big", "bad_request", "unknown_action"];

function jitter(ms) { return Math.floor(Math.random() * ms); }
function loadQueue() { return lsGet(KEYS.queue) || {}; }
function saveQueue(q) { lsSet(KEYS.queue, q); }

let lastTypingSend = 0;
let typingTimer = null;

function queueSave(mode) {
  if (!student || !rec) return;
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
  const keys = Object.keys(q);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (!keys.length) return;
  const soonest = Math.min.apply(null, keys.map(k => q[k].nextAt || 0));
  flushTimer = setTimeout(flushQueue, Math.max(0, soonest - Date.now()));
}

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
      const key = Object.keys(q).find(k => (q[k].nextAt || 0) <= Date.now());
      if (!key) break;
      const record = lsGet(KEYS.rec(key));
      if (!record) { delete q[key]; saveQueue(q); continue; }
      let reply = null;
      try { reply = await api("POST", { action: "save", record }, 20000); }
      catch (e) { networkDown = true; }
      handleSaveReply(key, record, reply);
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

function handleSaveReply(key, sent, reply) {
  if (!reply || (!reply.ok && !PERMANENT_ERRORS.includes(reply.error) && reply.error !== "cleared")) {
    retryLater(key); // no answer, "busy" or a server problem: try again later
    return;
  }
  if (reply.error === "cleared") {
    // A teacher cleared this student's work: this device's older copy is thrown away.
    lsRemove(KEYS.rec(key));
    dropFromQueue(key);
    if (key === activeKey()) {
      rec = freshRecord(student.cls, student.reg, reply.clearedAt);
      saveLocal();
      window.location.hash = "#home";
      render();
    }
    return;
  }
  if (!reply.ok) {
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
  if (!student || !rec || !navigator.sendBeacon || !apiUrl()) return;
  if (!loadQueue()[activeKey()]) return;
  try {
    navigator.sendBeacon(apiUrl(), new Blob([JSON.stringify({ action: "save", record: rec })], { type: "text/plain" }));
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
  if (bar.textContent !== msg) bar.textContent = msg;
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
          ${o.showSubtitle ? `<p class="topbar-sub">A self-study revision module</p>` : ""}
          ${o.showChip && student ? `<p class="topbar-chip">Class ${escapeHtml(student.cls)} · Register No. ${student.reg}</p>` : ""}
        </div>
        ${o.showHome ? `<a href="#home" class="topbar-home" id="homeBtn">🏠 Home</a>` : ""}
      </div>
    </header>`;
}

function footerHtml() {
  return `
    <footer class="credits">
      <p><a href="#teacher" class="teacher-link">Teacher Mode</a></p>
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
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id || "modal"}Title">
      <h2 class="modal-title" id="${id || "modal"}Title">${title}</h2>
      ${bodyHtml || ""}
      <div class="btn-row modal-btns">
        ${buttons.map((b, i) => `<button type="button" class="btn ${b.primary ? "" : "secondary"}" data-i="${i}">${escapeHtml(b.label)}</button>`).join("")}
      </div>
    </div>`;
  document.body.appendChild(wrap);
  const btns = Array.from(wrap.querySelectorAll("button"));
  btns.forEach((el, i) => el.addEventListener("click", () => { wrap.remove(); if (buttons[i].onClick) buttons[i].onClick(); }));
  wrap.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const first = btns[0], last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  btns[0].focus();
  return wrap;
}

/* ---------------- 0.2 Before you start ---------------- */

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
    bodyHtml: `<ol class="briefing-list">${BRIEFING.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ol>`,
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

/* ---------------- Router ---------------- */

function render() {
  const hash = window.location.hash;
  document.querySelectorAll(".modal-backdrop").forEach(m => { if (m.id !== "briefing") m.remove(); });
  if (hash === "#teacher") { renderTeacher(); window.scrollTo(0, 0); return; }
  if (!student) { renderLanding(); return; }
  const m = hash.match(/^#level([1-5])$/);
  if (hash === "#terms") renderTerms();
  else if (m && isUnlocked(Number(m[1]))) renderLevel(Number(m[1]));
  else {
    if (hash !== "#home" && hash !== "") { history.replaceState(null, "", "#home"); }
    renderHome();
  }
  window.scrollTo(0, 0);
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
    : empty ? "Your teacher hasn't added your class yet. Ask your teacher to add it." : "";
  const picked = (document.getElementById("classInput") || {}).value || "";
  const typed = (document.getElementById("regInput") || {}).value || "";
  app.innerHTML = `
    ${topBarHtml({ titleIsHeading: true, showSubtitle: true })}
    <main class="page">
      <div class="block landing-banner">${imgHtml("N01", "banner-img")}</div>
      <div class="block">
        <p class="lead">Hi! In this module, you'll revise Chapter 6: Customer Service. You'll read short notes, chat with an AI customer service officer, serve an AI customer yourself, and check what you've learnt.</p>
      </div>
      <div class="block">
        <div class="card login-card">
          <h2 class="card-title">Step 1: Log in</h2>
          <div class="field">
            <label for="classInput" class="field-label">Choose your class.</label>
            <select id="classInput" class="select-input" ${loaded && !empty ? "" : "disabled"}>
              <option value="" disabled ${picked ? "" : "selected"}>Choose your class…</option>
              ${(loaded ? classList : []).map(c => `<option value="${escapeHtml(c)}" ${c === picked ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
            </select>
            ${note ? `<p class="field-note" id="classNote">${escapeHtml(note)}</p>` : ""}
          </div>
          <div class="field">
            <label for="regInput" class="field-label">Key in your register number.</label>
            <input type="text" id="regInput" class="text-input reg-input" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="e.g. 12" value="${escapeHtml(typed)}">
          </div>
          <p id="loginError" class="form-error" role="alert" hidden></p>
          <div class="btn-row"><button class="btn" id="startBtn" type="button">Start</button></div>
        </div>
      </div>
    </main>
    ${footerHtml()}
  `;
  const reg = document.getElementById("regInput");
  reg.addEventListener("input", () => { const clean = reg.value.replace(/\D/g, ""); if (clean !== reg.value) reg.value = clean; });
  reg.addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("startBtn").click(); });
  document.getElementById("startBtn").addEventListener("click", startLogin);
}

// Load the class list for the landing page, then redraw it if anything changed.
async function refreshClassList() {
  const fresh = await fetchClasses();
  if (fresh) {
    const changed = JSON.stringify(fresh) !== JSON.stringify(classList);
    classList = fresh;
    classListFailed = false;
    if (changed && !student && !window.location.hash) renderLanding();
  } else if (!Array.isArray(classList)) {
    classListFailed = true;
    if (!student && !window.location.hash) renderLanding();
  }
}

async function startLogin() {
  const cls = document.getElementById("classInput").value;
  const regText = document.getElementById("regInput").value.trim();
  const errEl = document.getElementById("loginError");
  const btn = document.getElementById("startBtn");
  const showError = (msg) => { errEl.textContent = msg; errEl.hidden = false; };
  errEl.hidden = true;
  if (!cls) { showError("Please choose your class."); return; }
  if (!regText) { showError("Please key in your register number."); return; }
  const reg = Number(regText);
  if (!/^\d+$/.test(regText) || reg < 1 || reg > 50) { showError("Register numbers are whole numbers from 1 to 50."); return; }

  btn.disabled = true;
  btn.textContent = "Checking...";
  const key = studentKey(cls, reg);
  let local = lsGet(KEYS.rec(key));
  let reply = null;
  try { reply = await api("GET", { action: "load", "class": cls, reg: String(reg) }, 10000); }
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
  record.cls = cls;
  record.reg = reg;

  student = { cls, reg };
  rec = record;
  lsSet(KEYS.active, student);
  saveLocal();
  // Send anything this device had that the server did not (and check the connection).
  if (local || serverUnreachable) enqueue(key, Date.now() + jitter(3000), false);
  homeNotice = returning ? "Welcome back! Your work has been loaded." : "";
  updateNetBanner();
  if (window.location.hash === "#home") render();
  else window.location.hash = "#home";
}

/* ---------------- Progress helpers ---------------- */

function isDone(num) { return !!(rec && rec.done && rec.done[num]); }
function doneCount() { return STATIONS.filter(s => isDone(s.num)).length; }
function unlockAllOnDevice() { return lsGet(KEYS.unlockAll) === true; }
function isUnlocked(num) { return num === 1 || isDone(num - 1) || unlockAllOnDevice(); }

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

function welcomeLine(done) {
  if (done === 0) return "Welcome! Start with Level 1.";
  if (done === STATIONS.length) return "You've finished all 5 levels. Well done! Have a look at your learning report.";
  return `Welcome back! You've finished ${done} of 5 levels. Keep going!`;
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
          <span class="level-name"><span aria-hidden="true">${s.icon}</span> <span class="visually-hidden">Level ${s.num}: </span>${escapeHtml(s.title)}</span>
          <span class="level-desc">${escapeHtml(s.desc)}</span>
          ${pill}
        </span>
      </button>
      <p class="locked-msg" id="lockedMsg${s.num}" role="status" hidden></p>
    </li>`;
}

function badgeShelfHtml() {
  return `<ul class="badge-shelf">${STATIONS.map(s => {
    const got = isDone(s.num);
    return `<li class="shelf-badge ${got ? "earned" : ""}">
      <div class="shelf-img">${imgHtml(s.badgeImg, "badge-img")}</div>
      <div class="shelf-name">${escapeHtml(s.badge)}<span class="visually-hidden">${got ? ", earned" : ", not earned yet"}</span></div>
    </li>`;
  }).join("")}</ul>`;
}

function renderHome() {
  const done = doneCount();
  const notice = homeNotice;
  homeNotice = "";
  app.innerHTML = `
    ${topBarHtml({ titleIsHeading: true, showChip: true })}
    <main class="page">
      ${notice ? `<div class="block"><p class="notice" role="status">${escapeHtml(notice)}</p></div>` : ""}
      <div class="block">
        <p class="lead">${escapeHtml(welcomeLine(done))}</p>
        <p class="home-links">
          <a href="#" id="howLink">📋 How this works</a>
          <span class="dot-sep" aria-hidden="true">·</span>
          <a href="#" id="switchLink">🔄 Sharing this device? Switch student</a>
        </p>
      </div>
      <div class="block">
        <a href="#terms" class="terms-card">
          <span class="terms-icon" aria-hidden="true">📘</span>
          <span><strong>Start here: 4 key terms</strong><br><span class="terms-sub">A 1-minute look before Level 2</span></span>
        </a>
      </div>
      <section class="block" aria-labelledby="routeTitle">
        <h2 class="section-title" id="routeTitle">Your route</h2>
        <div class="journey-progress">
          <p class="journey-count">${done} of 5 levels done</p>
          <div class="progress-track" role="progressbar" aria-label="Levels done" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${done}"><div class="progress-fill" style="width:${done / 5 * 100}%"></div></div>
        </div>
        <ol class="route">${STATIONS.map(renderLevelCard).join("")}</ol>
      </section>
      <section class="block" aria-labelledby="badgesTitle">
        <h2 class="section-title" id="badgesTitle">🏅 Your badges</h2>
        ${badgeShelfHtml()}
        ${done === STATIONS.length ? `<div class="btn-row"><a href="#report" class="btn">📊 My learning report</a></div>` : ""}
      </section>
    </main>
    ${footerHtml()}
  `;
  document.getElementById("howLink").addEventListener("click", (e) => { e.preventDefault(); showBriefing(); });
  document.getElementById("switchLink").addEventListener("click", (e) => { e.preventDefault(); confirmSwitchStudent(); });
  STATIONS.forEach(s => {
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
  { term: "Customer service", text: "Customer service refers to what businesses do for their customers so that they are happy and satisfied." },
  { term: "Quality customer service", text: "Quality customer service means doing more for customers to exceed their expectations." },
  { term: "Service breakdown", text: "A service breakdown occurs when customers make a complaint about a product or service." },
  { term: "Service recovery", text: "Service recovery is a process whereby a business takes action in response to service breakdown or failure." }
];

function renderTerms() {
  app.innerHTML = `
    ${topBarHtml({ showHome: true, showChip: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">📘 4 key terms</h1>
        <p class="lead">You'll meet these words in Level 2. Read them once now.</p>
        <ul class="term-list">
          ${KEY_TERMS.map(t => `<li class="card term-card"><strong>${escapeHtml(t.term)}</strong>: ${escapeHtml(t.text)}</li>`).join("")}
        </ul>
        <div class="btn-row"><a href="#home" class="btn" id="termsDone">Got it, back to my route</a></div>
      </div>
    </main>
    ${footerHtml()}
  `;
}

/* ---------------- Levels ----------------
   Slice 2: the level frame only. Levels 1 to 5 are built in slices 3 and 4. */

function renderLevel(num) {
  const s = STATIONS[num - 1];
  app.innerHTML = `
    ${topBarHtml({ showHome: true, showChip: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">${s.icon} Level ${num}: ${escapeHtml(s.title)}</h1>
      </div>
    </main>
    ${footerHtml()}
  `;
}

/* ---------------- Teacher Mode ----------------
   T.1 sign in and T.2 Classes. Results and This device come in slice 5.
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
  app.innerHTML = `
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
  `;
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
    teacher = { code, classes: reply.classes || [], removed: reply.removed || [], tab: "classes" };
    renderTeacherHome();
  });
}

function renderTeacherHome() {
  app.innerHTML = `
    ${topBarHtml({ showHome: true })}
    <main class="page">
      <div class="block">
        <h1 class="page-title">Teacher Mode</h1>
        <div class="tabs" role="tablist" aria-label="Teacher Mode">
          <button type="button" role="tab" class="tab current" aria-selected="true" id="tabClasses">Classes</button>
        </div>
      </div>
      <div class="block" id="teacherPanel" role="tabpanel" aria-labelledby="tabClasses"></div>
    </main>
    ${footerHtml()}
  `;
  renderClassesTab(document.getElementById("teacherPanel"));
}

/* T.2 Classes */
function renderClassesTab(el, message) {
  const list = teacher.classes;
  el.innerHTML = `
    <h2 class="section-title">Your classes</h2>
    ${list.length ? `<ul class="class-list">${list.map((c, i) => `
      <li class="class-row"><span class="class-name">${escapeHtml(c)}</span>
        <button type="button" class="btn secondary small" data-remove="${i}">Remove</button></li>`).join("")}</ul>`
      : `<p class="muted">No classes yet.</p>`}
    <div class="card add-class">
      <label for="newClass" class="field-label">Add a class</label>
      <div class="input-row">
        <input type="text" id="newClass" class="text-input" maxlength="40" autocomplete="off" placeholder="e.g. 3E1">
        <button class="btn" id="addClassBtn" type="button">Add</button>
      </div>
      <p id="classError" class="form-error" role="alert" ${message ? "" : "hidden"}>${escapeHtml(message || "")}</p>
      <p class="field-note">Classes appear in the class dropdown on the home page, in this order.</p>
    </div>
  `;
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
            renderClassesTab(el);
          }
        },
        { label: "Cancel" }
      ]
    });
  }));
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
  let reply;
  try { reply = await api("GET", { action: "load", "class": student.cls, reg: String(student.reg) }, 10000); }
  catch (e) { serverUnreachable = true; updateNetBanner(); return; }
  if (!reply.ok || key !== activeKey()) return;
  const before = JSON.stringify(rec);
  if (reply.clearedAt && String(rec.baseClearedAt || "") < reply.clearedAt) {
    rec = freshRecord(student.cls, student.reg, reply.clearedAt);
    lsRemove(KEYS.rec(key));
  } else {
    rec = mergeRecords(reply.record, rec);
    rec.baseClearedAt = reply.clearedAt || rec.baseClearedAt;
  }
  saveLocal();
  updateNetBanner();
  const h = window.location.hash;
  if (JSON.stringify(rec) !== before && (h === "" || h === "#home")) render();
}
