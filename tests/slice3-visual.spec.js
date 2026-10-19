// Slice 3 visual and Mayer pass: equal cards, images in full, the 🔊 Listen button.
const { test, expect } = require("@playwright/test");
const { watchErrors, resetServer, login } = require("./helpers");

// A stand-in for the browser's speech, so the test can see what would be read aloud.
const FAKE_SPEECH = () => {
  window.__spoken = [];
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
    speak(u) { window.__spoken.push(u.text); window.__lastUtterance = u; },
    cancel() { window.__cancelled = (window.__cancelled || 0) + 1; },
    getVoices() { return [{ lang: "en-GB", localService: true, name: "Test GB" }]; }
  } });
};

async function student(page, request, reg) {
  await resetServer(request, ["3E1"]);
  await login(page, "3E1", reg);
  await page.click("#briefing button");
  await expect(page.locator(".welcome-card")).toBeVisible();
  // Open every level and part on this device so all notes can be checked.
  await page.evaluate(() => {
    localStorage.setItem("ch6_unlock_all", "true");
    rec.reached["s2.tabs"] = 2; ["s2.t0", "s2.t1", "s2.t2"].forEach(k => { rec.reached[k] = 3; }); rec.reached["s2.path"] = 8;
    saveLocal();
  });
}

test("Level 1: the three question cards line up and the boxes are the same size", async ({ page, request }, testInfo) => {
  await student(page, request, 31);
  await page.goto("/#level1");
  await page.reload();
  const boxes = await page.locator(".story-card textarea").evaluateAll(els => els.map(e => e.getBoundingClientRect()).map(r => ({ top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) })));
  const cards = await page.locator(".story-card").evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().height)));
  await expect(page.locator(".answer-icon")).toHaveText(["😊", "😞", "🤔"]);
  expect(new Set(boxes.map(b => b.w)).size).toBe(1);
  expect(new Set(boxes.map(b => b.h)).size).toBe(1);
  if (testInfo.project.name === "laptop") {
    expect(new Set(boxes.map(b => b.top)).size, "text boxes start at the same height").toBe(1);
    expect(new Set(cards).size, "cards are the same height").toBe(1);
  } else {
    expect(new Set(boxes.map(b => b.left)).size, "stacked on phones").toBe(1);
  }
});

test("images are shown in full and the Foodpanda pair is the same height", async ({ page, request }, testInfo) => {
  await student(page, request, 32);
  for (const t of [0, 1, 2]) {
    await page.goto("/#home");
    await page.goto("/#level2");
    await page.locator(".step-tab").nth(t).click();
    await page.waitForTimeout(300);
    const cropped = await page.locator("img.content-img").evaluateAll(imgs => imgs.filter(i => i.naturalWidth).map(i => {
      const r = i.getBoundingClientRect();
      return { id: i.dataset.img, off: Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) };
    }).filter(x => x.off > 0.02));
    expect(cropped, "no image squashed or cut").toEqual([]);
  }
  const heights = await page.locator(".img-pair img").evaluateAll(imgs => imgs.map(i => Math.round(i.getBoundingClientRect().height)));
  expect(heights.length).toBe(2);
  if (testInfo.project.name === "laptop") expect(Math.abs(heights[0] - heights[1])).toBeLessThanOrEqual(2);
});

test("🔊 Listen reads a block of notes, not the questions, and stops on a second tap", async ({ page, request }) => {
  await page.addInitScript(FAKE_SPEECH);
  const errors = watchErrors(page);
  await student(page, request, 33);

  await page.goto("/#terms");
  const termsBtn = page.locator(".terms-block .listen-btn");
  await expect(termsBtn).toHaveText("🔊 Listen");
  await termsBtn.click();
  await expect(termsBtn).toHaveText("⏹ Stop");
  await expect(termsBtn).toHaveAttribute("aria-pressed", "true");
  const spoken = (await page.evaluate(() => window.__spoken)).join(" ");
  expect(spoken).toContain("Customer service: Customer service refers to what businesses do for their customers so that they are happy and satisfied.");
  expect(spoken).not.toContain("Listen");
  expect(await page.evaluate(() => window.__lastUtterance.rate)).toBe(0.9);
  expect(await page.evaluate(() => window.__lastUtterance.lang)).toBe("en-GB");
  await termsBtn.click();
  await expect(termsBtn).toHaveText("🔊 Listen");
  await expect(termsBtn).toHaveAttribute("aria-pressed", "false");

  // Level 2: one Listen per block of notes; the optional question box is not read.
  await page.goto("/#level2");
  await page.locator(".step-tab").nth(2).click();
  await expect(page.locator(".part .listen-btn")).toHaveCount(3);
  await page.evaluate(() => { window.__spoken = []; });
  await page.locator("#part1 .listen-btn").click();
  const part1 = (await page.evaluate(() => window.__spoken)).join(" ");
  expect(part1).toContain("A customer complained to a food delivery app");
  expect(part1).not.toContain("Was this good service recovery");
  await page.locator("#part1 .listen-btn").click();

  // Level 1 is questions only: no Listen button.
  await page.goto("/#level1");
  await expect(page.locator(".listen-btn")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("no Listen button where the browser has no speech", async ({ page, request }) => {
  await page.addInitScript(() => { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; });
  await student(page, request, 34);
  await page.goto("/#terms");
  await expect(page.locator(".def-body").first()).toBeVisible();
  await expect(page.locator(".listen-btn")).toHaveCount(0);
});
