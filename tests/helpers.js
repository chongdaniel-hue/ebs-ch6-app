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

async function shot(page, testInfo, name) {
  await page.screenshot({ path: `tests/screenshots/${name}-${testInfo.project.name}.png`, fullPage: true });
}

module.exports = { watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot };
