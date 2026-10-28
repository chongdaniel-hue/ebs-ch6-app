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
  const banner = page.locator('img[data-img="WELCOME"]');
  await expect(banner).toBeVisible();
  await expect.poll(() => banner.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  await expect(banner).toHaveAttribute("alt", "Welcome to your journey on Customer Service! The Nexora staff member and customer welcome you to the activity.");
  await expect(page.locator(".credits")).toContainText("A team effort by Anthony, Daniel, Joshua and Jufinnie (NIE 2026)");
  await expect(page.locator(".credits")).toContainText("Version 0.11.1");
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

test("image map: all artwork loads, failed requests show accessible placeholders", async ({ page }, testInfo) => {
  // A missing image makes the browser log a 404; that is expected here, so only page errors count.
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(String(e)));
  await page.goto("/");
  const ids = await page.evaluate(() => Object.keys(window.APP_CONFIG.IMAGES));
  expect(ids).toEqual(["WELCOME", "SUITABILITY", "PK_FEATURES", "PK_PRICE", "PK_CARE", "PK_WARRANTY", "PK_SELLING_POINT", "ICON_TERMS", "ICON_LEARN", "TERM_SERVICE", "TERM_QUALITY", "TERM_BREAKDOWN", "TERM_RECOVERY", "N01", "N03", "N04", "N05", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "R01", "R02", "R03", "BADGE1", "BADGE2", "BADGE3", "BADGE4", "BADGE_L3", "BADGE6", "BADGE5"]);
  // Draw every image into the page, as the levels will.
  await page.evaluate(ids => {
    document.querySelector(".page").innerHTML = ids.map(id => `<div class="block test-img" data-id="${id}"><p><strong>${id}</strong></p>${imgHtml(id)}</div>`).join("");
  }, ids);
  await page.waitForTimeout(800);
  // Every badge now has installed artwork, including Service Saver.
  for (const id of ids) {
    const box = page.locator(`.test-img[data-id="${id}"]`);
    const img = box.locator("img");
    await expect(img, `${id} should load`).toBeVisible();
    await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    expect((await img.getAttribute("alt")).length).toBeGreaterThan(10);
  }
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  await shot(page, testInfo, "slice1-images");
  // The fallback still works if an installed illustration becomes unavailable.
  await page.route("**/assets/img/welcome-customer-service-banner.jpg", route => route.fulfill({ status: 404, body: "Not found" }));
  await page.reload();
  const fallback = page.locator('.img-placeholder[data-img="WELCOME"]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute("role", "img");
  await expect(fallback).toHaveAttribute("aria-label", "Welcome to your journey on Customer Service! The Nexora staff member and customer welcome you to the activity.");
  expect(pageErrors).toEqual([]);
});

test("server only serves the app files", async ({ request }) => {
  for (const p of ["/", "/index.html", "/app.js", "/styles.css", "/config.js", "/assets/img/C01-good-vs-poor-service-v2.jpg"]) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
  for (const p of ["/docs/storyboard.md", "/CLAUDE.md", "/package.json", "/server/server.js", "/.gitignore", "/tests/helpers.js", "/BUILD-PROMPT.md", "/../CLAUDE.md", "/assets/../CLAUDE.md"]) {
    expect((await request.get(p)).status(), p).toBe(404);
  }
});

test("config.js is live for students, but the local server keeps tests local", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "laptop", "run once");
  const onDisk = require("fs").readFileSync(require("path").join(__dirname, "..", "config.js"), "utf8");
  expect(onDisk).toMatch(/SERVER:\s*"live"/);
  expect(onDisk).toMatch(/LIVE_URL:\s*"https:\/\/script\.google\.com\/macros\/s\/[^"]+\/exec"/);
  const served = await (await request.get("/config.js")).text();
  expect(served).toMatch(/SERVER:\s*"local"/);
  const sentTo = [];
  page.on("request", r => sentTo.push(r.url()));
  await page.goto("/");
  await page.waitForTimeout(500);
  expect(sentTo.filter(u => /script\.google\.com/.test(u))).toEqual([]);
  expect(sentTo.some(u => /localhost:8788\/api\?action=classes/.test(u))).toBe(true);
});
