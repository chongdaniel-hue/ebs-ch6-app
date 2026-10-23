// Slice 4: Levels 3, 4 and 5, with hint, retry and reveal feedback, and the exit ticket.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot,
  resetServer, apiGet, apiPost, login, waitForSave
} = require("./helpers");

async function checkPage(page, testInfo, name) {
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  if (name) await shot(page, testInfo, name);
}

// A student who has finished Levels 1 to (upTo - 1); those levels are tested in slice 3.
async function studentAt(page, request, reg, upTo) {
  await resetServer(request, ["3E1"]);
  await login(page, "3E1", reg);
  await page.click("#briefing button");
  await page.evaluate((upTo) => {
    for (let n = 1; n < upTo; n++) rec.done[n] = new Date().toISOString();
    saveLocal();
  }, upTo);
  await page.goto("/#home");
  await page.reload();
  await expect(page.locator(".welcome-card")).toBeVisible();
}

const STAGE = { approach: "0", present: "1", close: "2", recover: "3" };

test.describe("Level 3: Chat with Alex", () => {
  test("chat tab, tick box unlocks Next, Q1 and Q2 with hint, retry and reveal", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await studentAt(page, request, 41, 3);
    await page.click("#levelCard3");
    await expect(page.locator("h1.page-title")).toHaveText("Level 3: Chat with Alex");
    await expect(page.locator(".level-sub")).toHaveText("Be the customer. Chat with Nexora's customer service officer.");
    await expect(page.locator(".step-label")).toHaveText(["Chat", "Think back (locked)"]);

    // Tab 1: Chat.
    await expect(page.locator(".intro-with-pic p")).toHaveText("Meet Alex, a customer service officer at Nexora Mobile. You are the customer. During your chat, try to:");
    await expect(page.locator('.intro-pic img[data-img="N04"]')).toBeVisible();
    await expect(page.locator(".icon-card .ic-body")).toHaveText([
      "Ask about at least one product, and its price",
      "Ask a follow-up question or disagree with something (for example, say the price is too high)",
      "Report a problem with a product, and see how Alex responds"
    ]);
    const tip = page.locator(".tip-details");
    await expect(tip.locator("summary")).toHaveText("Not sure what to ask? Try these:");
    await expect(tip.locator(".say").first()).toBeHidden(); // collapsed until tapped
    await tip.locator("summary").click();
    await expect(tip.locator(".say")).toHaveText(["\"How much does the Nexora Core cost?\"", "\"Why is the Nexora Prime so expensive?\"", "\"My phone's screen stopped working. What can I do?\""]);
    await expect(page.locator("#part0 > p", { hasText: "Watch how" })).toHaveText("Watch how Alex starts the chat, presents information, and responds when something has gone wrong.");
    const gem = page.locator(".gem-btn");
    await expect(gem).toHaveText("Open Alex (new tab)");
    await expect(gem).toHaveAttribute("href", "https://gemini.google.com/gem/03f888f88087");
    await expect(gem).toHaveAttribute("target", "_blank");
    const tick = page.locator(".tick-input");
    await expect(page.locator(".tick-row")).toHaveText("I have finished chatting with Alex.");
    await expect(tick).not.toBeChecked();
    await expect(page.locator("#nextBtn")).toHaveText("Next: Think back →");
    await expect(page.locator("#nextBtn")).toBeDisabled();
    await expect(page.locator(".next-note")).toHaveText("Tick the box above when you've finished.");
    await checkPage(page, testInfo, "slice4-level3-chat");
    await tick.check();
    await expect(page.locator("#nextBtn")).toBeEnabled();
    await expect(page.locator(".next-note")).toHaveCount(0);
    await page.click("#nextBtn");

    // Tab 2: Think back. Nothing pre-selected. The Chat tab now shows ✓.
    await expect(page.locator(".step-tab").nth(1)).toHaveAttribute("aria-current", "step");
    await expect(page.locator(".step-num")).toHaveText(["✓", "2"]);
    await expect(page.locator("#part0 > p").first()).toHaveText("Answer these without reopening the chat with Alex.");
    await expect(page.locator("#l3q1")).toHaveText("Q1. Think back to your conversation with Alex. Identify ONE skill or quality he showed.");
    await expect(page.locator('[data-q="q1"] .field-label')).toHaveText(["Skill or quality:", "This is important to customers because"]);
    await expect(page.locator("#l3q2")).toHaveText("Q2. Match each line to the stage of providing customer service. Choose a stage for each line.");
    await expect(page.locator(".match-line")).toHaveText([
      "P. \"Could you tell me when the screen first stopped working? Then we can arrange a repair or replacement for you.\"",
      "Q. \"Since you play a lot of games, the Nexora Prime's fast processor would suit you best.\"",
      "R. \"So that's the Nexora Core with the 256GB upgrade and the one-year warranty. You can collect it on Friday!\"",
      "S. \"Good afternoon! Is there anything I can help you find today?\""
    ]);
    for (const id of ["P", "Q", "R", "S"]) {
      expect(await page.locator(`#sel_${id}`).inputValue()).toBe("");
      await expect(page.locator(`#sel_${id} option`)).toHaveText(["Choose a stage…", "Approaching customers", "Presenting product information", "Closing the customer experience positively", "Performing service recovery"]);
    }
    await checkPage(page, testInfo, "slice4-level3-thinkback");

    // Required: Not finished yet, with only Go back.
    await page.click("#submitL3");
    await expect(page.locator("#notFinished .missing-list li")).toHaveText(["✗ Q1 (skill or quality)", "✗ Q1 (why it is important)", "✗ Q2 P", "✗ Q2 Q", "✗ Q2 R", "✗ Q2 S"]);
    await expect(page.locator("#notFinished button")).toHaveText(["Go back"]);
    await page.locator("#notFinished button").click();

    // P right, Q wrong (fixed on retry), R wrong twice (revealed), S right.
    await page.fill('textarea[data-answer="s3.q1a"]', "Knowledgeable");
    await page.fill('textarea[data-answer="s3.q1b"]', "he answered my questions about prices accurately.");
    await page.selectOption("#sel_P", STAGE.recover);
    await page.selectOption("#sel_Q", STAGE.approach);
    await page.selectOption("#sel_R", STAGE.approach);
    await page.selectOption("#sel_S", STAGE.approach);
    const saved = waitForSave(page);
    await page.click("#submitL3");
    await saved; // the first attempt goes to the server at once

    await expect(page.locator('[data-q="q1"] .check-note')).toHaveText("Check your reason: does it say how this skill or quality helps the customer? For example, a knowledgeable officer answers questions accurately, so the customer doesn't get wrong information.");
    await expect(page.locator('[data-q="q1"] textarea').first()).toHaveAttribute("readonly", "");
    const fb = id => page.locator(`.match-item[data-key="s3.q2.${id}"] .feedback`);
    await expect(fb("P")).toHaveText("✓ Correct: asking questions (Step 5) and offering a solution (Step 6) are part of service recovery.");
    await expect(fb("P")).toHaveClass(/right/);
    await expect(fb("Q")).toHaveText("✗ The officer matches a phone feature to something the customer does a lot. Which stage is about presenting a suitable product?");
    await expect(fb("Q")).toHaveClass(/wrong/);
    await expect(fb("R")).toHaveText("✗ The officer sums up what the customer chose and when to collect it. Is this the start or the end of the interaction?");
    await expect(fb("S")).toHaveText("✓ Correct: a greeting with an offer of help is approaching customers.");
    await expect(page.locator("#sel_P")).toHaveAttribute("aria-disabled", "true");  // right answers lock
    await expect(page.locator("#sel_Q")).toBeEnabled();   // wrong answers can be changed once
    await expect(page.locator("#checkAgainBtn")).toHaveCount(1);
    await expect(page.locator("#checkAgainBtn")).toHaveText("Check again");
    await expect(page.locator("#finishBtn")).toHaveCount(0); // held back until Check again
    await expect(page.locator(".recap-card")).toHaveCount(0);
    await checkPage(page, testInfo, "slice4-level3-feedback");

    // Changing a wrong answer: the old hint fades and a prompt shows in its place.
    await page.selectOption("#sel_Q", STAGE.present);
    const itemQ = page.locator('.match-item[data-key="s3.q2.Q"]');
    await expect(itemQ.locator(".check-prompt")).toHaveText("Tap Check again to see if you're right.");
    await expect(itemQ.locator(".feedback.faded")).toHaveText("Earlier hint: ✗ The officer matches a phone feature to something the customer does a lot. Which stage is about presenting a suitable product?");
    await expect(page.locator('.match-item[data-key="s3.q2.R"] .check-prompt')).toHaveCount(0); // R not changed yet
    await page.selectOption("#sel_R", STAGE.present);
    await checkPage(page, testInfo, "slice4-level3-changed");
    await page.click("#checkAgainBtn");
    await expect(fb("Q")).toHaveText("✓ Correct: matching a feature to the customer's needs is presenting product information.");
    await expect(fb("R")).toHaveText("✗ The answer is Closing the customer experience positively: summing up the decision and the next steps closes the customer experience positively.");
    await expect(page.locator("#checkAgainBtn")).toHaveCount(0);
    await expect(page.locator("#sel_R")).toHaveAttribute("aria-disabled", "true");
    // The revealed answer is shown beside the dropdown; the wrong pick is marked ✗.
    const itemR = page.locator('.match-item[data-key="s3.q2.R"]');
    await expect(itemR.locator(".right-tag")).toHaveText("✓ Correct answer: Closing the customer experience positively");
    await expect(itemR.locator(".wrong-tag")).toHaveText("✗");
    await expect(itemQ.locator(".right-tag, .wrong-tag")).toHaveCount(0); // right on the second try: no reveal
    // Summary card above the recap: the items wrong on the first try.
    const card = page.locator(".missed-card");
    await expect(card.locator("h3")).toHaveText("Let's learn from these");
    await expect(card.locator(".missed-intro")).toHaveText("Good effort! Here are 2 things to look at again:");
    await expect(card.locator("li")).toHaveText([
      "Presenting product information (Level 2, The Four Stages)",
      "Closing the customer experience positively (Level 2, The Four Stages)"
    ]);
    expect(await page.evaluate(() => {
      const c = document.querySelector(".missed-card"), r = document.querySelector(".recap-card");
      return !!(c.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);
    await expect(page.locator(".recap-card p")).toHaveText("The same four stages happen in every customer interaction, whether it's in a shop or in a chat.");
    await expect(page.locator("#finishBtn")).toHaveText("Finish Level 3");
    await checkPage(page, testInfo, "slice4-level3-resolved");
    await page.click("#finishBtn");
    await expect(page.locator("#badgeModal h2")).toHaveText("Service Spotter");
    await expect(page.locator("#badgeModal .badge-pop-text")).toHaveText("You earned the Service Spotter badge!");
    await page.locator("#badgeModal button").click();
    await expect(page.locator(".status-pill").nth(2)).toHaveText("Service Spotter");
    await expect(page.locator(".status-pill").nth(3)).toHaveText("Not started");

    // The server has both attempts; the readable Q2 column shows the first try.
    const row = await apiGet(request, { action: "load", class: "3E1", reg: "41" });
    expect(row.record.first["s3q2.Q"]).toMatchObject({ a: 0, ok: false });
    expect(row.record.second["s3q2.Q"]).toMatchObject({ a: 1, ok: true });
    expect(row.record.first["s3q2.P"].ok).toBe(true);
    const sheet = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), "ebs-ch6-playwright-data", "sheets.json"), "utf8"));
    const studentRow = sheet.Students.find(r => r[0] === "3E1#41");
    expect(studentRow[4]).toBe("2 / 4");

    // A first attempt cannot be overwritten from another copy.
    const forged = JSON.parse(JSON.stringify(row.record));
    forged.first["s3q2.Q"] = { a: 1, ok: true, t: new Date().toISOString() };
    forged.updatedAt = new Date().toISOString();
    const after = await apiPost(request, { action: "save", record: forged });
    expect(after.record.first["s3q2.Q"].ok).toBe(false);

    // Coming back: read-only, feedback still there, Open Alex still works.
    await page.click("#levelCard3");
    await page.locator(".step-tab").nth(0).click();
    await expect(page.locator(".gem-btn")).toHaveAttribute("href", "https://gemini.google.com/gem/03f888f88087");
    await expect(page.locator(".tick-input")).toBeDisabled();
    await page.locator(".step-tab").nth(1).click();
    await expect(page.locator("#sel_Q")).toHaveAttribute("aria-disabled", "true");
    await expect(fb("R")).toContainText("The answer is Closing the customer experience positively");
    await expect(page.locator("#finishBtn")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("Level 4: Serve Suzzie at Stylez", () => {
  test("roleplay tab, Stylez document reference, reflect, recap, badge", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await studentAt(page, request, 42, 4);
    await page.click("#levelCard4");
    await expect(page.locator("h1.page-title")).toHaveText("Level 4: Serve Suzzie at Stylez");
    await expect(page.locator(".intro-with-pic p")).toHaveText("Now switch roles. You are a customer service officer at Stylez, a retail store. The AI plays Suzzie, a customer with a question or a problem.");
    await expect(page.locator('.intro-pic img[data-img="N05"]')).toBeVisible();
    await expect(page.locator("#aboutStylezTitle")).toHaveText("About Stylez");
    await expect(page.locator(".stylez-intro p")).toHaveText("Stylez is a casual clothing retailer for teenagers and young adults. It sells affordable everyday clothing in-store and online, including T-shirts, jeans, hoodies, dresses, shorts and accessories.");
    await expect(page.locator(".placeholder-card")).toHaveCount(0);
    await page.click("#stylezInfoBtn");
    await expect(page).toHaveURL(/#stylez$/);
    await expect(page.locator("h1")).toHaveText("Stylez store information");
    await expect(page.locator(".stylez-fact")).toHaveCount(17);
    await expect(page.locator(".stylez-fact dd")).toHaveText(["Casual clothing retailer for teenagers and young adults; sells affordable everyday clothing in-store and online.", "T-shirts, jeans, hoodies, dresses, shorts and accessories.", "XS to XL.", "$18 each.", "$39 each.", "$35 each.", "Buy 2 Basic T-shirts for $30.", "Stylez members get 10% off regular-priced items.", "STYLE10 gives 10% off the first online order.", "Promotions cannot be combined.", "Exchange within 14 days with receipt.", "Item must be unworn, unwashed and have its original tags.", "No exchange.", "Customer may bring the item and receipt to the store for assistance.", "Cash, cards and common mobile payment methods.", "Free delivery for orders of $60 or more.", "Available in-store or through Stylez online chat."]);
    await checkPage(page, testInfo, "slice4-stylez-information");
    await page.click("#stylezBack");
    await expect(page).toHaveURL(/#level4$/);
    await expect(page.locator("#nextBtn")).toBeDisabled();
    await expect(page.locator(".start-box")).toHaveText("You start the conversation. Try: \"Hi, welcome to Stylez! How may I assist you?\"");
    await expect(page.locator(".stages-box")).toHaveText("Try to use the four stages from Level 2: approach Suzzie, present product information, close positively, and if there's a problem, perform service recovery.");
    await expect(page.locator(".gem-btn")).toHaveText("Open Suzzie (new tab)");
    await expect(page.locator(".gem-btn")).toHaveAttribute("href", "https://gemini.google.com/gem/52ae797badcf?usp=sharing");
    await expect(page.locator(".tick-row")).toHaveText("I have finished serving Suzzie.");
    await expect(page.locator("#nextBtn")).toHaveText("Next: Reflect →");
    await expect(page.locator("#nextBtn")).toBeDisabled();
    await checkPage(page, testInfo, "slice4-level4-roleplay");
    await page.locator(".tick-input").check();
    await page.click("#nextBtn");

    await expect(page.locator("#part0 > p").first()).toHaveText("Think about your roleplay with Suzzie.");
    await expect(page.locator(".story-card .field-label")).toHaveText([
      "1. What is one thing you feel you did well when serving Suzzie?",
      "2. What is one thing you would do differently next time?"
    ]);
    await expect(page.locator(".story-card textarea").nth(0)).toHaveAttribute("placeholder", "I did well at...");
    await expect(page.locator(".story-card textarea").nth(1)).toHaveAttribute("placeholder", "Next time, I would...");
    await page.fill('textarea[data-answer="s4.q1"]', "I greeted her straight away.");
    await page.click("#submitL4");
    await expect(page.locator("#notFinished .missing-list li")).toHaveText(["✗ Box 2"]);
    await expect(page.locator("#notFinished button")).toHaveText(["Go back"]);
    await page.locator("#notFinished button").click();
    await page.fill('textarea[data-answer="s4.q2"]', "Next time, I would ask more questions.");
    await checkPage(page, testInfo, "slice4-level4-reflect");
    await page.click("#submitL4");
    await expect(page.locator(".recap-card p")).toHaveText("Look back at the four stages. Which one would you like to practise more?");
    await expect(page.locator(".story-card textarea").first()).toHaveAttribute("readonly", "");
    await checkPage(page, testInfo, "slice4-level4-recap");
    await page.click("#finishBtn");
    await expect(page.locator("#badgeModal h2")).toHaveText("Service Star");
    await expect(page.locator("#badgeModal .badge-pop-text")).toHaveText("You earned the Service Star badge!");
    await page.locator("#badgeModal button").click();
    await expect(page.locator(".status-pill").nth(3)).toHaveText("Service Star");
    expect(errors).toEqual([]);
  });
});

test.describe("Level 5: Check and Exit Ticket", () => {
  test("Q3 to Q5 feedback, Next held back, exit ticket, Completion Champion", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await studentAt(page, request, 43, 5);
    await page.click("#levelCard5");
    await expect(page.locator("h1.page-title")).toHaveText("Level 5: Check and Exit Ticket");
    await expect(page.locator(".step-label")).toHaveText(["Check", "Exit ticket (locked)"]);
    await expect(page.locator("#part0 > p").first()).toHaveText("Try these without going back to the notes. It is okay to get some wrong!");
    await expect(page.locator("#l5q3")).toHaveText("Q3. True or false? Tap True or False for each.");
    await expect(page.locator(".tf-text")).toHaveText([
      "i. Customer service ends once the customer has paid.",
      "ii. Good product knowledge helps a customer service officer answer customer questions confidently.",
      "iii. Service recovery is complete once the staff member has apologised.",
      "iv. A service breakdown occurs when customers make a complaint about a product or service."
    ]);
    await expect(page.locator("#l5q4")).toHaveText("Q4. A customer at a mobile phone shop says, \"This is the third time I've called about the same faulty charger, and nobody has fixed it!\" Which response best shows good service recovery? Tap one.");
    await expect(page.locator(".mcq-btn .mcq-text")).toHaveText([
      "A. \"I'm sorry about that. Our chargers usually work fine, so it may be your phone.\"",
      "B. \"I'm sorry you've had to call so many times. Let me personally make sure this gets fixed today.\"",
      "C. \"I'm sorry about that. Please call our hotline again tomorrow, and they will check it for you.\"",
      "D. \"Thank you for telling us about this. I'll pass your feedback on to our team.\""
    ]);
    await expect(page.locator("#l5q5")).toHaveText("Q5. Explain why quality customer service matters to a business. Give ONE reason.");
    await expect(page.locator('[data-q="q5"] .field-label')).toHaveText("Quality customer service matters because");
    await expect(page.locator(".choice-btn.picked")).toHaveCount(0); // nothing pre-selected
    await expect(page.locator("#nextBtn")).toHaveCount(0);
    await checkPage(page, testInfo, "slice4-level5-check");

    await page.click("#submitL5");
    await expect(page.locator("#notFinished .missing-list li")).toHaveText(["✗ Q3 i", "✗ Q3 ii", "✗ Q3 iii", "✗ Q3 iv", "✗ Q4", "✗ Q5"]);
    await page.locator("#notFinished button").click();

    const tf = (id, label) => page.locator(`.tf-item[data-key="s5.q3.${id}"] .tf-btn`, { hasText: label });
    await tf("i", "True").click();     // wrong
    await tf("ii", "True").click();    // right
    await tf("iii", "True").click();   // wrong
    await tf("iv", "True").click();    // right
    await expect(tf("i", "True")).toHaveAttribute("aria-pressed", "true");
    await page.locator(".mcq-btn", { hasText: "Our chargers usually work fine" }).click(); // A: wrong
    await page.fill('textarea[data-answer="s5.q5"]', "customers return repeatedly, which keeps the business going.");
    await page.click("#submitL5");

    const fb = id => page.locator(`[data-key="${id}"] .feedback`);
    await expect(fb("s5.q3.i")).toHaveText("✗ Look back at what customer service means. Does it stop the moment the customer pays, or continue after the purchase?");
    await expect(fb("s5.q3.ii")).toHaveText("✓ Correct: knowing the product lets staff answer accurately instead of guessing.");
    await expect(fb("s5.q3.iii")).toHaveText("✗ Count the 8 steps of service recovery. Is apologising the last step?");
    await expect(fb("s5.q3.iv")).toHaveText("✓ Correct: that is the textbook definition of service breakdown.");
    await expect(fb("s5.q4")).toHaveText("✗ The staff member apologised, but then blamed the customer's phone. Which step is about acknowledging feelings and assuring help?");
    await expect(page.locator('[data-q="q5"] .check-note')).toHaveText("Check your answer: did you name one reason (customers return repeatedly, customers recommend the business to their relatives and friends, or customer loyalty ensures the continuity of the business) and explain what it means for the business?");
    await expect(page.locator("#nextBtn")).toHaveCount(0); // held back until Check again
    await checkPage(page, testInfo, "slice4-level5-feedback");

    // One Check again for the whole tab, at the bottom.
    await expect(page.locator("#checkAgainBtn")).toHaveCount(1);
    expect(await page.evaluate(() => {
      const b = document.getElementById("checkAgainBtn"), q5 = document.querySelector('[data-q="q5"]');
      return !!(q5.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);
    // Q3: i fixed, iii left (still wrong). Q4: changed to D (still wrong). One tap checks them all.
    await tf("i", "False").click();
    await expect(page.locator('[data-key="s5.q3.i"] .check-prompt')).toHaveText("Tap Check again to see if you're right.");
    await page.locator(".mcq-btn", { hasText: "pass your feedback on" }).click();
    await page.click("#checkAgainBtn");
    await expect(fb("s5.q3.i")).toHaveText("✓ Correct: customer service continues even after the customer has made a purchase.");
    await expect(fb("s5.q3.iii")).toHaveText("✗ The answer is False: apologising is only Step 3; the officer still needs to acknowledge feelings, ask questions and offer solutions.");
    await expect(fb("s5.q4")).toHaveText("✗ The answer is B: B acknowledges the customer's frustration and offers a solution: making sure the charger is fixed today.");
    await expect(page.locator("#checkAgainBtn")).toHaveCount(0);
    // Revealed answers: the right option outlined with "✓ Correct answer", the student's pick ✗.
    const iii = page.locator('.tf-item[data-key="s5.q3.iii"]');
    await expect(iii.locator(".tf-btn.correct-answer")).toHaveText("False");
    await expect(iii.locator(".right-tag")).toHaveText("✓ Correct answer");
    await expect(iii.locator(".tf-btn.wrong-pick")).toContainText("True");
    await expect(iii.locator(".tf-btn.wrong-pick .wrong-tag")).toHaveText("✗");
    await expect(page.locator(".mcq-btn.correct-answer .mcq-letter")).toHaveText("B");
    await expect(page.locator(".mcq-btn.correct-answer .right-tag")).toHaveText("✓ Correct answer");
    await expect(page.locator(".mcq-btn.wrong-pick .mcq-letter")).toHaveText("D");
    // Summary card: i, iii and Q4 were wrong on the first try (iii and Q4 share a line).
    const card = page.locator(".missed-card");
    await expect(card.locator("h3")).toHaveText("Let's learn from these");
    await expect(card.locator(".missed-intro")).toHaveText("Good effort! Here are 2 things to look at again:");
    await expect(card.locator("li")).toHaveText([
      "What customer service is (Level 2, Quality Customer Service)",
      "The 8 steps of service recovery (Level 2, Breakdown and Recovery)"
    ]);
    await expect(page.locator("#nextBtn")).toHaveText("Next: Exit ticket →");
    await checkPage(page, testInfo, "slice4-level5-resolved");
    await page.click("#nextBtn");

    // Exit ticket.
    await expect(page.locator('[data-q="q6"] .field-label')).toHaveText("Q6. What is one thing you have learnt about customer service?");
    await expect(page.locator('[data-q="q7"] .field-label')).toHaveText("Q7. What is one question you still have about this chapter?");
    await expect(page.locator('textarea[data-answer="s5.q6"]')).toHaveAttribute("placeholder", "One thing I learnt is...");
    await expect(page.locator('textarea[data-answer="s5.q7"]')).toHaveAttribute("placeholder", "I am still not sure about...");
    await expect(page.locator("#l5q8")).toHaveText("Q8. How confident are you that you can do each of these? Tap one face for each.");
    await expect(page.locator(".face-statement")).toHaveText([
      "I can explain why quality customer service matters to a business",
      "I can name the skills and qualities a good customer service employee needs",
      "I can describe the four stages of providing customer service",
      "I can explain what service breakdown is, and how to perform service recovery"
    ]);
    await expect(page.locator(".face-row").first().locator(".face-label")).toHaveText(["Not yet", "A little", "Confident", "Very confident"]);
    await expect(page.locator(".face-btn.picked")).toHaveCount(0);
    await expect(page.locator("#submitExit")).toHaveText("Submit my exit ticket");
    await page.fill('textarea[data-answer="s5.q6"]', "Service recovery has 8 steps.");
    await page.locator('.face-btn[data-key="s5.q8.1"][data-value="2"]').click();
    await page.click("#submitExit");
    await expect(page.locator("#notFinished .missing-list li")).toHaveText(["✗ Q7", "✗ Q8 (row 2)", "✗ Q8 (row 3)", "✗ Q8 (row 4)"]);
    await page.locator("#notFinished button").click();
    await page.fill('textarea[data-answer="s5.q7"]', "How do I close positively?");
    for (const [r, v] of [[2, 3], [3, 1], [4, 0]]) await page.locator(`.face-btn[data-key="s5.q8.${r}"][data-value="${v}"]`).click();
    await expect(page.locator(".face-btn.picked")).toHaveCount(4);
    await checkPage(page, testInfo, "slice4-level5-exit");
    const saved = waitForSave(page);
    await page.click("#submitExit");
    const modal = page.locator("#badgeModal");
    await expect(modal.locator("h2")).toHaveText("You've finished Chapter 6!");
    await expect(modal.locator(".badge-pop-text")).toHaveText("Completion Champion");
    await expect(modal.locator("button")).toHaveText(["See my learning report", "Back to my route"]);
    await checkPage(page, testInfo, "slice4-champion");
    await saved;
    await modal.locator("button", { hasText: "Back to my route" }).click();
    await expect(page.locator(".journey-count")).toHaveText("5 of 5 levels done");
    await expect(page.locator(".welcome-text")).toHaveText("Amazing work! You've finished all 5 levels. Have a look at your learning report to see how you did.");
    await expect(page.locator(".welcome-card a.btn")).toHaveText("My learning report"); // inside the welcome card
    await expect(page.locator("a.btn", { hasText: "My learning report" })).toHaveCount(1);

    // Readable columns in the Sheet: Q3 and Q4 first try (2 of 5 right) and confidence.
    const sheet = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), "ebs-ch6-playwright-data", "sheets.json"), "utf8"));
    const r = sheet.Students.find(x => x[0] === "3E1#43");
    expect(r[3]).toBe("5");
    expect(r[5]).toBe("2 / 5");
    expect(r.slice(6, 10)).toEqual(["Confident", "Very confident", "A little", "Not yet"]);

    // Finished: read-only exit ticket.
    await page.click("#levelCard5");
    await page.locator(".step-tab").nth(1).click();
    await expect(page.locator(".face-btn").first()).toBeDisabled();
    await expect(page.locator('textarea[data-answer="s5.q7"]')).toHaveAttribute("readonly", "");
    await expect(page.locator("#submitExit")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("all right first time: no Check again, Next straight away", async ({ page, request }) => {
    await studentAt(page, request, 44, 5);
    await page.goto("/#level5");
    for (const [id, label] of [["i", "False"], ["ii", "True"], ["iii", "False"], ["iv", "True"]]) {
      await page.locator(`.tf-item[data-key="s5.q3.${id}"] .tf-btn`, { hasText: label }).click();
    }
    await page.locator(".mcq-btn", { hasText: "Let me personally" }).click();
    await page.fill('textarea[data-answer="s5.q5"]', "customers recommend the business.");
    await page.click("#submitL5");
    await expect(page.locator(".feedback.right")).toHaveCount(5);
    await expect(page.locator(".feedback.wrong")).toHaveCount(0);
    await expect(page.locator("#checkAgainBtn")).toHaveCount(0);
    await expect(page.locator(".missed-card.all-good")).toHaveText("Great work!You got everything right on the first try.");
    await expect(page.locator("#nextBtn")).toBeVisible();
    await expect(page.locator(".tf-btn").first()).toBeDisabled();
  });
});
