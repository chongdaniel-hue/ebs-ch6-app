/* ============================================================
   EBS Chapter 6: Customer Service — self-study revision app
   Forked from the EBS Learning Journey app (V45): one-page
   vanilla JavaScript app with a hash router and render().

   Source of truth for every screen and every word students see:
   docs/storyboard.md. House rules: CLAUDE.md.
   Settings (server, chatbot links, images): config.js.

   Version history
   0.1  Slice 1: shell only. All Learning Journey content and
        the old hosting removed. Blue theme, sticky top bar,
        credits footer, image map with placeholder boxes, zoom
        allowed.
   ============================================================ */

const APP_VERSION = "0.1";
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

/* ---------------- Images ----------------
   Every image is listed in config.js (IMAGES). If its file is missing or fails
   to load, a placeholder box takes its place: a rounded light-blue box with a
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

/* ---------------- Page frame: top bar and footer ---------------- */

const app = document.getElementById("app");

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

/* ---------------- Router ---------------- */

function render() {
  const hash = window.location.hash;
  if (hash === "#teacher") { renderTeacherGate(); window.scrollTo(0, 0); return; }
  renderLanding();
}
window.addEventListener("hashchange", render);

/* ---------------- 0.1 Landing page ----------------
   Slice 1: the frame only. The log-in card comes in slice 2. */

function renderLanding() {
  app.innerHTML = `
    ${topBarHtml({ titleIsHeading: true, showSubtitle: true })}
    <main class="page">
      <div class="block landing-banner">${imgHtml("N01", "banner-img")}</div>
      <div class="block">
        <p class="lead">Hi! In this module, you'll revise Chapter 6: Customer Service. You'll read short notes, chat with an AI customer service officer, serve an AI customer yourself, and check what you've learnt.</p>
      </div>
    </main>
    ${footerHtml()}
  `;
}

/* ---------------- T.1 Teacher Mode: sign in ----------------
   Slice 1: the screen only. Checking the code on the server comes in slice 2. */

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
        </div>
      </div>
    </main>
    ${footerHtml()}
  `;
}

render();
