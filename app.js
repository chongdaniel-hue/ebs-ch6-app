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
   ============================================================ */

const APP_VERSION = "0.4";
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

const LEVELS = [
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
  updateNetBanner();
  justLoggedIn = true;
  if (window.location.hash === "#home") render();
  else window.location.hash = "#home";
}

/* ---------------- Progress helpers ---------------- */

function isDone(num) { return !!(rec && rec.done && rec.done[num]); }
function doneCount() { return LEVELS.filter(s => isDone(s.num)).length; }
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
          <span class="level-name"><span aria-hidden="true">${s.icon}</span> <span class="visually-hidden">Level ${s.num}: </span>${escapeHtml(s.title)}</span>
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
  app.innerHTML = `
    ${topBarHtml({ titleIsHeading: true, showChip: true })}
    <main class="page">
      <div class="block">
        <div class="welcome-card"><p class="welcome-text">${escapeHtml(welcomeLine(done, loaded))}</p></div>
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
        <ol class="route">${LEVELS.map(renderLevelCard).join("")}</ol>
      </section>
      <section class="block" aria-labelledby="badgesTitle">
        <h2 class="section-title" id="badgesTitle">🏅 Your badges</h2>
        ${badgeShelfHtml()}
        ${done === LEVELS.length ? `<div class="btn-row"><a href="#report" class="btn">📊 My learning report</a></div>` : ""}
      </section>
    </main>
    ${footerHtml()}
  `;
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
        <div class="head-row">
          <h1 class="page-title">📘 4 key terms</h1>
          ${listenButtonHtml("termsBlock")}
        </div>
        <p class="lead">You'll meet these words in Level 2. Read them once now.</p>
        <section class="terms-block" id="termsBlock" aria-label="4 key terms">
          <ul class="term-list">
            ${KEY_TERMS.map(t => `<li>${definitionHtml(`<p><strong>${escapeHtml(t.term)}</strong>: ${escapeHtml(t.text)}</p>`)}</li>`).join("")}
          </ul>
        </section>
        <div class="btn-row"><a href="#home" class="btn" id="termsDone">Got it, back to my route</a></div>
      </div>
    </main>
    ${footerHtml()}
  `;
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
function partsShown(n, t) { return Math.max(1, Number(rec.reached[`s${n}.t${t}`]) || 0); }
function isTabUnlocked(n, t) { return t === 0 || isDone(n) || tabsUnlocked(n) >= t || unlockAllOnDevice(); }

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
          const cls = i === current ? "current" : open ? "" : "locked";
          return `<li><button type="button" class="step-tab ${cls}" data-tab="${i}"
            ${i === current ? `aria-current="step"` : ""} ${open ? "" : `aria-disabled="true"`}>
            <span class="step-num" aria-hidden="true">${open ? i + 1 : "🔒"}</span>
            <span class="step-label">${escapeHtml(t.label)}${open ? "" : `<span class="visually-hidden"> (locked)</span>`}</span>
          </button></li>`;
        }).join("")}
      </ol>
    </nav>`;
}

// Draws the level page: arriving at a level, switching tab, or after Next or Submit.
function renderLevel(n) {
  pathShownNow = 0; // arriving at a level: the path works out again how much to show
  const s = lvl(n);
  const content = LEVEL_CONTENT[n];
  const t = currentTab(n);
  const tab = content.tabs[t];
  app.innerHTML = `
    ${topBarHtml({ showHome: true, showChip: true })}
    <div class="level-head"><div class="level-head-inner">
      <h1 class="page-title">${s.icon} Level ${n}: ${escapeHtml(s.title)}</h1>
    </div></div>
    ${tabBarHtml(n, t)}
    <main class="page level-page" id="levelMain"></main>
    ${footerHtml()}
  `;
  syncStickyOffsets();
  // Opening a level counts as starting it ("In progress" on the home page), but not
  // while the Before you start pop-up is still waiting for "I'm ready".
  if (rec.agreed && !isStarted(n)) { raiseReached(`s${n}.t${t}`, 1); queueSave("soon"); }
  app.querySelectorAll(".step-tab").forEach(b => b.addEventListener("click", () => {
    const i = Number(b.getAttribute("data-tab"));
    if (!isTabUnlocked(n, i) || i === t) return; // locked tabs cannot be opened
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
  main.innerHTML = tab.parts.slice(0, shown).map((part, i) =>
    `<section class="block part" id="part${i}" aria-labelledby="part${i}Title">${part.html(ctx)}</section>`).join("");
  tab.parts.slice(0, shown).forEach((part, i) => {
    const sec = document.getElementById(`part${i}`);
    const title = sec.querySelector(":scope > h2, :scope > .head-row > h2, :scope > .head-row > p, :scope > p, :scope > h3");
    if (title) title.id = `part${i}Title`;
    if (part.wire) part.wire(sec, ctx);
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
    if (state !== "hidden") nav = `<button type="button" class="btn" id="nextBtn" ${state === "disabled" ? "disabled" : ""}>${escapeHtml(tab.next)}</button>`;
  }
  if (nav) main.insertAdjacentHTML("beforeend", `<div class="block nav-row">${nav}</div>`);

  const cont = document.getElementById("continueBtn");
  if (cont) cont.addEventListener("click", () => {
    raiseReached(`s${n}.t${t}`, shown + 1);
    queueSave("soon");
    drawTab(n, t, tab, {});
    revealFocus(document.getElementById(`part${shown}Title`));
  });
  const next = document.getElementById("nextBtn");
  if (next) next.addEventListener("click", () => {
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
    title: `${(CONFIG.IMAGES[s.badgeImg] || {}).emoji || s.icon} ${escapeHtml(s.badge)}`, // the badge's own emoji (e.g. 🔍 for Badge 3)
    bodyHtml: `<div class="badge-pop-img">${imgHtml(s.badgeImg, "badge-img")}</div>
      <p class="badge-pop-text">You earned the ${escapeHtml(s.badge)} badge!</p>`,
    buttons: [{ label: "Back to my route", primary: true, onClick: () => { window.location.hash = "#home"; } }]
  });
}

/* ---------- "Not finished yet" (V45 submit guard) ----------
   missing: [{el, name}]. Each is outlined in red with "✗ Not done yet" and listed by
   name in the pop-up. Only Level 1 offers "Submit anyway"; required questions only
   offer "Go back". */
function showNotFinished(missing, onSubmitAnyway) {
  missing.forEach(m => m.el.classList.add("incomplete"));
  const count = missing.length;
  showModal({
    id: "notFinished",
    title: "⚠️ Not finished yet",
    bodyHtml: `
      <p>${count} ${count === 1 ? "item is" : "items are"} not done. ${count === 1 ? "It is" : "They are"} marked in <strong class="red-text">red</strong>.</p>
      <ul class="missing-list">${missing.map(m => `<li>✗ ${escapeHtml(m.name)}</li>`).join("")}</ul>
      ${onSubmitAnyway ? `<p>Do you want to go back and finish, or submit anyway?</p>` : ""}`,
    buttons: [
      { label: "Go back", primary: true, onClick: () => revealFocus(missing[0].el) }
    ].concat(onSubmitAnyway ? [{ label: "Submit anyway", onClick: onSubmitAnyway }] : [])
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
function definitionHtml(innerHtml) {
  return `<div class="definition" role="note"><span class="def-icon" aria-hidden="true">📖</span><div class="def-body">${innerHtml}</div></div>`;
}

// A row of icon cards (stacks on phones). items: [{icon, html}]
function iconCardsHtml(items, cls) {
  return `<ul class="icon-cards ${cls || ""}" style="--cards:${items.length}">${items.map(it =>
    `<li class="icon-card"><span class="ic-icon" aria-hidden="true">${it.icon}</span><div class="ic-body">${it.html}</div></li>`).join("")}</ul>`;
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
  return `<div class="img-pair">${ids.map(id => `<div class="img-pair-item">${imgHtml(id, "screenshot-img").replace("<img ", `<img onload="fitPairImage(this)" `)}</div>`).join("")}</div>`;
}
function fitPairImage(img) {
  if (img.naturalWidth && img.naturalHeight && img.parentElement) img.parentElement.style.flexGrow = String(img.naturalWidth / img.naturalHeight);
}

/* ---------------- 🔊 Listen: read a block of notes aloud ----------------
   Uses the browser's own speech (no audio files, works offline with the device's
   voices). Shown only where the browser supports it. Notes only, never questions. */

const canSpeak = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance === "function";
let speakingBtn = null;

// The button sits in its heading's row. targetId names the block it reads when that block
// is not the button's own section (the 4 key terms page).
function listenButtonHtml(targetId) {
  return canSpeak ? `<button type="button" class="btn secondary listen-btn" aria-pressed="false" ${targetId ? `data-target="${targetId}"` : ""}>🔊 Listen</button>` : "";
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices() || [];
  const want = v => /^en[-_](GB|SG)/i.test(v.lang);
  return voices.find(v => want(v) && v.localService) || voices.find(want) || null;
}

function stopSpeaking() {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  if (speakingBtn) { speakingBtn.textContent = "🔊 Listen"; speakingBtn.setAttribute("aria-pressed", "false"); }
  speakingBtn = null;
}

// The words of a block, without buttons, answer boxes, questions or icons.
function blockSpeechText(block) {
  const copy = block.cloneNode(true);
  copy.querySelectorAll("button, textarea, input, select, .think-card, .listen-row, [aria-hidden='true'], .nav-row").forEach(x => x.remove());
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
    const sentences = blockSpeechText(block).match(/[^.!?]+[.!?]*["')]*\s*/g) || [];
    const voice = pickVoice();
    speakingBtn = btn;
    btn.textContent = "⏹ Stop";
    btn.setAttribute("aria-pressed", "true");
    sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.trim());
      u.lang = voice ? voice.lang : "en-GB";
      if (voice) u.voice = voice;
      u.rate = 0.9;
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
    const submitted = !!rec.submitted.s1;
    return `
      <h2 class="visually-hidden">Your stories</h2>
      <p>Think about your own experiences as a customer. There are no right or wrong answers.</p>
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
        <p>Type at least one sentence in each box, then tap Submit.</p>
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
      const missing = L1_BOXES.filter(b => isBlank(b.key))
        .map(b => ({ el: el.querySelector(`[data-key="${b.key}"]`), name: `Box ${b.num}` }));
      if (missing.length) showNotFinished(missing, submit);
      else submit();
    });
  }
};

/* ---------------- Level 2: Learn: Customer Service ---------------- */

const STAGES = [
  { icon: "👋", name: "Approaching customers", text: "Greet the customer, show you're happy to help." },
  { icon: "📱", name: "Presenting product information", text: "Find out their needs, present a suitable product, explain why it suits their needs, handle questions or objections (when the customer is unsure or disagrees)." },
  { icon: "✅", name: "Closing the customer experience positively", text: "Summarise what the customer decided and any next steps (e.g. warranty, collection date), thank the customer, leave a good final impression." },
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
  { icon: "😊", label: "Thank", text: "Thank customers for bringing the problem to our attention.", bubble: "\"Thank you for letting us know about this.\"", face: "😊", mood: "happy" }
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
        <p class="path-face"><span aria-hidden="true">${step.face}</span><span class="visually-hidden">Customer feels ${step.mood}</span></p>
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

const L2_TABS = [
  {
    label: "Quality Customer Service",
    next: "Next: The Four Stages →",
    parts: [
      notesPart(() => `
        <h2 class="section-title">${hIcon("🤝")}What is customer service?</h2>
        ${definitionHtml(`<p><strong>Customer service</strong> refers to what businesses do for their customers so that they are happy and satisfied.</p>`)}
        <p>It takes place the moment a customer enters a shop, a restaurant or an attraction, and continues even after the customer has made a purchase and left the venue.</p>
        <h2 class="section-title">${hIcon("⭐")}What is quality customer service?</h2>
        ${definitionHtml(`<p><strong>Quality customer service</strong> means doing more for customers to exceed their expectations.</p>`)}
`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("❓")}Why does quality customer service matter?</h2>
        <p>If a business provides quality customer service:</p>
        ${iconCardsHtml([
          { icon: "🔁", html: "customers will have a positive experience and they will choose to <strong>return repeatedly</strong>;" },
          { icon: "🗣️", html: "customers will <strong>recommend</strong> the business to their relatives and friends; and" },
          { icon: "🤝", html: "<strong>customer loyalty</strong> is created, ensuring the <strong>continuity of the business</strong>." }
        ], "cols-3")}
        ${imgHtml("C01", "comic-img")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("🧑‍💼")}Skills and qualities of a good customer service employee</h2>
        <p>Some skills and qualities customer service employees need:</p>
        ${iconCardsHtml([
          { icon: "😊", html: "<strong>Approachable:</strong> friendly and easy to talk to, so customers feel comfortable asking for help" },
          { icon: "🎯", html: "<strong>Customer-focused:</strong> paying attention to what each customer needs and putting those needs first" },
          { icon: "💬", html: "<strong>Clear communication skills:</strong> explaining things simply" },
          { icon: "🧠", html: "<strong>Knowledgeable:</strong> knowing the products well, so you can answer questions accurately" },
          { icon: "🛠️", html: "<strong>Problem-solving skills:</strong> providing solutions, not just apologising" },
          { icon: "👋", html: "<strong>Able to close the customer experience positively:</strong> ending on a good note, e.g. thanking the customer and inviting them back" }
        ], "cols-3 grid-6")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("📱")}Good product knowledge</h2>
        <p>Staff need good product knowledge to answer questions accurately, not guess. This includes:</p>
        ${iconCardsHtml([
          { icon: "📋", html: "Product features and specifications (e.g. screen size, battery life)" },
          { icon: "💲", html: "Price and available options" },
          { icon: "🧴", html: "How to use or care for the product" },
          { icon: "🛡️", html: "Warranty and after-sales support" },
          { icon: "⭐", html: "Unique selling points of the product (why your product is better than competitors' products)" }
        ], "chips")}
        ${imgHtml("N02", "notes-img")}`)
    ]
  },
  {
    label: "The Four Stages",
    next: "Next: Breakdown and Recovery →",
    parts: [
      notesPart(() => `
        <h2 class="section-title">${hIcon("🗺️")}The four stages of providing customer service</h2>
        <table class="stage-table">
          <thead class="visually-hidden"><tr><th scope="col">Stage</th><th scope="col">What to do</th></tr></thead>
          <tbody>
            ${STAGES.map((s, i) => `<tr class="stage-row stage-${i + 1}"><th scope="row"><span class="stage-head"><span class="stage-icon" aria-hidden="true">${s.icon}</span><span>${i + 1}. ${escapeHtml(s.name)}</span></span></th><td>${escapeHtml(s.text)}</td></tr>`).join("")}
          </tbody>
        </table>
        ${imgHtml("C02", "comic-img")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("👋")}Approaching customers: 3 approaches</h2>
        <p class="when-box"><span class="when-icon" aria-hidden="true">⏰</span> <span><strong>When to approach:</strong> as soon as a customer enters the store. If you are busy serving someone else, still acknowledge the new customer by making eye contact, smiling and greeting them politely.</span></p>
        <ul class="approach-cards">
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">👋</span>
            <h3 class="approach-name">1. Greeting Approach:</h3>
            <p>Greet the customer in a friendly way as they enter, e.g.</p>
            ${sayHtml("\"Good morning!\"")}
            <p>For a regular customer, use their name:</p>
            ${sayHtml("\"Good morning, Mr Tan!\"")}
          </li>
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">🙋</span>
            <h3 class="approach-name">2. Service Approach:</h3>
            <p>Ask a polite question to show you're ready to help, e.g.</p>
            ${sayHtml("\"How may I assist you?\"")}
            <p>If a customer comes up to you to ask for something or to pay, serve them as quickly as possible.</p>
            <p class="approach-combine">You can also combine the greeting and service approaches:</p>
            ${sayHtml("\"Good morning! How may I assist you?\"")}
          </li>
          <li class="approach-card">
            <span class="ic-icon" aria-hidden="true">📱</span>
            <h3 class="approach-name">3. Product Approach:</h3>
            <p>When a customer is looking closely at a product, ask a question about it to help them go from just being interested to actually buying it, e.g.</p>
            ${sayHtml("\"This phone has a great camera. Would you like to try it out?\"")}
          </li>
        </ul>
`),
      notesPart(() => `
        <p>Whether salespeople use the greeting, service or product approach, the purpose is to:</p>
        ${iconCardsHtml([
          { icon: "😊", html: "make customers feel comfortable or welcome in the store so that they are likely to buy from the business; and" },
          { icon: "🔁", html: "ensure customers return to the business again in the future." }
        ], "cols-2")}
        ${imgHtml("C03", "comic-img")}`),
      notesPart(() => `
        <h2 class="section-title">${hIcon("🎯")}Presenting product information: suitability</h2>
        <p>Don't just list every good feature. Point out the features that match what this customer needs. For example, a customer who takes lots of photos should hear information about the phone's camera, not how good the phone looks.</p>`)
    ]
  },
  {
    label: "Breakdown and Recovery",
    parts: [
      notesPart(() => `
          <h2 class="section-title">${hIcon("⚠️")}Service breakdown and service recovery</h2>
          ${definitionHtml(`<p><strong>Service breakdown:</strong> A service breakdown occurs when customers make a complaint about a product or service.</p><p class="def-more">Common causes: unfriendly or unhelpful staff, a product that does not meet expectations, or an advertised product that is not available in the store.</p>`)}
          ${definitionHtml(`<p><strong>Service recovery:</strong> Service recovery is a process whereby a business takes action in response to service breakdown or failure.</p>`)}`),
      notesPart((ctx) => {
        // First time on the path: Step 1 only. Coming back later: all 8 at once.
        if (ctx.fresh || !pathShownNow) pathShownNow = pathShown() >= 1 ? 8 : 1;
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
        <div class="card think-card">
          <h3 class="think-title">${hIcon("🤔")}Think about it (optional)</h3>
          ${answerBoxHtml("s2.think1", { label: "Was this good service recovery? Which of the 8 steps above were missing?", hint: "I think this was / was not good service recovery because... The steps that were missing were...", readOnly: ctx.readOnly })}
        </div>`, { wireMore: (el) => wireAnswerBoxes(el) }),
      notesPart((ctx) => `
        <h2 class="section-title">${hIcon("↩️")}Handling returns of unsatisfactory products</h2>
        <p>If a customer returns a product they are unhappy with, the business can offer:</p>
        ${iconCardsHtml([
          { icon: "🔁", html: "<strong>Replacement:</strong> Replace it with the same product." },
          { icon: "🔄", html: "<strong>Exchange:</strong> Offer to exchange it with a different product." },
          { icon: "💵", html: "<strong>Refund:</strong> Give a refund." }
        ], "cols-3")}
        ${imgHtml("N03", "comic-img")}
`),
      notesPart((ctx) => `
        <p>Many businesses also set clear rules for returns, such as a time limit and needing the receipt.</p>
        ${imgHtml("R03", "uniqlo-img")}
        <div class="card think-card">
          <h3 class="think-title">${hIcon("🤔")}Think about it (optional)</h3>
          ${answerBoxHtml("s2.think2", { label: "Name ONE item Uniqlo will not accept for return. Why do you think a business would have this rule?", hint: "One item Uniqlo will not accept is... I think they have this rule because...", readOnly: ctx.readOnly })}
        </div>
        ${recapHtml("The four stages are approaching customers, presenting product information, closing the customer experience positively and performing service recovery.")}
        ${finishButtonHtml(2)}`, { wireMore: (el) => { wireAnswerBoxes(el); wireFinish(el, 2); } })
    ]
  }
];

function afterPathHtml() {
  return `<p class="after-path">Handled well, a service breakdown can improve customer loyalty. If it is handled badly, you can lose the customer to your competitors.</p>
    ${imgHtml("C04", "comic-img")}`;
}

function wirePath(el, ctx) {
  const btn = el.querySelector("#showStepBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    pathShownNow = Math.min(8, pathShownNow + 1);
    raiseReached("s2.path", pathShownNow);
    queueSave("soon");
    if (pathShownNow < 8) {
      el.querySelector("#pathHolder").innerHTML = recoveryPathHtml(pathShownNow, true);
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
   Level 3 Q2 and Level 5 Q3 and Q4. Submit records the first attempt (never
   overwritten). Each wrong item shows its own hint and can be changed once, then
   "Check again" records the second attempt. Still wrong: the right answer with its
   reason. Feedback sits directly under its item, with ✓ or ✗ (never colour alone).

   An item: {id, answerKey, attemptKey, type: "select" | "tf" | "mcq", options,
   correct, right (the "Correct: ..." message), hint (one hint) or hints (by answer),
   answerLabel (the right answer's name for "The answer is ...")} */

function itemState(item) {
  const first = rec.first[item.attemptKey];
  if (!first) return "open";
  if (first.ok) return "right";
  const second = rec.second[item.attemptKey];
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
    return `<p class="feedback wrong" role="status">✗ ${escapeHtml(hint)}</p>`;
  }
  // Still wrong after Check again: the right answer, with the same reason as the correct message.
  const reason = item.right.replace(/^Correct: /, "");
  return `<p class="feedback wrong" role="status">✗ The answer is ${escapeHtml(item.answerLabel)}: ${escapeHtml(reason)}</p>`;
}

function itemEditable(item) {
  if (isDone(Number(item.answerKey.charAt(1)))) return false;
  const st = itemState(item);
  return st === "open" || st === "retry";
}

// The answer control for an item. Nothing is pre-selected: only the student's own answer shows.
function itemControlHtml(item) {
  const v = getAnswer(item.answerKey);
  const off = !itemEditable(item);
  if (item.type === "select") {
    return `<select class="select-input item-select" data-item="${item.id}" ${off ? "disabled" : ""}>
      <option value="" disabled ${v === undefined ? "selected" : ""}>Choose a stage…</option>
      ${item.options.map((o, i) => `<option value="${i}" ${v === i ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}
    </select>`;
  }
  if (item.type === "tf") {
    return `<div class="tf-pair" role="group" aria-label="True or False">
      ${[["True", true], ["False", false]].map(([label, val]) => `<button type="button" class="choice-btn tf-btn ${v === val ? "picked" : ""}" data-item="${item.id}" data-value="${val}" aria-pressed="${v === val}" ${off ? "disabled" : ""}>${label}</button>`).join("")}
    </div>`;
  }
  return `<div class="mcq-options" role="group" aria-label="Choose one answer">
    ${item.options.map(o => `<button type="button" class="choice-btn mcq-btn ${v === o.letter ? "picked" : ""}" data-item="${item.id}" data-value="${o.letter}" aria-pressed="${v === o.letter}" ${off ? "disabled" : ""}>
      <span class="mcq-letter" aria-hidden="true">${o.letter}</span><span class="mcq-text"><span class="visually-hidden">${o.letter}. </span>${escapeHtml(o.text)}</span></button>`).join("")}
  </div>`;
}

// Wires every answer control in el. After a change the tab is redrawn in place.
function wireItems(el, items, redraw) {
  const byId = {};
  items.forEach(it => { byId[it.id] = it; });
  el.querySelectorAll("select.item-select").forEach(sel => sel.addEventListener("change", () => {
    const it = byId[sel.getAttribute("data-item")];
    setAnswer(it.answerKey, Number(sel.value), "soon");
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
    if (which === "second" && itemState(it) === "retry" && !rec.second[it.attemptKey]) rec.second[it.attemptKey] = rec1;
  });
}

function checkAgainHtml(items, id) {
  return items.some(it => itemState(it) === "retry")
    ? `<div class="btn-row check-row"><button type="button" class="btn" id="${id}">Check again</button></div>` : "";
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
function wireTick(el, n, t, key) {
  const box = el.querySelector(`input.tick-input[data-answer="${key}"]`);
  if (box) box.addEventListener("change", () => {
    setAnswer(key, box.checked, "soon");
    redrawInPlace(n, t, `input.tick-input[data-answer="${key}"]`);
  });
}
function gemButtonHtml(url, label) {
  return `<div class="btn-row"><a class="btn gem-btn" href="${escapeHtml(url || "#")}" target="_blank" rel="noopener">${escapeHtml(label)}</a></div>`;
}

/* ---------------- Level 3: Chat with Alex ---------------- */

const STAGE_NAMES = STAGES.map(s => s.name);

const L3_Q2 = [
  { id: "P", quote: "\"Could you tell me when the screen first stopped working? Then we can arrange a repair or replacement for you.\"", correct: 3,
    hint: "This officer asks when the screen stopped working and offers a repair. Has something gone wrong for this customer?",
    right: "Correct: asking questions (Step 5) and offering a solution (Step 6) are part of service recovery." },
  { id: "Q", quote: "\"Since you play a lot of games, the Nexora Prime's fast processor would suit you best.\"", correct: 1,
    hint: "The officer matches a phone feature to something the customer does a lot. Which stage is about presenting a suitable product?",
    right: "Correct: matching a feature to the customer's needs is presenting product information." },
  { id: "R", quote: "\"So that's the Nexora Core with the 256GB upgrade and the one-year warranty. You can collect it on Friday!\"", correct: 2,
    hint: "The officer sums up what the customer chose and when to collect it. Is this the start or the end of the interaction?",
    right: "Correct: summing up the decision and the next steps closes the customer experience positively." },
  { id: "S", quote: "\"Good afternoon! Is there anything I can help you find today?\"", correct: 0,
    hint: "This is the first thing the officer says to the customer. Which stage starts the conversation?",
    right: "Correct: a greeting with an offer of help is approaching customers." }
].map(it => Object.assign(it, {
  type: "select", options: STAGE_NAMES, answerKey: `s3.q2.${it.id}`, attemptKey: `s3q2.${it.id}`, answerLabel: STAGE_NAMES[it.correct]
}));

const L3_TABS = [
  {
    label: "Chat",
    next: "Next: Think back →",
    nextState: () => (getAnswer("s3.tick") === true || isDone(3) ? "show" : "disabled"),
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
        ${gemButtonHtml(CONFIG.GEMS && CONFIG.GEMS.alex, "💬 Open Alex (new tab) ↗")}
        ${tickHtml("s3.tick", "I have finished chatting with Alex.", ctx.readOnly)}`,
      wire: (el, ctx) => wireTick(el, 3, 0, "s3.tick")
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
            ${checkAgainHtml(L3_Q2, "checkAgainQ2")}
          </section>
          ${!submitted ? `<div class="btn-row"><button type="button" class="btn" id="submitL3">Submit</button></div>` : ""}
          ${resolved ? `${recapHtml("The same four stages happen in every customer interaction, whether it's in a shop or in a chat.")}${finishButtonHtml(3)}` : ""}`;
      },
      wire: (el, ctx) => {
        wireAnswerBoxes(el);
        wireItems(el, L3_Q2, () => redrawInPlace(3, 1));
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
        const again = el.querySelector("#checkAgainQ2");
        if (again) again.addEventListener("click", () => {
          recordAttempts(L3_Q2, "second");
          queueSave("now");
          redrawInPlace(3, 1);
          const fin = document.querySelector(".recap-card");
          if (fin) revealFocus(fin);
        });
      }
    }]
  }
];

/* ---------------- Level 4: Serve Suzzie at Stylez ---------------- */

const L4_BOXES = [
  { key: "s4.q1", num: 1, icon: "👍", text: "What is one thing you feel you did well when serving Suzzie?", hint: "I did well at..." },
  { key: "s4.q2", num: 2, icon: "🔄", text: "What is one thing you would do differently next time?", hint: "Next time, I would..." }
];

const L4_TABS = [
  {
    label: "Roleplay",
    next: "Next: Reflect →",
    nextState: () => (getAnswer("s4.tick") === true || isDone(4) ? "show" : "disabled"),
    parts: [{
      html: (ctx) => `
        <h2 class="visually-hidden">Roleplay</h2>
        <div class="intro-with-pic">
          <div class="intro-pic">${imgHtml("N05", "avatar-img")}</div>
          <p>Now switch roles. You are a customer service officer at Stylez, a retail store. The AI plays Suzzie, a customer with a question or a problem.</p>
        </div>
        <div class="card placeholder-card" role="note">
          <h3 class="placeholder-title"><span aria-hidden="true">🏬</span> About Stylez</h3>
          <p class="placeholder-flag">⚑ PLACEHOLDER: fill in from the Stylez document (what Stylez sells, prices, store policies) so that it matches what Suzzie's Gem knows. Claude Code builds the card with this placeholder text until then.</p>
        </div>
        <div class="start-box">
          <p><strong>You start the conversation.</strong> Try:</p>
          ${sayHtml("\"Hi, welcome to Stylez! How may I assist you?\"")}
        </div>
        <p class="stages-box"><span class="when-icon" aria-hidden="true">🗺️</span> <span>Try to use the four stages from Level 2: approach Suzzie, present product information, close positively, and if there's a problem, perform service recovery.</span></p>
        ${gemButtonHtml(CONFIG.GEMS && CONFIG.GEMS.suzzie, "🛍️ Open Suzzie (new tab) ↗")}
        ${tickHtml("s4.tick", "I have finished serving Suzzie.", ctx.readOnly)}`,
      wire: (el) => wireTick(el, 4, 0, "s4.tick")
    }]
  },
  {
    label: "Reflect",
    parts: [{
      html: (ctx) => {
        const submitted = !!rec.submitted.s4;
        return `
          <h2 class="visually-hidden">Reflect</h2>
          <p>Think about your roleplay with Suzzie.</p>
          <div class="story-cards cols-2-cards">
            ${L4_BOXES.map(b => answerBoxHtml(b.key, {
              cls: "story-card", icon: b.icon,
              labelHtml: `<strong>${b.num}.</strong> ${escapeHtml(b.text)}`, hint: b.hint, readOnly: submitted || ctx.readOnly, rows: 5
            })).join("")}
          </div>
          ${submitted ? `${recapHtml("Look back at the four stages. Which one would you like to practise more?")}${finishButtonHtml(4)}`
            : `<div class="btn-row"><button type="button" class="btn" id="submitL4">Submit</button></div>`}`;
      },
      wire: (el) => {
        wireAnswerBoxes(el);
        wireFinish(el, 4);
        const btn = el.querySelector("#submitL4");
        if (btn) btn.addEventListener("click", () => {
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
  type: "tf", answerKey: `s5.q3.${it.id}`, attemptKey: `s5q3.${it.id}`, answerLabel: it.correct ? "True" : "False"
}));

const L5_Q4 = [{
  id: "q4", type: "mcq", answerKey: "s5.q4", attemptKey: "s5q4", correct: "B", answerLabel: "B",
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
  "I can describe the four stages of providing customer service",
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
            <h3 class="q-title" id="l5q3"><span class="q-num">Q3.</span> True or false? Tap True or False for each.</h3>
            <ol class="tf-list">
              ${L5_Q3.map(it => `
                <li class="tf-item" data-key="${it.answerKey}">
                  <p class="tf-text"><span class="tf-num">${it.id}.</span> ${escapeHtml(it.text)}</p>
                  ${itemControlHtml(it)}
                  ${itemFeedbackHtml(it)}
                </li>`).join("")}
            </ol>
            ${checkAgainHtml(L5_Q3, "checkAgainQ3")}
          </section>
          <section class="question card" data-q="q4" aria-labelledby="l5q4">
            <h3 class="q-title" id="l5q4"><span class="q-num">Q4.</span> A customer at a mobile phone shop says, "This is the third time I've called about the same faulty charger, and nobody has fixed it!" Which response best shows good service recovery? Tap one.</h3>
            <div class="mcq-item" data-key="s5.q4">
              ${itemControlHtml(L5_Q4[0])}
              ${itemFeedbackHtml(L5_Q4[0])}
            </div>
            ${checkAgainHtml(L5_Q4, "checkAgainQ4")}
          </section>
          <section class="question card" data-q="q5" aria-labelledby="l5q5">
            <h3 class="q-title" id="l5q5"><span class="q-num">Q5.</span> Explain why quality customer service matters to a business. Give ONE reason.</h3>
            ${answerBoxHtml("s5.q5", { label: "Quality customer service matters because", readOnly: submitted || ctx.readOnly, rows: 3 })}
            ${submitted ? checkNoteHtml("Check your answer: did you name one reason (customers return repeatedly, customers recommend the business to their relatives and friends, or customer loyalty ensures the continuity of the business) and explain what it means for the business?") : ""}
          </section>
          ${!submitted ? `<div class="btn-row"><button type="button" class="btn" id="submitL5">Submit</button></div>` : ""}`;
      },
      wire: (el) => {
        wireAnswerBoxes(el);
        wireItems(el, L5_MARKED, () => redrawInPlace(5, 0));
        const submit = el.querySelector("#submitL5");
        if (submit) submit.addEventListener("click", () => {
          const missing = [];
          L5_Q3.forEach(it => { if (getAnswer(it.answerKey) === undefined) missing.push({ el: el.querySelector(`[data-key="${it.answerKey}"]`), name: `Q3 ${it.id}` }); });
          if (getAnswer("s5.q4") === undefined) missing.push({ el: el.querySelector('[data-key="s5.q4"]'), name: "Q4" });
          if (isBlank("s5.q5")) missing.push({ el: el.querySelector('[data-key="s5.q5"]'), name: "Q5" });
          if (missing.length) { showNotFinished(missing); return; }
          recordAttempts(L5_MARKED, "first");
          rec.submitted["s5.check"] = nowIso();
          queueSave("now");
          redrawInPlace(5, 0);
          revealFocus(document.querySelector('[data-q="q3"] .feedback'));
        });
        [["#checkAgainQ3", L5_Q3], ["#checkAgainQ4", L5_Q4]].forEach(([sel, items]) => {
          const b = el.querySelector(sel);
          if (b) b.addEventListener("click", () => {
            recordAttempts(items, "second");
            queueSave("now");
            redrawInPlace(5, 0);
          });
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
            ${answerBoxHtml("s5.q6", { labelHtml: `<span class="q-num">Q6.</span> What is one thing you have learnt about customer service?`, hint: "One thing I learnt is...", readOnly: ro, rows: 3 })}
          </section>
          <section class="question card" data-q="q7" aria-labelledby="l5q7">
            ${answerBoxHtml("s5.q7", { labelHtml: `<span class="q-num">Q7.</span> What is one question you still have about this chapter?`, hint: "I am still not sure about...", readOnly: ro, rows: 3 })}
          </section>
          <section class="question card" data-q="q8" aria-labelledby="l5q8">
            <h3 class="q-title" id="l5q8"><span class="q-num">Q8.</span> How confident are you that you can do each of these? Tap one face for each.</h3>
            ${CONFIDENCE_ROWS.map((row, r) => {
              const key = `s5.q8.${r + 1}`;
              const v = getAnswer(key);
              return `
              <div class="face-row" data-key="${key}">
                <p class="face-statement">${escapeHtml(row)}</p>
                <div class="face-options" role="group" aria-label="${escapeHtml(row)}">
                  ${FACES.map(([face, label], i) => `<button type="button" class="face-btn ${v === i ? "picked" : ""}" data-key="${key}" data-value="${i}" aria-pressed="${v === i}" ${ro ? "disabled" : ""}>
                    <span class="face-emoji" aria-hidden="true">${face}</span><span class="face-label">${label}</span></button>`).join("")}
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
          if (isBlank("s5.q6")) missing.push({ el: el.querySelector('[data-key="s5.q6"]'), name: "Q6" });
          if (isBlank("s5.q7")) missing.push({ el: el.querySelector('[data-key="s5.q7"]'), name: "Q7" });
          CONFIDENCE_ROWS.forEach((row, r) => { const key = `s5.q8.${r + 1}`; if (getAnswer(key) === undefined) missing.push({ el: el.querySelector(`.face-row[data-key="${key}"]`), name: `Q8 (row ${r + 1})` }); });
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
  showModal({
    id: "badgeModal",
    className: "badge-modal",
    title: "🎉 You've finished Chapter 6!",
    bodyHtml: `<div class="badge-pop-img">${imgHtml("BADGE5", "badge-img")}</div>
      <p class="badge-pop-text">🏆 Chapter 6 Champion</p>`,
    buttons: [
      { label: "📊 See my learning report", primary: true, onClick: () => { window.location.hash = "#report"; } },
      { label: "Back to my route", onClick: () => { window.location.hash = "#home"; } }
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
