// Slice 3: Levels 1 and 2, with locks, tabs, Continue and Next, the Service Recovery Path
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
  for (const [i, text] of ["Staff smiled and helped me.", "The order was wrong.", "Good when staff care."].entries()) {
    await page.fill(`textarea[data-answer="s1.q${i + 1}"]`, text);
  }
  await page.click("#submitL1");
  await page.click("#finishBtn");
  await page.locator("#badgeModal button").click();
}

const PATH_LABELS = ["Listen", "Be patient", "Apologise", "Acknowledge", "Ask questions", "Offer solutions", "Refer", "Thank"];

test.describe("Level 1", () => {
  test("stories, Not finished yet, recap, badge, Level 2 unlocks", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await newStudent(page, request, 21);
    await page.click("#levelCard1");
    await expect(page.locator("h1.page-title")).toHaveText("📝 Level 1: Your Customer Service Stories");
    await expect(page.locator(".step-tabs")).toHaveCount(0); // one step only
    const part = page.locator("#part0");
    await expect(part.locator("p").first()).toHaveText("Think about your own experiences as a customer. There are no right or wrong answers.");
    await expect(part.locator(".tip")).toHaveText("💡 Tip: don't name real people. Your teacher will read your answers.");
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
    await expect(part.locator("p", { hasText: "Type at least one sentence" })).toHaveText("Type at least one sentence in each box, then tap Submit.");
    await checkPage(page, testInfo, "slice3-level1");

    // Box 2 empty: Not finished yet, listed by name, with Go back and Submit anyway.
    await boxes.nth(0).fill("Staff smiled and helped me.");
    await boxes.nth(2).fill("Good when staff care.");
    await page.click("#submitL1");
    const modal = page.locator("#notFinished");
    await expect(modal.locator("h2")).toHaveText("⚠️ Not finished yet");
    await expect(modal.locator(".missing-list li")).toHaveText(["✗ Box 2"]);
    await expect(modal.locator("button")).toHaveText(["Go back", "Submit anyway"]);
    await expect(page.locator('[data-key="s1.q2"]')).toHaveClass(/incomplete/);
    await checkPage(page, testInfo, "slice3-level1-not-finished");
    await modal.locator("button", { hasText: "Go back" }).click();
    await boxes.nth(1).fill("The order was wrong.");
    await expect(page.locator('[data-key="s1.q2"]')).not.toHaveClass(/incomplete/);

    // Typing is saved on the device straight away; reload keeps it.
    await page.reload();
    await expect(page.locator('textarea[data-answer="s1.q2"]')).toHaveValue("The order was wrong.");

    await page.click("#submitL1");
    await expect(page.locator(".recap-card .recap-title")).toHaveText("📌 Remember this");
    await expect(page.locator(".recap-card p")).toHaveText("Keep your stories in mind. In Level 2, see whether your ideas match what businesses call quality customer service.");
    await expect(page.locator("#part0 textarea").first()).toHaveAttribute("readonly", "");
    await expect(page.locator("#finishBtn")).toHaveText("Finish Level 1");
    await checkPage(page, testInfo, "slice3-level1-recap");
    const saved = waitForSave(page);
    await page.click("#finishBtn");
    await saved; // Finish saves to the server at once
    const badge = page.locator("#badgeModal");
    await expect(badge.locator("h2")).toHaveText("📝 Story Sharer");
    await expect(badge.locator(".badge-pop-text")).toHaveText("You earned the Story Sharer badge!");
    await expect(badge.locator(".img-placeholder")).toBeVisible(); // badge picture not added yet
    await checkPage(page, testInfo, "slice3-badge1");
    await badge.locator("button", { hasText: "Back to my route" }).click();

    expect(page.url()).toMatch(/#home$/);
    await expect(page.locator(".journey-count")).toHaveText("1 of 5 levels done");
    await expect(page.locator(".welcome-text")).toHaveText("👋 Welcome back! You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await expect(page.locator(".status-pill")).toHaveText(["✅ Story Sharer", "Not started", "🔒 Locked", "🔒 Locked", "🔒 Locked"]);
    await expect(page.locator(".shelf-name").first()).toHaveText("Story Sharer, earned");

    // The server has the stories, the submit time and the finished level.
    const row = await apiGet(request, { action: "load", class: "3E1", reg: "21" });
    expect(row.record.answers["s1.q2"].v).toBe("The order was wrong.");
    expect(row.record.done["1"]).toBeTruthy();

    // Revisiting a finished level: read-only, recap shown, no Finish button.
    await page.click("#levelCard1");
    await expect(page.locator(".recap-card")).toBeVisible();
    await expect(page.locator("#finishBtn")).toHaveCount(0);
    await expect(page.locator("#part0 textarea").nth(1)).toHaveAttribute("readonly", "");
    expect(errors).toEqual([]);
  });

  test("Submit anyway works with an empty box", async ({ page, request }) => {
    await newStudent(page, request, 22);
    await page.goto("/#level1");
    await page.click("#submitL1");
    await expect(page.locator("#notFinished .missing-list li")).toHaveText(["✗ Box 1", "✗ Box 2", "✗ Box 3"]);
    await page.locator("#notFinished button", { hasText: "Submit anyway" }).click();
    await expect(page.locator(".recap-card")).toBeVisible();
  });
});

test.describe("Level 2", () => {
  test("tabs, Continue and Next, path, Think about it, recap, badge", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await newStudent(page, request, 23);
    await finishLevel1(page);
    await page.click("#levelCard2");
    await expect(page.locator("h1.page-title")).toHaveText("📘 Level 2: Learn: Customer Service");

    // Step tabs: only the first is open; the others are locked and cannot be opened.
    const tabs = page.locator(".step-tab");
    await expect(page.locator(".step-label")).toHaveText(["Quality Customer Service", "The Four Stages (locked)", "Breakdown and Recovery (locked)"]);
    await expect(page.locator(".step-num")).toHaveText(["1", "🔒", "🔒"]);
    await expect(tabs.nth(0)).toHaveAttribute("aria-current", "step");
    expect(await page.locator(".step-tabs").evaluate(el => getComputedStyle(el).position)).toBe("sticky");
    await tabs.nth(1).click({ force: true });
    await expect(tabs.nth(0)).toHaveAttribute("aria-current", "step");

    // Tab 1, part 1: what customer service and quality customer service are.
    await expect(page.locator("#part0 h2")).toHaveText(["🤝 What is customer service?", "⭐ What is quality customer service?"]);
    await expect(page.locator("#part0 .def-body")).toHaveText([
      "Customer service refers to what businesses do for their customers so that they are happy and satisfied.",
      "Quality customer service means doing more for customers to exceed their expectations."
    ]);
    await expect(page.locator("#part0 > p", { hasText: "It takes place" })).toHaveText("It takes place the moment a customer enters a shop, a restaurant or an attraction, and continues even after the customer has made a purchase and left the venue.");
    await expect(page.locator("#part1")).toHaveCount(0);
    await expect(page.locator("#nextBtn")).toHaveCount(0); // Next only after every Continue
    await checkPage(page, testInfo, "slice3-level2-tab1");
    // Part 2 (new Continue point): why it matters.
    await page.click("#continueBtn");
    await expect(page.locator("#part1 h2")).toHaveText("❓ Why does quality customer service matter?");
    await expect(page.locator("#part1 .icon-card .ic-body")).toHaveText([
      "Customers will have a positive experience and they will choose to return repeatedly;",
      "Customers will recommend the business to their relatives and friends; and",
      "Customer loyalty is created, ensuring the continuity of the business."
    ]);
    await expect(page.locator('#part1 img[data-img="C01"]')).toBeVisible();
    await page.click("#continueBtn");
    await expect(page.locator("#part2 h2")).toHaveText("🧑‍💼 Skills and qualities of a good customer service employee");
    // Skill names on their own line (bold, no colon), descriptions below with a capital letter.
    await expect(page.locator("#part2 .icon-card .ic-name")).toHaveText([
      "Approachable", "Customer-focused", "Clear communication skills", "Knowledgeable", "Problem-solving skills",
      "Able to close the customer experience positively"
    ]);
    await expect(page.locator("#part2 .icon-card .ic-desc")).toHaveText([
      "Friendly and easy to talk to, so customers feel comfortable asking for help",
      "Paying attention to what each customer needs and putting those needs first",
      "Explaining things simply",
      "Knowing the products well, so you can answer questions accurately",
      "Providing solutions, not just apologising",
      "Ending on a good note, e.g. thanking the customer and inviting them back"
    ]);
    expect(await page.locator("#part2 .ic-name").first().evaluate(el => getComputedStyle(el).display)).toBe("block");
    expect(await page.locator("#part2 .ic-name").first().evaluate(el => Number(getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(700);
    await page.click("#continueBtn");
    await expect(page.locator("#part3 h2")).toHaveText("📱 Good product knowledge");
    await expect(page.locator('#part3 .img-placeholder[data-img="N02"]')).toBeVisible();
    await expect(page.locator("#continueBtn")).toHaveCount(0);
    await expect(page.locator("#nextBtn")).toHaveText("Next: The Four Stages →");
    await checkPage(page, testInfo, "slice3-level2-tab1-end");

    // Reload: the parts already opened stay open.
    await page.reload();
    await expect(page.locator("#part3")).toBeVisible();
    await page.click("#nextBtn");

    // Tab 2.
    await expect(tabs.nth(1)).toHaveAttribute("aria-current", "step");
    await expect(page.locator(".stage-row th")).toHaveText(["👋1. Approaching customers", "📱2. Presenting product information", "✅3. Closing the customer experience positively", "🛠️4. Performing service recovery"]);
    await expect(page.locator('#part0 img[data-img="C02"]')).toBeVisible();
    await checkPage(page, testInfo, "slice3-level2-tab2");
    await page.click("#continueBtn");
    await expect(page.locator("#part1 h2")).toHaveText("👋 Approaching customers: 3 approaches");
    await expect(page.locator("#part1 .approach-name")).toHaveText(["1. Greeting Approach:", "2. Service Approach:", "3. Product Approach:"]);
    // Part 3 (new Continue point): the purpose of approaching, with the comic.
    await page.click("#continueBtn");
    await expect(page.locator("#part2 .head-row p")).toHaveText("Whether salespeople use the greeting, service or product approach, the purpose is to:");
    await expect(page.locator("#part2 .icon-card .ic-body")).toHaveText([
      "Make customers feel comfortable or welcome in the store so that they are likely to buy from the business; and",
      "Ensure customers return to the business again in the future."
    ]);
    await expect(page.locator('#part2 img[data-img="C03"]')).toBeVisible();
    await page.click("#continueBtn");
    await expect(page.locator("#part3 h2")).toHaveText("🎯 Presenting product information: suitability");
    await checkPage(page, testInfo, "slice3-level2-tab2-end");
    await page.click("#nextBtn"); // "Next: Breakdown and Recovery →"

    // Tab 3, part 1: the two definitions.
    await expect(tabs.nth(2)).toHaveAttribute("aria-current", "step");
    await expect(page.locator("#part0 h2")).toHaveText("⚠️ Service breakdown and service recovery");
    await expect(page.locator("#part0 .definition")).toHaveCount(2);
    await expect(page.locator(".path-stop")).toHaveCount(0);
    // Part 2 (new Continue point): the Service Recovery Path starts with Step 1 only.
    await page.click("#continueBtn");
    await expect(page.locator("#part1 .head-row p")).toHaveText("To perform service recovery, follow these 8 steps:");
    await expect(page.locator(".path-stop")).toHaveCount(1);
    await expect(page.locator(".path-label")).toHaveText(["Step 1: Listen"]);
    await expect(page.locator("#pathStop1 .path-bubble")).toHaveText("The staff member: (Puts his own phone away and faces the customer.)");
    await expect(page.locator("#pathStop1 .path-face")).toHaveText("😠Customer feels angry");
    await expect(page.locator("#continueBtn")).toHaveCount(0);
    await expect(page.locator(".after-path")).toHaveCount(0);
    await checkPage(page, testInfo, "slice3-path-step1");
    for (let n = 2; n <= 8; n++) {
      await expect(page.locator("#showStepBtn")).toHaveText(`Show Step ${n} ↓`);
      await page.click("#showStepBtn");
      await expect(page.locator(".path-stop")).toHaveCount(n);
      if (n === 4) await checkPage(page, testInfo, "slice3-path-step4");
    }
    await expect(page.locator(".path-label")).toHaveText(PATH_LABELS.map((l, i) => `Step ${i + 1}: ${l}`));
    await expect(page.locator("#showStepBtn")).toHaveCount(0);
    await expect(page.locator(".after-path")).toHaveText("Handled well, a service breakdown can improve customer loyalty. If it is handled badly, you can lose the customer to your competitors.");
    await expect(page.locator('#part1 img[data-img="C04"]')).toBeVisible();
    await expect(page.locator("#continueBtn")).toBeVisible();
    await checkPage(page, testInfo, "slice3-path-all");

    await page.click("#continueBtn");
    await expect(page.locator("#part2 h2")).toHaveText("📉 Real-life example: poor service recovery");
    await expect(page.locator('#part2 img[data-img="R01"]')).toBeVisible();
    await expect(page.locator('#part2 img[data-img="R02"]')).toBeVisible();
    await expect(page.locator("#part2 .think-title")).toHaveText("🤔 Think about it (optional)");
    await page.fill('textarea[data-answer="s2.think1"]', "Not good: no apology or solution.");
    await page.click("#continueBtn");
    await expect(page.locator("#part3 h2")).toHaveText("↩️ Handling returns of unsatisfactory products");
    await expect(page.locator('#part3 .img-placeholder[data-img="N03"]')).toBeVisible();
    await expect(page.locator("#part3 .ic-name")).toHaveText(["Replacement", "Exchange", "Refund"]);
    await expect(page.locator("#part3 .ic-desc")).toHaveText(["Replace it with the same product.", "Offer to exchange it with a different product.", "Give a refund."]);
    // Part 5 (new Continue point): the returns rules, Uniqlo, the second optional box, recap.
    await page.click("#continueBtn");
    await expect(page.locator("#part4 .head-row p")).toHaveText("Many businesses also set clear rules for returns, such as a time limit and needing the receipt.");
    await expect(page.locator('#part4 img[data-img="R03"]')).toBeVisible();
    // The optional box is left empty: Finish still works.
    await expect(page.locator(".recap-card .recap-title")).toHaveText("📌 Remember this");
    await expect(page.locator(".recap-card p")).toHaveText("The four stages are approaching customers, presenting product information, closing the customer experience positively and performing service recovery.");
    await expect(page.locator("#finishBtn")).toHaveText("Finish Level 2");
    await checkPage(page, testInfo, "slice3-level2-end");
    await page.click("#finishBtn");
    await expect(page.locator("#badgeModal h2")).toHaveText("📘 Service Scholar");
    await expect(page.locator("#badgeModal .badge-pop-text")).toHaveText("You earned the Service Scholar badge!");
    await page.locator("#badgeModal button").click();
    await expect(page.locator(".status-pill")).toHaveText(["✅ Story Sharer", "✅ Service Scholar", "Not started", "🔒 Locked", "🔒 Locked"]);

    // Finished level: all tabs open, path shown in full, optional answer kept and read-only.
    await page.click("#levelCard2");
    await page.locator(".step-tab").nth(2).click();
    await expect(page.locator(".path-stop")).toHaveCount(8);
    await expect(page.locator('textarea[data-answer="s2.think1"]')).toHaveValue("Not good: no apology or solution.");
    await expect(page.locator('textarea[data-answer="s2.think1"]')).toHaveAttribute("readonly", "");
    await expect(page.locator("#finishBtn")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("coming back to the path later shows all 8 stops; progress loads on another device", async ({ page, request, browser }, testInfo) => {
    await newStudent(page, request, 24);
    await finishLevel1(page);
    await page.goto("/#level2");
    for (let t = 0; t < 2; t++) {
      for (let c = 0; c < 3; c++) await page.click("#continueBtn");
      await page.click("#nextBtn");
    }
    await page.click("#continueBtn");
    await page.click("#showStepBtn");
    await expect(page.locator(".path-stop")).toHaveCount(2);
    // Leave and come back: all 8 at once, and Continue is there.
    await page.click("#homeBtn");
    const saved = waitForSave(page);
    await page.click("#levelCard2");
    await expect(page.locator(".step-tab").nth(2)).toHaveAttribute("aria-current", "step"); // back on the tab they were on
    await expect(page.locator(".path-stop")).toHaveCount(8);
    await expect(page.locator("#continueBtn")).toBeVisible();
    await saved;

    // Another browser profile: same tabs open, same tab, same path.
    const other = await browser.newContext(testInfo.project.use);
    const page2 = await other.newPage();
    await login(page2, "3E1", 24);
    await expect(page2.locator(".status-pill")).toHaveText(["✅ Story Sharer", "In progress", "🔒 Locked", "🔒 Locked", "🔒 Locked"]);
    await expect(page2.locator(".welcome-text")).toHaveText("👋 Welcome back! Your work has been loaded. You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await page2.click("#levelCard2");
    await expect(page2.locator(".step-tab").nth(2)).toHaveAttribute("aria-current", "step");
    await expect(page2.locator(".path-stop")).toHaveCount(8);
    await expect(page2.locator(".step-tab.locked")).toHaveCount(0);
    // "Your work has been loaded." only on the first home page after logging in.
    await page2.click("#homeBtn");
    await expect(page2.locator(".welcome-text")).toHaveText("👋 Welcome back! You've finished 1 of 5 levels. Great progress! Carry on with Level 2 below.");
    await other.close();
  });

  test("the path slide-in is off when reduced motion is on", async ({ page, request }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await newStudent(page, request, 25);
    await finishLevel1(page);
    await page.goto("/#level2");
    await page.evaluate(() => { localStorage.setItem("ch6_unlock_all", "true"); });
    await page.reload();
    await page.locator(".step-tab").nth(2).click();
    await page.click("#continueBtn"); // the path is the second part of Tab 3
    const stop = page.locator(".path-stop").first();
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
