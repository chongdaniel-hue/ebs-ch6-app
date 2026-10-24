// Slice 5: learning report and the rest of Teacher Mode (Results, This device).
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const {
  watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot,
  CODE, resetServer, apiGet, apiPost, login
} = require("./helpers");

async function checkPage(page, testInfo, name) {
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  if (name) await shot(page, testInfo, name);
}

const T = "2026-10-20T02:00:00.000Z";
const a = v => ({ v, t: T });
const att = (av, ok) => ({ a: av, ok, t: T });

// A finished student's record, as the app would save it. wrong: attempt keys wrong on the first try.
function finishedRecord(reg, { wrong = [], q7 = "", faces = [2, 3, 1, 0] } = {}) {
  const correct = { "s3q2.P": 3, "s3q2.Q": 1, "s3q2.R": 2, "s3q2.S": 0, "s5q3.i": false, "s5q3.ii": true, "s5q3.iii": false, "s5q3.iv": true, "s5q4": "B" };
  const first = {}, second = {};
  Object.keys(correct).forEach(k => {
    if (wrong.includes(k)) {
      const bad = typeof correct[k] === "number" ? (correct[k] + 1) % 4 : typeof correct[k] === "boolean" ? !correct[k] : "A";
      first[k] = att(bad, false);
      second[k] = att(correct[k], true);
    } else first[k] = att(correct[k], true);
  });
  const answers = {
    "s1.q1": a(`Good story ${reg}`), "s1.q2": a(`Bad story ${reg}`), "s1.q3": a("Staff who care"),
    "s2.think1": a("No, no solution was offered."), "s3.q1a": a("Knowledgeable"), "s3.q1b": a("Accurate answers"),
    "s4.q1": a("I greeted her"), "s4.q2": a("Ask more questions"), "s5.q5": a("customers return"),
    "s5.q6": a("8 steps"), "s5.q7": a(q7)
  };
  faces.forEach((f, i) => { answers[`s5.q8.${i + 1}`] = a(f); });
  return {
    v: 1, cls: "3E1", reg, updatedAt: T, baseClearedAt: "", agreed: T,
    done: { 1: T, 2: T, 3: T, 4: T, 5: T }, submitted: {}, reached: { "s2.tabs": 2, "s3.tabs": 1, "s4.tabs": 1, "s5.tabs": 1 },
    first, second, answers, ui: {}
  };
}

test.describe("6.1 My learning report", () => {
  test("levels, first-try scores, Look at these again, confidence", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1"]);
    expect((await apiPost(request, { action: "save", record: finishedRecord(5, { wrong: ["s3q2.R", "s5q3.iii", "s5q4", "s5q3.i"] }) })).ok).toBe(true);
    await login(page, "3E1", 5);
    await expect(page.locator(".welcome-text")).toHaveText("Amazing work! You've finished all 5 levels. Have a look at your learning report to see how you did.");
    await expect(page.locator(".home-learning-report a.btn")).toHaveText("My learning report");
    // Dates are in Singapore time: 1:30am on 20 Oct in Singapore is still 19 Oct in UTC.
    expect(await page.evaluate(() => shortDate("2026-10-19T17:30:00.000Z"))).toBe("20 Oct 2026");
    await page.click(".home-learning-report a.btn");
    await expect(page.locator("h1.page-title")).toHaveText("My learning report");
    await expect(page.locator(".level-sub")).toHaveText("Test Student 5 · Class 3E1, Register No. 5");
    await expect(page.locator(".report-level-name")).toHaveText([
      "Level 1: Your Customer Service Stories", "Level 2: Learn: Customer Service", "Level 3: Chat with Alex",
      "Level 4: Serve Suzzie at Stylez", "Level 5: Check and Exit Ticket"
    ]);
    await expect(page.locator(".report-level-when").first()).toHaveText("20 Oct 2026");
    await expect(page.locator(".report-level-badge")).toHaveText(["Story Sharer", "Service Scholar", "Service Spotter", "Service Star", "Completion Champion"]);
    await expect(page.locator(".report-scores .ic-body")).toHaveText(["Level 3, Q2: first try 3 / 4.", "Level 5, Q3 and Q4: first try 2 / 5."]);
    await expect(page.locator("#lookTitle")).toHaveText("Look at these again");
    await expect(page.locator(".look-list li")).toHaveText([
      "Closing the customer experience positively (Level 2, The Four Stages)",
      "What customer service is (Level 2, Quality Customer Service)",
      "The 8 steps of service recovery (Level 2, Breakdown and Recovery)"
    ]);
    await expect(page.locator("#confTitle")).toHaveText("How confident you felt");
    await expect(page.locator(".conf-row .conf-face")).toHaveText(["Confident", "Very confident", "A little", "Not yet"]);
    await expect(page.locator("#reportBack")).toHaveText("Back to my route");
    await checkPage(page, testInfo, "slice5-report");
    await page.click("#reportBack");
    await expect(page).toHaveURL(/#home$/);
    expect(errors).toEqual([]);
  });

  test("all right first time; opened from the Level 5 pop-up", async ({ page, request }, testInfo) => {
    await resetServer(request, ["3E1"]);
    const r = finishedRecord(6, { q7: "What is a refund?" });
    delete r.done["5"];
    await apiPost(request, { action: "save", record: r });
    await login(page, "3E1", 6);
    await expect(page.locator(".welcome-card")).toBeVisible();
    await page.goto("/#level5");
    await page.locator(".step-tab").nth(1).click();
    // Exit ticket answers are already saved; submit finishes the level.
    await page.evaluate(() => { rec.submitted["s5.check"] = new Date().toISOString(); saveLocal(); });
    await page.click("#submitExit");
    await page.locator("#badgeModal button", { hasText: "See my learning report" }).click();
    await expect(page).toHaveURL(/#report$/);
    await expect(page.locator(".look-none")).toHaveText("Nothing to look at again. You got everything right on the first try!");
    await expect(page.locator(".report-scores .ic-body")).toHaveText(["Level 3, Q2: first try 4 / 4.", "Level 5, Q3 and Q4: first try 5 / 5."]);
    await checkPage(page, testInfo, "slice5-report-allright");
  });
});

// Teacher Mode stays signed in while the page is open, so sign in only if asked.
async function teacherSignIn(page) {
  await page.goto("/#teacher");
  await expect(page.locator("#teacherCode, .tabs .tab").first()).toBeVisible();
  if (await page.locator("#teacherCode").count()) {
    await page.fill("#teacherCode", CODE());
    await page.click("#teacherEnter");
  }
  await expect(page.locator(".tabs .tab").first()).toHaveText("Classes");
}

test.describe("T.3 Results", () => {
  test("class summary, students table, full report, CSV, clear a student's work", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1", "4A"]);
    await apiPost(request, { action: "save", record: finishedRecord(1, { wrong: ["s3q2.R"], q7: "How do I close positively?" }) });
    await apiPost(request, { action: "save", record: finishedRecord(2, { wrong: ["s3q2.R", "s5q4"], faces: [3, 3, 3, 3] }) });
    const partial = finishedRecord(3);
    partial.done = { 1: T, 2: T };
    partial.first = {}; partial.second = {};
    await apiPost(request, { action: "save", record: partial });
    // A removed class with saved work is still choosable.
    await apiPost(request, { action: "save", record: Object.assign(finishedRecord(9), { cls: "4A" }) });
    await apiPost(request, { action: "removeClass", code: CODE(), name: "4A" });

    await teacherSignIn(page);
    await expect(page.locator(".tabs .tab")).toHaveText(["Classes", "Results", "This device"]);
    await page.click("#tab_results");
    await expect(page.locator("#resultsClass option")).toHaveText(["Choose a class…", "3E1", "4A (removed)"]);
    expect(await page.locator("#resultsClass").inputValue()).toBe("");
    await page.selectOption("#resultsClass", "3E1");

    const sum = page.locator(".results-summary");
    await expect(sum.locator("#sumTitle")).toHaveText("Class summary: 3E1");
    await expect(sum.locator(".sum-list").first().locator("li")).toHaveText(["Level 1: 3 of 3", "Level 2: 3 of 3", "Level 3: 2 of 3", "Level 4: 2 of 3", "Level 5: 2 of 3"]);
    await expect(sum.locator(".sum-list").nth(1).locator("li").first()).toHaveText("Q2 R (answer: Closing the customer experience positively): wrong for 2 of 2");
    await expect(sum.locator(".sum-list").nth(1).locator("li").nth(1)).toHaveText("Q4 (answer: B): wrong for 1 of 2");
    // Confidence spread, row 1: Confident for students 1 and 3, Very confident for student 2.
    await expect(sum.locator("tbody tr").first().locator("td")).toHaveText(["0", "0", "2", "1"]);
    await expect(sum.locator(".sum-list").last().locator("li")).toHaveText(["No. 1: How do I close positively?"]);

    const rows = page.locator(".students-table tbody tr");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator("td")).toHaveText(["No. 1", "5", "3 / 4", "5 / 5", ""]);
    await expect(rows.nth(2).locator("td")).toHaveText(["No. 3", "2", "–", "–", ""]);
    await checkPage(page, testInfo, "slice5-results");

    // CSV for the chosen class, named with the Singapore date (1:30am on 20 Oct in Singapore).
    await page.clock.setFixedTime(new Date("2026-10-19T17:30:00.000Z"));
    const [download] = await Promise.all([page.waitForEvent("download"), page.click("#downloadCsv")]);
    expect(download.suggestedFilename()).toBe("EBS-Ch6-3E1-results-2026-10-20.csv");
    const csv = fs.readFileSync(await download.path(), "utf8");
    const lines = csv.replace(/^﻿/, "").split("\r\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("Register No.,Student name,Levels done,Level 1 finished");
    expect(lines[0]).toContain("Q2 R first try,Q2 R second try");
    expect(lines[1]).toContain("3E1,1,,5,");
    expect(lines[1]).toContain("Closing the customer experience positively (right)");
    expect(lines[1]).toContain("How do I close positively?");

    // A student's full report.
    await rows.nth(1).click();
    await expect(page.locator("#stuTitle")).toHaveText("Class 3E1, Register No. 2");
    await expect(page.locator(".qa").first()).toHaveText("1. Think of a time you got GOOD customer service (e.g. at a bubble tea shop, a hawker stall, or when ordering on GrabFood). What did the staff do?Good story 2");
    const q2Row = page.locator(".student-report table").first().locator("tbody tr").nth(2);
    await expect(q2Row.locator("td")).toHaveText(["Performing service recovery (wrong)", "Closing the customer experience positively (right)"]);
    await expect(page.locator(".qa", { hasText: "Was this good service recovery" }).locator(".qa-a")).toHaveText("No, no solution was offered.");
    await expect(page.locator(".student-report table").nth(1).locator("tbody tr").last().locator("th")).toHaveText("Q4. Best service recovery response");
    await expect(page.locator(".qa", { hasText: "Name ONE item Uniqlo" }).locator(".qa-a")).toHaveText("(blank)");
    await checkPage(page, testInfo, "slice5-student-report");

    // Clear this student's work.
    await page.click("#clearStudent");
    await expect(page.locator("#clearModal p")).toHaveText("Clear all work for Student, Class 3E1, Register No. 2? This deletes their answers, first attempts, badges and progress, and cannot be undone. Download the CSV first if you want a copy.");
    await expect(page.locator("#clearModal button")).toHaveText(["Clear work", "Cancel"]);
    await checkPage(page, testInfo, "slice5-clear-popup");
    await page.locator("#clearModal button", { hasText: "Cancel" }).click();
    await expect(page.locator("#stuTitle")).toBeVisible();
    await page.click("#clearStudent");
    await page.locator("#clearModal button", { hasText: "Clear work" }).click();
    await expect(page.locator("#resultsBody .notice")).toHaveText("Work cleared. This student starts again from Level 1 the next time they log in.");
    await expect(rows.nth(1).locator("td").first()).toHaveText("No. 2 (cleared)");
    const loaded = await apiGet(request, { action: "load", class: "3E1", reg: "2" });
    expect(loaded.record).toBeNull();
    expect(loaded.clearedAt).toBeTruthy();

    // The removed class can still be read.
    await page.selectOption("#resultsClass", "4A");
    await expect(page.locator(".students-table tbody tr")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});

test.describe("T.4 This device", () => {
  test("unlock all levels, then turn it off", async ({ page, request }, testInfo) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 7);
    await page.click("#briefing button");
    await expect(page.locator(".status-pill").nth(4)).toHaveText("Locked");
    await teacherSignIn(page);
    await page.click("#tab_device");
    await page.click("#unlockToggle");
    await expect(page.locator(".device-card .notice")).toHaveText("All levels are unlocked on this device.");
    await expect(page.locator("#unlockToggle")).toHaveText("Turn off");
    await checkPage(page, testInfo, "slice5-device");
    await page.goto("/#home");
    await expect(page.locator(".status-pill").nth(4)).toHaveText("Not started");
    await page.click("#levelCard5");
    await expect(page.locator("h1.page-title")).toHaveText("Level 5: Check and Exit Ticket");
    await teacherSignIn(page);
    await page.click("#tab_device");
    await page.click("#unlockToggle");
    await expect(page.locator("#unlockToggle")).toHaveText("Unlock all levels on this device");
    await page.goto("/#home");
    await expect(page.locator(".status-pill").nth(4)).toHaveText("Locked");
  });

  test("Reset this device asks for the code again and keeps the work on the server", async ({ page, request }) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 8);
    await page.click("#briefing button");
    await page.evaluate(() => { setAnswer("s1.q1", "My story", "now"); });
    await expect.poll(async () => (await apiGet(request, { action: "load", class: "3E1", reg: "8" })).record?.answers?.["s1.q1"]?.v, { timeout: 15000 }).toBe("My story");
    await teacherSignIn(page);
    await page.click("#tab_device");
    await page.click("#resetDevice");
    await page.fill("#resetCode", "not-the-code");
    await page.locator("#resetModal .modal-btns .btn", { hasText: "Reset" }).click();
    await expect(page.locator("#resetModal .form-error")).toHaveText("Incorrect code.");
    await page.fill("#resetCode", CODE().toLowerCase());
    await page.locator("#resetModal .modal-btns .btn", { hasText: "Reset" }).click();
    await expect(page.locator(".device-card").first().locator("xpath=..").locator("> .notice")).toHaveText("Device reset. It is ready for the next student.");
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys.filter(k => k.startsWith("ch6_rec_"))).toEqual([]);
    expect(keys).not.toContain("ch6_active");
    await page.goto("/");
    await expect(page.locator(".login-card")).toBeVisible();
    // Logging in again brings the work back from the server.
    await page.selectOption("#classInput", "3E1");
    await page.selectOption("#regInput", "8");
    await page.fill("#nameInput", "Test Student 8");
    await page.click("#startBtn");
    await expect(page.locator(".welcome-card")).toBeVisible();
    await page.goto("/#level1");
    await expect(page.locator('textarea[data-answer="s1.q1"]')).toHaveValue("My story");
  });
});
