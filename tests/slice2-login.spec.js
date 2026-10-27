// Slice 2: back end, log-in, Before you start, home, 4 key terms, Switch student,
// saving and loading, offline behaviour, Teacher Mode sign-in and Classes tab.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot,
  CODE, resetServer, apiPost, apiGet, login, waitForSave
} = require("./helpers");

const BRIEFING = [
  "Go through the levels in order. Each one opens when you finish the one before.",
  "Your work saves automatically. You can stop and come back any time, even on a different device: just log in with the same class and register number.",
  "Levels 3 and 4 open an AI chatbot in a new tab. Log in with your school Google account if asked, and don't share personal details in the chat.",
  "After you submit, you'll see a hint for anything you got wrong, and you get one more try.",
  "Your teacher can see your answers, so do your best."
];

async function checkPage(page, testInfo, name) {
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  if (name) await shot(page, testInfo, name);
}

test.describe("landing and log-in", () => {
  test("no registration class yet: message shown", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, []);
    await page.goto("/");
    await expect(page.locator("#classNote")).toHaveText("No classes are available to select yet. Ask your teacher.");
    await expect(page.locator("#classInput")).toHaveAttribute("readonly", "");
    await checkPage(page, testInfo, "slice2-landing-no-classes");
    expect(errors).toEqual([]);
  });

  test("first visit offline: class list cannot load", async ({ page, request }) => {
    await resetServer(request, ["3E1"]);
    await page.route("**/api?*", r => r.abort());
    await page.goto("/");
    await expect(page.locator("#classNote")).toHaveText("Connect to the internet to load your class list, then refresh this page.");
    await expect(page.locator("#classInput")).toHaveAttribute("readonly", "");
  });

  test("log-in checks, nothing pre-selected", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1", "4A"]);
    await page.goto("/");
    await expect(page.locator("#classInput")).toHaveValue("3E1");
    expect(await page.locator("#classInput").inputValue()).toBe("3E1");
    expect(await page.locator("#regInput").inputValue()).toBe("");
    await expect(page.locator(".login-card h2")).toHaveText("Step 1: Log in");
    await expect(page.locator(".topbar-chip")).toHaveText("3E1");
    await expect(page.locator("label[for=regInput]")).toHaveText("Choose your register number.");
    await expect(page.locator("#regInput option")).toHaveText(["Choose your register number…",...Array.from({length:50},(_,i)=>String(i+1))]);
    await checkPage(page, testInfo, "slice2-landing");

    const err = page.locator("#loginError");
    await page.click("#startBtn");

    await expect(err).toHaveText("Please choose your register number.");
    await page.locator("#regInput").selectOption("40");
    expect(await page.locator("#regInput").inputValue()).toBe("40");
    expect(errors).toEqual([]);
  });
});

test.describe("new student", () => {
  test("Before you start, home page, locks and 4 key terms", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 12);

    const modal = page.locator("#briefing");
    await expect(modal.locator("h2")).toHaveText("Before you start");
    await expect(modal.locator("li > span:last-child")).toHaveText(BRIEFING);
    await expect(modal.locator("button")).toHaveText("I'm ready");
    await checkPage(page, testInfo, "slice2-before-you-start");

    // Until "I'm ready", every page shows the pop-up.
    await page.goto("/#terms");
    await expect(page.locator("#briefing")).toBeVisible();
    await page.goto("/#level1");
    await expect(page.locator("#briefing")).toBeVisible();
    await page.click("#briefing button");
    await expect(page.locator("#briefing")).toHaveCount(0);
    expect(page.url()).toMatch(/#home$/);

    await expect(page.locator(".topbar-chip")).toHaveText("Test Student 12 · 3E1 · Register No. 12");
    await expect(page.locator(".welcome-text")).toHaveText("Welcome to Chapter 6: Customer Service! In 5 short levels, you'll find out what great customer service looks like, chat with an AI customer service officer, and even serve a customer yourself. Take your time, and do your best. Start with Level 1 below. You've got this!");
    await expect(page.locator(".notice")).toHaveCount(0);
    await expect(page.locator("#howLink")).toHaveText("How this works");
    await expect(page.locator("#switchLink")).toHaveText("Sharing this device? Switch student");
    await expect(page.locator(".terms-card")).toContainText("Start here: 4 key terms");
    await expect(page.locator(".terms-card")).toContainText("A 1-minute look before Level 2");
    await expect(page.locator(".journey-count")).toHaveText("0 of 5 levels done");
    await expect(page.locator(".level-name")).toHaveText([
      "Level 1: Your Customer Service Stories", "Level 2: Learn: Customer Service",
      "Level 3: Chat with Alex", "Level 4: Serve Suzzie at Stylez", "Level 5: Check and Exit Ticket"
    ]);
    await expect(page.locator(".level-desc")).toHaveText([
      "Think about your own experiences as a customer.",
      "Short notes on quality customer service, the four stages and service recovery.",
      "Be the customer. Chat with Nexora's customer service officer.",
      "Switch roles. Now you're the customer service officer.",
      "Check what you've learnt and tell your teacher how confident you feel."
    ]);
    await expect(page.locator(".status-pill")).toHaveText(["Not started", "Locked", "Locked", "Locked", "Locked"]);
    await expect(page.locator(".shelf-name")).toHaveText([
      "Story Sharer, not earned yet", "Service Scholar, not earned yet", "Service Spotter, not earned yet",
      "Service Star, not earned yet", "Completion Champion, not earned yet"
    ]);
    await expect(page.locator("a[href='#report']")).toHaveCount(0);
    await checkPage(page, testInfo, "slice2-home");

    // A locked level cannot be opened: tapping explains, typing its address goes home.
    await page.click("#levelCard3", { force: true }); // marked aria-disabled; a tap only explains
    await expect(page.locator("#lockedMsg3")).toHaveText("Finish Level 2 first to open this level.");
    expect(page.url()).toMatch(/#home$/);
    await page.goto("/#level2");
    await expect(page.locator(".journey-count")).toBeVisible();
    expect(page.url()).toMatch(/#home$/);

    // Level 1 is open.
    await page.click("#levelCard1");
    await expect(page.locator("h1.page-title")).toHaveText("Level 1: Your Customer Service Stories");
    await page.click("#homeBtn");

    // "How this works" reopens the pop-up with Close.
    await page.click("#howLink");
    await expect(page.locator("#briefing button")).toHaveText("Close");
    await page.click("#briefing button");

    await page.click(".terms-card");
    await expect(page.locator("h1.page-title")).toHaveText("4 key terms");
    await expect(page.locator(".lead")).toHaveText("You'll meet these words in Level 2. Read them once now.");
    await expect(page.locator(".term-list .definition")).toHaveCount(4);
    const termIcons = page.locator(".term-graphic img");
    await expect(termIcons).toHaveCount(4);
    await expect.poll(() => termIcons.evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    const termStyle = await page.locator(".term-list .definition").evaluateAll(cards => cards.map(card => ({
      colour: getComputedStyle(card).backgroundColor,
      ratio: card.querySelector(".term-graphic").getBoundingClientRect().width / (1.5 * parseFloat(getComputedStyle(document.documentElement).fontSize))
    })));
    expect(new Set(termStyle.map(s => s.colour)).size).toBe(4);
    termStyle.forEach(s => expect(s.ratio).toBeCloseTo(2.5));
    // Plain English and an example first, then the exact textbook definition as "Exam wording".
    await expect(page.locator(".term-list .def-body > p:first-child")).toHaveText([
      "Customer service: what a business does to keep customers happy. It starts when you walk in and continues after you pay.",
      "Quality customer service: doing MORE than the customer expects.",
      "Service breakdown: something goes wrong and the customer complains.",
      "Service recovery: the business fixes the problem and wins the customer back."
    ]);
    await expect(page.locator(".term-list .term-example")).toHaveText([
      "Example: staff help you find your size.",
      "Example: the bubble tea staff remember your usual order.",
      "Example: your new earbuds don't work.",
      "Example: staff say sorry and replace the earbuds."
    ]);
    await expect(page.locator(".term-list .exam-label")).toHaveText(Array(4).fill("Exam wording"));
    await expect(page.locator(".term-list .exam-wording > p:last-child")).toHaveText([
      "Customer service refers to what businesses do for their customers so that they are happy and satisfied.",
      "Quality customer service means doing more for customers to exceed their expectations.",
      "A service breakdown occurs when customers make a complaint about a product or service.",
      "Service recovery is a process whereby a business takes action in response to service breakdown or failure."
    ]);
    await checkPage(page, testInfo, "slice2-terms");
    await page.click("#termsDone");
    expect(page.url()).toMatch(/#home$/);
    expect(errors).toEqual([]);
  });
});

test.describe("saving and loading", () => {
  test("work saves to the server, reloads, and loads on a second browser", async ({ page, request, browser }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 7);
    const saved = waitForSave(page);
    await page.click("#briefing button");
    await saved; // Registration can save before the later briefing agreement.
    await expect.poll(async()=>{const r=await apiGet(request,{action:"load",class:"3E1",reg:"7"});return !!(r.record && r.record.agreed);},{timeout:20000}).toBe(true);

    const row = await apiGet(request, { action: "load", class: "3E1", reg: "7" });
    expect(row.ok).toBe(true);
    expect(row.record.agreed).toBeTruthy();

    // Reload: still logged in, no pop-up.
    await page.reload();
    await expect(page.locator(".journey-count")).toBeVisible();
    await expect(page.locator("#briefing")).toHaveCount(0);

    // A second browser profile (another device).
    const other = await browser.newContext(testInfo.project.use);
    const page2 = await other.newPage();
    const errors2 = watchErrors(page2);
    await login(page2, "3E1", 7);
    await expect(page2.locator(".notice")).toHaveCount(0); // no separate notice: the welcome card covers it
    await expect(page2.locator("#briefing")).toHaveCount(0);
    await checkPage(page2, testInfo, "slice2-home-welcome-back");
    await other.close();
    expect(errors).toEqual([]);
    expect(errors2).toEqual([]);
  });

  test("Switch student keeps work on the server and removes the device copy", async ({ page, request }, testInfo) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 8);
    const saved = waitForSave(page);
    await page.click("#briefing button");
    await saved;
    await page.click("#switchLink");
    await expect(page.locator("#switchModal p")).toHaveText("Log in as a different student? The work for Class 3E1, Register No. 8 stays saved.");
    await expect(page.locator("#switchModal button")).toHaveText(["Switch student", "Cancel"]);
    await checkPage(page, testInfo, "slice2-switch-student");
    await page.locator("#switchModal button", { hasText: "Cancel" }).click();
    await expect(page.locator("#switchModal")).toHaveCount(0);
    await page.click("#switchLink");
    await page.locator("#switchModal button", { hasText: "Switch student" }).click();
    await expect(page.locator(".login-card")).toBeVisible();
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).not.toContain("ch6_rec_3E1#8");
    expect(keys).not.toContain("ch6_active");
    // Logging in again loads the work from the server.
    await expect(page.locator("#classInput")).toHaveValue("3E1");
    await page.selectOption("#regInput", "8");
    await page.fill("#nameInput", "Test Student 8");
    await page.click("#startBtn");
    await expect(page.locator(".welcome-card")).toBeVisible();
  });

  test("offline: uses the device copy and shows the yellow bar until the server is back", async ({ page, request }, testInfo) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 9);
    await page.click("#briefing button");
    // Log out without the save reaching the server, so only this device has the work.
    await page.route("**/api", r => r.abort());
    await page.click("#switchLink");
    await page.locator("#switchModal button", { hasText: "Switch student" }).click();
    expect(await page.evaluate(() => !!localStorage.getItem("ch6_rec_3E1#9"))).toBe(true); // unsent, so kept

    await page.route("**/api?*", r => r.abort());
    await expect(page.locator("#classInput")).toHaveValue("3E1"); // the class list was cached on this device
    await page.selectOption("#regInput", "9");
    await page.fill("#nameInput", "Test Student 9");
    await page.click("#startBtn");
    await expect(page.locator(".welcome-card")).toBeVisible();
    await expect(page.locator("#briefing")).toHaveCount(0); // "I'm ready" from this device's copy
    await expect(page.locator("#netBanner")).toHaveText("No internet. Your work is saved on this device and will be sent when the connection is back.");
    await checkPage(page, testInfo, "slice2-offline");

    // Connection back: the queued work is sent and the bar goes.
    await page.unroute("**/api");
    await page.unroute("**/api?*");
    const saved = waitForSave(page, 60000);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await saved;
    await expect(page.locator("#netBanner")).toHaveCount(0, { timeout: 5000 });
    const row = await apiGet(request, { action: "load", class: "3E1", reg: "9" });
    expect(row.record.agreed).toBeTruthy();
  });

  test("a busy server is retried, with the waiting bar meanwhile", async ({ page, request }) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 10);
    await request.post("/__test/busy?n=1");
    const busyReply = page.waitForResponse(r => r.url().endsWith("/api") && r.request().method() === "POST" && JSON.parse(r.request().postData()).action === "save", { timeout: 25000 });
    await page.click("#briefing button");
    expect((await (await busyReply).json()).error).toBe("busy");
    await expect(page.locator("#netBanner")).toHaveText("Your answers have not been sent yet. They are safe on this device. We will keep trying.", { timeout: 5000 });
    await waitForSave(page, 15000); // retried after about 5 seconds
    await expect(page.locator("#netBanner")).toHaveCount(0, { timeout: 5000 });
  });

  test("cleared work: an older device copy is thrown away", async ({ page, request }) => {
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 11);
    const saved = waitForSave(page);
    await page.click("#briefing button");
    await saved;
    // Keep this device's copy, then the teacher clears the student's work.
    await page.evaluate(() => { localStorage.removeItem("ch6_active"); });
    const cleared = await apiPost(request, { action: "clearStudent", code: CODE(), class: "3E1", reg: 11 });
    expect(cleared.ok).toBe(true);
    await page.goto("/");
    await expect(page.locator("#classInput")).toHaveValue("3E1");
    await page.selectOption("#regInput", "11");
    await page.fill("#nameInput", "Test Student 11");
    await page.click("#startBtn");
    await expect(page.locator("#briefing button")).toHaveText("I'm ready"); // starts again
    await expect(page.locator(".notice")).toHaveCount(0);
    // A save from a copy made before the clear is refused.
    const stale = await apiPost(request, { action: "save", record: { cls: "3E1", reg: 11, updatedAt: new Date().toISOString(), baseClearedAt: "" } });
    expect(stale.error).toBe("cleared");
  });
});

test.describe("Teacher Mode", () => {
  test("sign in and Classes tab", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, []);
    await page.goto("/#teacher");
    await page.fill("#teacherCode", "not-the-code");
    await page.click("#teacherEnter");
    await expect(page.locator("#teacherError")).toHaveText("Incorrect code.");
    await page.fill("#teacherCode", CODE());
    await page.press("#teacherCode", "Enter");
    await expect(page.locator(".tab.current")).toHaveText("Classes");
    await expect(page.locator(".section-title")).toHaveText("Your classes");
    await expect(page.locator(".add-class .field-note")).toHaveText("The selected class appears at the top left of the student sign-in page. New students register in that class. Select another class to change registration.");
    await expect(page.locator("#newClass")).toHaveAttribute("placeholder", "e.g. 3E1");

    const err = page.locator("#classError");
    await page.click("#addClassBtn");
    await expect(err).toHaveText("Key in a class name.");
    await page.fill("#newClass", "   ");
    await page.click("#addClassBtn");
    await expect(err).toHaveText("Key in a class name.");
    await page.fill("#newClass", "x".repeat(21));
    await page.click("#addClassBtn");
    await expect(err).toHaveText("Class names can be at most 20 characters.");
    let n = 0;
    for (const name of [" 3E1 ", "4A", "3E2"]) {
      await page.fill("#newClass", name);
      await page.click("#addClassBtn");
      await expect(page.locator(".class-name")).toHaveCount(++n);
    }
    await expect(page.locator(".class-name")).toHaveText(["3E1", "4A", "3E2"]);
    await page.fill("#newClass", "3e1");
    await page.click("#addClassBtn");
    await expect(page.locator("#classError")).toHaveText("3e1 is already in your classes.");
    await checkPage(page, testInfo, "slice2-teacher-classes");

    await page.locator(".class-row", { hasText: "4A" }).locator("button").click();
    await expect(page.locator("#removeClassModal p")).toHaveText("Remove 4A? Students' saved answers are kept.");
    await expect(page.locator("#removeClassModal button")).toHaveText(["Remove", "Cancel"]);
    await page.locator("#removeClassModal button", { hasText: "Remove" }).click();
    await expect(page.locator(".class-name")).toHaveText(["3E1", "3E2"]);

    // Students see the same list, in this order.
    await page.goto("/");
    await expect(page.locator("#classInput")).toHaveValue("3E1");
    expect(errors).toEqual([]);
  });

  test("teacher code ignores capitals and spaces", async ({ page, request }) => {
    await resetServer(request, []);
    const code = CODE();
    expect(code).toMatch(/[A-Z]/);
    for (const variant of [code.toLowerCase(), "  " + code + " ", " " + code.toLowerCase() + "  "]) {
      expect((await apiPost(request, { action: "teacherCheck", code: variant })).ok, JSON.stringify(variant)).toBe(true);
    }
    await page.goto("/#teacher");
    await page.fill("#teacherCode", " " + code.toLowerCase() + " ");
    await page.click("#teacherEnter");
    await expect(page.locator(".tab.current")).toHaveText("Classes");
    expect((await apiPost(request, { action: "teacherCheck", code: code + "x" })).error).toBe("bad_code");
  });

  test("teacher code lock-out after 10 wrong codes", async ({ page, request }) => {
    await resetServer(request, []);
    for (let i = 0; i < 9; i++) expect((await apiPost(request, { action: "teacherCheck", code: "wrong" })).error).toBe("bad_code");
    await page.goto("/#teacher");
    await page.fill("#teacherCode", "wrong");
    await page.click("#teacherEnter");
    await expect(page.locator("#teacherError")).toHaveText("Too many wrong codes. Wait 10 minutes and try again.");
    expect((await apiPost(request, { action: "teacherCheck", code: CODE() })).error).toBe("locked_out");
  });
});

test.describe("back end rules", () => {
  test("the app and Code.gs merge two copies the same way", async ({ page }) => {
    await page.goto("/");
    const vm = require("vm");
    const ctx = vm.createContext({ console });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "apps-script", "Code.gs"), "utf8"), ctx);
    const t = (m) => `2026-10-19T0${m}:00:00.000Z`;
    const a = {
      cls: "3E1", reg: 3, updatedAt: t(2), baseClearedAt: "", agreed: t(3),
      done: { 1: t(4) }, submitted: { s1: t(4) }, reached: { "s2.tab": 2 },
      first: { "s3q2.P": { a: "x", ok: true, t: t(1) } }, second: {},
      answers: { "s1.q1": { v: "old", t: t(1) }, "s1.q2": { v: "mine", t: t(5) } }, ui: { "s2.tab": { v: 1, t: t(1) } }
    };
    const b = {
      cls: "3E1", reg: 3, updatedAt: t(6), baseClearedAt: "", agreed: t(1),
      done: { 1: t(2), 2: t(6) }, submitted: {}, reached: { "s2.tab": 1, "s2.t0.parts": 3 },
      first: { "s3q2.P": { a: "y", ok: false, t: t(6) }, "s3q2.Q": { a: "z", ok: true, t: t(6) } }, second: {},
      answers: { "s1.q1": { v: "new", t: t(6) }, "s1.q2": { v: "theirs", t: t(2) } }, ui: {}
    };
    const fromApp = await page.evaluate(([a, b]) => mergeRecords(a, b), [a, b]);
    const fromScript = JSON.parse(JSON.stringify(ctx.mergeRecords(a, b)));
    expect(fromApp).toEqual(fromScript);
    expect(fromApp.answers["s1.q1"].v).toBe("new");     // newest box wins
    expect(fromApp.answers["s1.q2"].v).toBe("mine");
    expect(fromApp.first["s3q2.P"].a).toBe("x");         // first attempt never overwritten
    expect(fromApp.first["s3q2.Q"].a).toBe("z");
    expect(fromApp.done).toEqual({ 1: t(2), 2: t(6) });  // finished levels never removed
    expect(fromApp.agreed).toBe(t(1));
    expect(fromApp.reached).toEqual({ "s2.tab": 2, "s2.t0.parts": 3 });
    expect(fromApp.updatedAt).toBe(t(6));
  });

  test("save rules: class, register number, size limit", async ({ request }) => {
    await resetServer(request, ["3E1"]);
    const save = (record) => apiPost(request, { action: "save", record });
    expect((await save({ cls: "9Z", reg: 1 })).error).toBe("no_class");
    expect((await save({ cls: "3E1", reg: 0 })).error).toBe("bad_reg");
    expect((await save({ cls: "3E1", reg: 51 })).error).toBe("bad_reg");
    expect((await save({ cls: "3E1", reg: 2.5 })).error).toBe("bad_reg");
    expect((await save({ cls: "3E1", reg: 1, answers: { big: { v: "x".repeat(40001), t: "" } } })).error).toBe("too_big");
    expect((await save({ cls: "3E1", reg: 1 })).ok).toBe(true);
    // The sheet keeps "3E1" as text, not the number 30.
    const sheet = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), "ebs-ch6-playwright-data", "sheets.json"), "utf8"));
    expect(sheet.Classes[1][0]).toBe("3E1");
    expect(sheet.Students[0]).toEqual(["Key", "Class", "Register No.", "Levels finished", "Q2 first try", "Q3 and Q4 first try",
      "Confidence 1", "Confidence 2", "Confidence 3", "Confidence 4", "Last saved", "Cleared at", "Record"]);
  });
});
