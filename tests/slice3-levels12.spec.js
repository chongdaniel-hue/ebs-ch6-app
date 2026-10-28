// Slice 3: Levels 1 and 2, with locks, the Level 2 cards, the Service Recovery Path
// and Badges 1 and 2.
const { test, expect } = require("@playwright/test");
const {
  watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot,
  resetServer, apiGet, login, waitForSave
} = require("./helpers");

async function checkPage(page, testInfo, name) {
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  if (name) await shot(page, testInfo, name);
}

async function newStudent(page, request, reg) {
  await resetServer(request, ["3E1"]);
  await login(page, "3E1", reg);
  await page.click("#briefing button");
  await expect(page.locator(".journey-count")).toBeVisible();
}

async function finishLevel1(page) {
  await page.goto("/#level1");
  for (const [i, text] of ["Staff smiled and helped me.", "The staff brought me the wrong order.", "Good when staff care."].entries()) {
    await page.fill(`textarea[data-answer="s1.q${i + 1}"]`, text);
  }
  await page.click("#submitL1");
  await page.click("#finishBtn");
  await page.locator("#badgeModal button").click();
}

// The path shows each step in textbook wording, with no short label and no "Step N:".
const PATH_LABELS = [
  "Listen carefully to the complaint. Give customers full attention.",
  "Be patient. Do not interrupt customers when they are describing their unhappiness.",
  "Apologise to the customers for the inconvenience caused.",
  "Acknowledge their feelings and assure them of help to solve the problem.",
  "Ask questions if more information is needed.",
  "Offer solutions.",
  "Refer customers to more senior staff if unable to provide them with an acceptable solution.",
  "Thank customers for bringing the problem to our attention."
];

test.describe("Level 1", () => {
  test("stories, Not finished yet, recap, badge, Level 2 unlocks", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await newStudent(page, request, 21);
    await page.click("#levelCard1");
    await expect(page.locator("h1.page-title")).toHaveText("Level 1: Your Customer Service Stories");
    await expect(page.locator(".step-tabs")).toHaveCount(0); // one step only
    const part = page.locator("#part0");
    await expect(part.locator("p").first()).toHaveText("There are no right or wrong answers.");
    await expect(part.locator(".tip")).toHaveText("Tip: Don't name real people. Your teacher will read your answers.");
    await expect(part.locator(".field-label")).toHaveText([
      "1. Think of a time you got GOOD customer service (e.g. at a bubble tea shop, a hawker stall, or when ordering on GrabFood). What did the staff do?",
      "2. Think of a time you got BAD customer service. What happened?",
      "3. Look at your two stories. What do you think makes customer service good or bad?"
    ]);
    const boxes = part.locator("textarea");
    for (const [i, hint] of ["The staff member...", "What happened was...", "I think customer service is good when... and bad when..."].entries()) {
      await expect(boxes.nth(i)).toHaveAttribute("placeholder", hint);
      await expect(boxes.nth(i)).toHaveValue(""); // nothing pre-filled
    }
    await expect(part.locator("p", { hasText: "Type at least one sentence" })).toHaveText("Type at least one sentence (at least 20 characters) in each box, then tap Submit.");
    await checkPage(page, testInfo, "slice3-level1");

    // Box 2 empty: Not finished yet, listed by name, with Go back and Submit anyway.
    await boxes.nth(0).fill("Staff smiled and helped me.");
    await boxes.nth(2).fill("Good when staff care.");
    await page.click("#submitL1");
    const modal = page.locator("#notFinished");
    await expect(modal.locator("h2")).toHaveText("Not finished yet");
    await expect(modal.locator(".missing-list li")).toHaveText(["✗ Box 2: Write at least 20 characters"]);
    await expect(modal.locator("button")).toHaveText(["Go back"]);
    await expect(page.locator('[data-key="s1.q2"]')).toHaveClass(/incomplete/);
    await checkPage(page, testInfo, "slice3-level1-not-finished");
    await modal.locator("button", { hasText: "Go back" }).click();
    await boxes.nth(1).fill("The staff brought me the wrong order.");
    await expect(page.locator('[data-key="s1.q2"]')).not.toHaveClass(/incomplete/);

    // Typing is saved on the device straight away; reload keeps it.
    await page.reload();
    await expect(page.locator('textarea[data-answer="s1.q2"]')).toHaveValue("The staff brought me the wrong order.");

    await page.click("#submitL1");
    await expect(page.locator(".recap-card .recap-title")).toHaveText("Remember this");
    await expect(page.locator(".recap-card p")).toHaveText("Keep your stories in mind. In Level 2, see whether your ideas match what businesses call quality customer service.");
    await expect(page.locator("#part0 textarea").first()).toHaveAttribute("readonly", "");
    await expect(page.locator("#finishBtn")).toHaveText("Finish Level 1");
    await checkPage(page, testInfo, "slice3-level1-recap");
    const saved = waitForSave(page);
    await page.click("#finishBtn");
    await saved; // Finish saves to the server at once
    const badge = page.locator("#badgeModal");
    await expect(badge.locator("h2")).toHaveText("Story Sharer");
    await expect(badge.locator(".badge-pop-text")).toHaveText("You earned the Story Sharer badge!");
    await expect(badge.locator('img[data-img="BADGE1"]')).toBeVisible();
    await checkPage(page, testInfo, "slice3-badge1");
    await badge.locator("button", { hasText: "Back to my route" }).click();

    expect(page.url()).toMatch(/#home$/);
    await expect(page.locator(".journey-count")).toHaveText("1 of 5 levels done");
    await expect(page.locator(".welcome-text")).toHaveText("Welcome back! You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await expect(page.locator(".status-pill")).toHaveText(["Story Sharer", "Not started", "Locked", "Locked", "Locked"]);
    await expect(page.locator(".shelf-name").first()).toHaveText("Story Sharer, earned");

    // The server has the stories, the submit time and the finished level.
    const row = await apiGet(request, { action: "load", class: "3E1", reg: "21" });
    expect(row.record.answers["s1.q2"].v).toBe("The staff brought me the wrong order.");
    expect(row.record.done["1"]).toBeTruthy();

    // Revisiting a finished level: read-only, recap shown, no Finish button.
    await page.click("#levelCard1");
    await expect(page.locator(".recap-card")).toBeVisible();
    await expect(page.locator("#finishBtn")).toHaveCount(0);
    await expect(page.locator("#part0 textarea").nth(1)).toHaveAttribute("readonly", "");
    expect(errors).toEqual([]);
  });

  test("blank and short responses cannot be submitted or locked", async ({page,request}) => {
    await newStudent(page,request,22);
    await page.goto("/#level1");
    await page.locator('textarea[data-answer="s1.q1"]').fill("ok");
    await page.click("#submitL1");
    await expect(page.locator("#notFinished .missing-list li")).toHaveCount(3);
    await expect(page.getByRole("button",{name:"Submit anyway"})).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator("#notFinished")).toHaveCount(0);
    await expect(page.locator('textarea[data-answer="s1.q1"]')).toBeEditable();
    await expect(page.locator(".recap-card")).toHaveCount(0);
    // Repair the previously allowed submitted-with-a-blank state without discarding answers.
    await page.evaluate(()=>{setAnswer('s1.q1','The staff listened carefully and helped me.');setAnswer('s1.q2','The staff ignored my request for help.');rec.submitted.s1=new Date().toISOString();rec.done[1]=rec.submitted.s1;saveLocal();renderLevel(1);});
    await expect(page.locator('textarea[data-answer="s1.q3"]')).toBeEditable();
    await page.locator('textarea[data-answer="s1.q3"]').fill('Good service means listening carefully and helping.');
    await page.click('#submitL1');await expect(page.locator('.recap-card')).toBeVisible();
    await expect(page.locator('textarea[data-answer="s1.q1"]')).toHaveValue('The staff listened carefully and helped me.');
  });
});

test.describe("Level 2", () => {
  // Walks a fresh student through all 18 cards with Back and Next, answering what each card needs.
  async function walkLevel2(page, upTo) {
    for (let i = 0; i < upTo; i++) {
      const label = await page.locator("#lessonProgressText").textContent();
      if (/Watch: A better welcome/.test(label)) await page.fill('textarea[data-answer="s2.video"]', "Alex welcomed June and offered help.");
      if (/Quick check/.test(label)) {
        for (const [id, answer] of [["a", "Greeting"], ["b", "Service"], ["c", "Product"]]) await page.locator(`.qc-item[data-key="s2.qc.${id}"]`).getByRole("button", { name: answer }).click();
      }
      if (/The 8 service recovery steps/.test(label)) {
        for (let n = 2; n <= 8; n++) {
          await expect(page.locator("#lessonNext")).toBeDisabled();
          await page.click("#showStepBtn");
          await expect(page.locator(".path-stop")).toHaveCount(n);
          await expect(page.locator(`#pathLabel${n}`)).toHaveText(PATH_LABELS[n - 1]);
        }
      }
      if (/Real-life example/.test(label)) await page.fill('textarea[data-answer="s2.think1"]', "No apology and no real solution.");
      if (/Handling returns/.test(label)) await page.fill('textarea[data-answer="s2.think2"]', "Used items, because of hygiene.");
      await page.click("#lessonNext");
    }
  }

  test("18 cards, Back and Next, the step-by-step path, reflections, recap, badge", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await newStudent(page, request, 23);
    await finishLevel1(page);
    await page.click("#levelCard2");
    await expect(page.locator("h1.page-title")).toHaveText("Level 2: Learn: Customer Service");
    await expect(page.locator(".step-tab")).toHaveCount(0);
    await expect(page.locator("#lessonProgressText")).toHaveText("1 of 18 · 4 key terms");
    await checkPage(page, testInfo, "slice3-level2-card1");
    await walkLevel2(page, 15);
    await expect(page.locator("#lessonProgressText")).toHaveText("16 of 18 · The 8 service recovery steps");
    await expect(page.locator(".path-stop")).toHaveCount(1);
    await expect(page.locator("#pathLabel1")).toHaveText(PATH_LABELS[0]);
    await expect(page.locator(".path-text")).toHaveCount(0);
    await expect(page.locator(".video-frame")).toHaveCount(0);
    await walkLevel2(page, 3);
    await expect(page.locator("#badgeModal")).toContainText("Service Scholar");
    await page.locator("#badgeModal button").click();
    await expect(page.locator(".status-pill").nth(1)).toHaveText("Service Scholar");
    await expectNoAmpersand(page);
    expect(errors).toEqual([]);
  });

  test("coming back to the path later shows all 8 stops; progress loads on another device", async ({ page, request, browser }, testInfo) => {
    await newStudent(page, request, 24);
    await finishLevel1(page);
    await page.goto("/#level2");
    await walkLevel2(page, 15);
    await page.click("#showStepBtn");
    await expect(page.locator(".path-stop")).toHaveCount(2);
    // Leave and come back: the same card, all 8 at once, and Next is ready.
    await page.click("#homeBtn");
    const saved = waitForSave(page);
    await page.click("#levelCard2");
    await expect(page.locator("#lessonProgressText")).toContainText("16 of 18");
    await expect(page.locator(".path-stop")).toHaveCount(8);
    await expect(page.locator("#lessonNext")).toBeEnabled();
    await saved;

    // Another browser profile: same card, same path.
    const other = await browser.newContext(testInfo.project.use);
    const page2 = await other.newPage();
    await login(page2, "3E1", 24);
    await expect(page2.locator(".status-pill")).toHaveText(["Story Sharer", "In progress", "Locked", "Locked", "Locked"]);
    await expect(page2.locator(".welcome-text")).toHaveText("Welcome back! Your work has been loaded. You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await page2.click("#levelCard2");
    await expect(page2.locator("#lessonProgressText")).toContainText("16 of 18");
    await expect(page2.locator(".path-stop")).toHaveCount(8);
    // "Your work has been loaded." only on the first home page after logging in.
    await page2.click("#homeBtn");
    await expect(page2.locator(".welcome-text")).toHaveText("Welcome back! You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await other.close();
  });

  test("the path slide-in is off when reduced motion is on", async ({ page, request }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await newStudent(page, request, 25);
    await finishLevel1(page);
    await page.evaluate(() => { setUi("s2.cardLayout", "cards15"); setUi("s2.card", 12); saveLocal(); });
    await page.goto("/#level2");
    await page.click("#showStepBtn");
    const stop = page.locator(".path-stop").nth(1);
    const duration = await stop.evaluate(el => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });

  test("locked level cannot be opened by its address", async ({ page, request }) => {
    await newStudent(page, request, 26);
    await page.goto("/#level2");
    await expect(page).toHaveURL(/#home$/);
    await expect(page.locator(".journey-count")).toHaveText("0 of 5 levels done");
  });
});
