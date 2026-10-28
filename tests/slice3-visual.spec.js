// Slice 3 visual and Mayer pass: equal cards, images in full, the 🔊 Read aloud button.
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
    for(const key of REFLECTION_KEYS){setAnswer(key,"A complete reflection.");setUi(`${key}.saved`,rec.answers[key].t);}
    rec.reached["s2.path"] = 8; setUi("s2.cardLayout", "cards15");
    saveLocal();
  });
}

test("Level 1: the three question cards line up and the boxes are the same size", async ({ page, request }, testInfo) => {
  await student(page, request, 31);
  await page.goto("/#level1");
  await page.reload();
  const boxes = await page.locator(".story-card textarea").evaluateAll(els => els.map(e => e.getBoundingClientRect()).map(r => ({ top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) })));
  const cards = await page.locator(".story-card").evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().height)));
  expect(await page.locator(".answer-icon svg").evaluateAll(icons => icons.map(icon => icon.dataset.icon))).toEqual(["happy", "sad", "think"]);
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
  await page.goto("/#level2");
  for (let c = 0; c < 18; c++) {
    await page.evaluate(c => { setUi("s2.card", c); renderLevel(2); }, c);
    await page.waitForTimeout(300);
    const cropped = await page.locator("img.content-img").evaluateAll(imgs => imgs.filter(i => i.naturalWidth).map(i => {
      const r = i.getBoundingClientRect();
      return { id: i.dataset.img, off: Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) };
    }).filter(x => x.off > 0.02));
    expect(cropped, "no image squashed or cut").toEqual([]);
  }
  await page.evaluate(() => { setUi("s2.card", 16); renderLevel(2); });
  await page.waitForTimeout(300);
  const heights = await page.locator(".img-pair img").evaluateAll(imgs => imgs.map(i => Math.round(i.getBoundingClientRect().height)));
  expect(heights.length).toBe(2);
  if (testInfo.project.name === "laptop") expect(Math.abs(heights[0] - heights[1])).toBeLessThanOrEqual(2);
});

// Every item in a block starts at the column's left edge and ends at its right edge, except
// running text (limited to a readable width) and images (centred, never larger than the file).
async function edgeProblems(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".page .block").forEach(block => {
      const b = block.getBoundingClientRect();
      const style = getComputedStyle(block);
      const left = b.left + parseFloat(style.paddingLeft), right = b.right - parseFloat(style.paddingRight);
      [...block.children].filter(k => k.offsetParent !== null && !k.classList.contains("visually-hidden")).forEach(k => {
        const r = k.getBoundingClientRect();
        const name = (k.className || k.tagName).toString().slice(0, 40);
        const isText = (/^(P|UL|OL)$/.test(k.tagName) && !/when-box|tip|say/.test(k.className)) || k.tagName === "BUTTON" || /\bbtn\b/.test(k.className);
        const isImg = k.tagName === "IMG" || k.classList.contains("img-pair");
        if (isImg) {
          if (Math.abs((r.left - left) - (right - r.right)) > 2) out.push(`${name}: not centred`);
          return;
        }
        if (Math.abs(r.left - left) > 1) out.push(`${name}: left edge ${Math.round(r.left - left)}px off`);
        if (!isText && Math.abs(r.right - right) > 1) out.push(`${name}: right edge ${Math.round(right - r.right)}px short`);
      });
    });
    return out;
  });
}

test("blocks line up: same left and right edges on every page", async ({ page, request }) => {
  await student(page, request, 35);
  const pages = [["home", "/#home"], ["terms", "/#terms"], ["level1", "/#level1"], ["report", "/#report"]];
  for (const [name, url] of pages) {
    await page.goto(url);
    await page.waitForTimeout(300);
    expect(await edgeProblems(page), name).toEqual([]);
  }
  await page.goto("/#level2");
  for (let c = 0; c < 18; c++) {
    await page.evaluate(c => { setUi("s2.card", c); renderLevel(2); }, c);
    await page.waitForTimeout(300);
    expect(await edgeProblems(page), `level2 card ${c + 1}`).toEqual([]);
  }
  for (const n of [3, 4, 5]) {
    for (const t of [0, 1]) {
      await page.goto("/#home");
      await page.goto(`/#level${n}`);
      await page.locator(".step-tab").nth(t).click();
      await page.waitForTimeout(300);
      expect(await edgeProblems(page), `level${n} tab ${t + 1}`).toEqual([]);
    }
  }
});

test("Read aloud reads a block of notes, not the questions, and stops on a second tap", async ({ page, request }) => {
  await page.addInitScript(FAKE_SPEECH);
  const errors = watchErrors(page);
  await student(page, request, 33);

  await page.goto("/#terms");
  const termsBtn = page.locator(".head-row .listen-btn");
  await expect(termsBtn).toHaveText("Read aloud");
  await termsBtn.click();
  await expect(termsBtn).toHaveText("Stop");
  await expect(termsBtn).toHaveAttribute("aria-pressed", "true");
  const spoken = (await page.evaluate(() => window.__spoken)).join(" ");
  expect(spoken).toContain("Customer service What businesses do for their customers so that they are happy and satisfied.");
  expect(spoken).toContain("Example: Staff help you find the size of clothing you were looking for.");
  expect(spoken).not.toContain("Read aloud"); // the button itself is never read out
  expect(await page.evaluate(() => window.__lastUtterance.rate)).toBe(0.9);
  expect(await page.evaluate(() => window.__lastUtterance.lang)).toBe("en-GB");
  await termsBtn.click();
  await expect(termsBtn).toHaveText("Read aloud");
  await expect(termsBtn).toHaveAttribute("aria-pressed", "false");

  // Level 2: one Read aloud button per card of notes; the question box is not read.
  await page.goto("/#level2");
  const readCard = async (c) => {
    await page.evaluate(c => { setUi("s2.card", c); renderLevel(2); window.__spoken = []; }, c);
    await expect(page.locator("#lessonCard .listen-btn")).toHaveCount(1);
    await page.locator("#lessonCard .listen-btn").click();
    const text = (await page.evaluate(() => window.__spoken)).join(" ");
    await page.locator("#lessonCard .listen-btn").click();
    return text;
  };
  const poor = await readCard(16);
  expect(poor).toContain("A customer complained to a food delivery app");
  expect(poor).not.toContain("Was this good service recovery");
  // Cards: the words read aloud are the words shown, name and description kept apart.
  expect(await readCard(2)).toMatch(/Customers will have a positive experience and they will choose to return repeatedly ?;/);
  expect(await readCard(3)).toContain("Approachable Friendly and easy to talk to, so customers feel comfortable asking for help");
  // Good product knowledge: the staff member's lines are page text, so they are read too.
  expect(await readCard(4)).toContain("The Nexora Core is $799.");
  expect(await readCard(4)).toContain("The Nexora Spark has a large screen for reading and an all-day battery.");
  // The quick check is a question: no Read aloud.
  await page.evaluate(() => { setUi("s2.card", 8); renderLevel(2); });
  await expect(page.locator("#lessonCard .listen-btn")).toHaveCount(0);

  // Level 1 is questions only: no Read aloud button.
  await page.goto("/#level1");
  await expect(page.locator(".listen-btn")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("no Read aloud button where the browser has no speech", async ({ page, request }) => {
  await page.addInitScript(() => { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; });
  await student(page, request, 34);
  await page.goto("/#terms");
  await expect(page.locator(".def-body").first()).toBeVisible();
  await expect(page.locator(".listen-btn")).toHaveCount(0);
});
