// Shared checks used by every slice's tests.
const { expect } = require("@playwright/test");

// Collects console errors and page errors so each test can assert there were none.
function watchErrors(page) {
  const errors = [];
  page.on("console", m => {
    if (m.type() !== "error") return;
    // A picture not yet added to assets/img/ is expected to 404: the app shows its placeholder box.
    const url = (m.location() && m.location().url) || "";
    if (/404/.test(m.text()) && /\/assets\/img\//.test(url)) return;
    // Messages YouTube's own embedded player logs now and then (not the app's code).
    if (/^https:\/\/www\.youtube-nocookie\.com\//.test(url)) return;
    errors.push(`${m.text()} ${url}`);
  });
  page.on("pageerror", e => errors.push(String(e)));
  return errors;
}

// No ampersand anywhere a student could see or hear it: page text, alt text, aria labels, titles.
async function expectNoAmpersand(page) {
  const found = await page.evaluate(() => {
    const out = [];
    if (document.body.innerText.includes("&")) out.push("page text");
    document.querySelectorAll("[alt],[aria-label],[title],[placeholder]").forEach(el => {
      ["alt", "aria-label", "title", "placeholder"].forEach(a => {
        const v = el.getAttribute(a);
        if (v && v.includes("&")) out.push(`${a}: ${v.slice(0, 60)}`);
      });
    });
    if (document.title.includes("&")) out.push("document title");
    return out;
  });
  expect(found, "ampersand on a student screen").toEqual([]);
}

// Nothing sticks out sideways.
async function expectNoSidewaysScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page wider than the screen").toBeLessThanOrEqual(0);
}

// Full-page screenshot as a student would see it: from the top (so sticky bars sit at the
// top), with any slide-in finished.
async function shot(page, testInfo, name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `tests/screenshots/${name}-${testInfo.project.name}.png`, fullPage: true, animations: "disabled" });
}

module.exports = { watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot };

const CODE = () => process.env.TEST_TEACHER_CODE;

// Fresh server data, with the given classes added through the real teacher action.
async function resetServer(request, classes) {
  await request.post("/__test/reset");
  for (const name of classes || []) {
    const r = await (await request.post("/api", { data: JSON.stringify({ action: "addClass", code: CODE(), name }), headers: { "Content-Type": "text/plain" } })).json();
    if (!r.ok) throw new Error("addClass failed: " + r.error);
  }
}

// Test fixtures supply the same identity as the registration form. Security tests use raw requests.
async function apiPost(request, body) {
  if (body.action === "save" && body.record) {
    body = structuredClone(body);
    body.record.profile ||= {name:{v:"Test Student " + body.record.reg,t:new Date().toISOString()}};
    body.name ??= body.record.profile.name.v;
  }
  return (await request.post("/api", { data: JSON.stringify(body), headers: { "Content-Type": "text/plain" } })).json();
}
async function apiGet(request, params) {
  if (params.action === "load" && params.name === undefined) {
    const rows = await apiPost(request,{action:"results",code:CODE(),class:params.class});
    const row = (rows.students || []).find(s => Number(s.reg) === Number(params.reg));
    params = {...params,name:row?.record?.profile?.name?.v || "Test Student " + params.reg};
  }
  return (await request.get("/api?" + new URLSearchParams(params))).json();
}

async function login(page, cls, reg) {
  await apiPost(page.request, {action:"setClassVisibility",code:CODE(),name:cls,visible:true});
  await page.goto("/");
  await expect(page.locator("#classInput")).toHaveValue(cls);
  await page.locator("#regInput").selectOption(String(reg));
  await page.locator("#nameInput").fill("Test Student " + reg);
  await page.locator("#startBtn").click();
}

// Waits until this page has sent a save that the server accepted.
async function waitForSave(page, timeout) {
  await page.waitForResponse(async r => {
    if (!r.url().endsWith("/api") || r.request().method() !== "POST") return false;
    try { const body = JSON.parse(r.request().postData()); return body.action === "save" && (await r.json()).ok; } catch (e) { return false; }
  }, { timeout: timeout || 25000 });
}

module.exports.CODE = CODE;
module.exports.resetServer = resetServer;
module.exports.apiPost = apiPost;
module.exports.apiGet = apiGet;
module.exports.login = login;
module.exports.waitForSave = waitForSave;

// Opens a notes card by its position in the 19-card notes of 0.10.0 (0 to 18): cards 0 to 12
// are Level 2, cards 13 to 18 are Level 3 (stored as 7). Level 3 has the video on its own card
// (card 5), so the 19-card cards 17 and 18 are Level 3 cards 6 and 7.
function notesPlace(c) { return c < 13 ? [2, c] : [7, c - 13 + (c >= 17 ? 1 : 0)]; }
async function notesCard(page, c) {
  await page.evaluate(([n, i]) => { setUi(`s${n}.card`, i); renderLevel(n); }, notesPlace(c));
}
// The progress line of a notes card by its 19-card position, e.g. "4 of 7".
function notesCount(c) { const [n, i] = notesPlace(c); return `${i + 1} of ${n === 2 ? 13 : 7}`; }
module.exports.notesCard = notesCard;
module.exports.notesCount = notesCount;

// Opens card c (0 to 19) of the notes as they are now: Level 2 cards 0 to 12, then Level 3.
async function openNotesCard(page, c) {
  await page.evaluate(c => { const n = c < 13 ? 2 : 7; setUi(`s${n}.card`, c < 13 ? c : c - 13); renderLevel(n); }, c);
}
module.exports.openNotesCard = openNotesCard;
