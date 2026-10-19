// Slice 1: clean-up and shell.
const { test, expect } = require("@playwright/test");
const { watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot } = require("./helpers");

test("landing page shell", async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.locator(".topbar")).toContainText("EBS Chapter 6");
  await expect(page.locator("h1.topbar-title")).toHaveText("Customer Service");
  await expect(page.locator(".topbar-sub")).toHaveText("A self-study revision module");
  await expect(page.locator(".lead")).toHaveText("Hi! In this module, you'll revise Chapter 6: Customer Service. You'll read short notes, chat with an AI customer service officer, serve an AI customer yourself, and check what you've learnt.");
  // N01 does not exist yet, so its placeholder box shows.
  const ph = page.locator('.img-placeholder[data-img="N01"]');
  await expect(ph).toBeVisible();
  await expect(ph).toContainText("🏬");
  await expect(ph).toHaveAttribute("role", "img");
  await expect(page.locator(".credits")).toContainText("A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026)");
  await expect(page.locator(".credits")).toContainText("Version 0.2");
  await expect(page.locator(".credits a.teacher-link")).toHaveText("Teacher Mode");
  // Zoom allowed.
  const vp = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(vp).not.toMatch(/maximum-scale|user-scalable/);
  // Top bar stays on screen when scrolling.
  expect(await page.locator(".topbar").evaluate(el => getComputedStyle(el).position)).toBe("sticky");
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  await shot(page, testInfo, "slice1-landing");
  expect(errors).toEqual([]);
});

test("teacher mode screen", async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await page.click("a.teacher-link");
  await expect(page.locator("h1.page-title")).toHaveText("Teacher Mode");
  await expect(page.locator("label[for=teacherCode]")).toHaveText("Key in the teacher code.");
  await expect(page.locator("#teacherEnter")).toHaveText("Enter");
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  await shot(page, testInfo, "slice1-teacher");
  await page.click("#homeBtn");
  await expect(page.locator(".lead")).toBeVisible();
  expect(errors).toEqual([]);
});

test("image map: existing files load, missing files show placeholders", async ({ page }, testInfo) => {
  // A missing image makes the browser log a 404; that is expected here, so only page errors count.
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(String(e)));
  await page.goto("/");
  const ids = await page.evaluate(() => Object.keys(window.APP_CONFIG.IMAGES));
  expect(ids).toEqual(["N01", "N02", "N03", "N04", "N05", "C01", "C02", "C03", "C04", "R01", "R02", "R03", "BADGE1", "BADGE2", "BADGE3", "BADGE4", "BADGE5"]);
  // Draw every image into the page, as the stations will.
  await page.evaluate(ids => {
    document.querySelector(".page").innerHTML = ids.map(id => `<div class="block test-img" data-id="${id}"><p><strong>${id}</strong></p>${imgHtml(id)}</div>`).join("");
  }, ids);
  await page.waitForTimeout(800);
  for (const id of ids) {
    const box = page.locator(`.test-img[data-id="${id}"]`);
    if (/^[CR]\d/.test(id)) {
      const img = box.locator("img");
      await expect(img, `${id} should load`).toBeVisible();
      expect(await img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      expect((await img.getAttribute("alt")).length).toBeGreaterThan(10);
    } else {
      await expect(box.locator(".img-placeholder"), `${id} should show a placeholder`).toBeVisible();
    }
  }
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  await shot(page, testInfo, "slice1-images");
  expect(pageErrors).toEqual([]);
});

test("server only serves the app files", async ({ request }) => {
  for (const p of ["/", "/index.html", "/app.js", "/styles.css", "/config.js", "/assets/img/C01-good-vs-poor-service.jpg"]) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
  for (const p of ["/docs/storyboard.md", "/CLAUDE.md", "/package.json", "/server/server.js", "/.gitignore", "/tests/helpers.js", "/BUILD-PROMPT.md", "/../CLAUDE.md", "/assets/../CLAUDE.md"]) {
    expect((await request.get(p)).status(), p).toBe(404);
  }
});
