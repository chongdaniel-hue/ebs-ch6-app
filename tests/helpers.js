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

async function apiPost(request, body) {
  return (await request.post("/api", { data: JSON.stringify(body), headers: { "Content-Type": "text/plain" } })).json();
}
async function apiGet(request, params) {
  return (await request.get("/api?" + new URLSearchParams(params))).json();
}

async function login(page, cls, reg) {
  await page.goto("/");
  await page.locator("#classInput").selectOption(cls);
  await page.locator("#regInput").fill(String(reg));
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
