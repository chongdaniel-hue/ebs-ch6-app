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
  "Go through the stations in order. Each one opens when you finish the one before.",
  "Your work saves automatically. You can stop and come back any time, even on a different device: just log in with the same class and register number.",
  "Stations 3 and 4 open an AI chatbot in a new tab. Log in with your school Google account if asked, and don't share personal details in the chat.",
  "After you submit, you'll see a hint for anything you got wrong, and you get one more try.",
  "Your teacher can see your answers, so do your best."
];

async function checkPage(page, testInfo, name) {
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  if (name) await shot(page, testInfo, name);
}

test.describe("landing and log-in", () => {
  test("no classes yet: dropdown greyed with a message", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, []);
    await page.goto("/");
    await expect(page.locator("#classNote")).toHaveText("Your teacher hasn't added your class yet. Ask your teacher to add it.");
    await expect(page.locator("#classInput")).toBeDisabled();
    await checkPage(page, testInfo, "slice2-landing-no-classes");
    expect(errors).toEqual([]);
  });

  test("first visit offline: class list cannot load", async ({ page, request }) => {
    await resetServer(request, ["3E1"]);
    await page.route("**/api?*", r => r.abort());
    await page.goto("/");
    await expect(page.locator("#classNote")).toHaveText("Connect to the internet to load your class list, then refresh this page.");
    await expect(page.locator("#classInput")).toBeDisabled();
  });

  test("log-in checks, nothing pre-selected", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1", "4A"]);
    await page.goto("/");
    await expect(page.locator("#classInput option")).toHaveText(["Choose your class…", "3E1", "4A"]);
    expect(await page.locator("#classInput").inputValue()).toBe("");
    expect(await page.locator("#regInput").inputValue()).toBe("");
    await expect(page.locator(".login-card h2")).toHaveText("Step 1: Log in");
    await expect(page.locator("label[for=classInput]")).toHaveText("Choose your class.");
    await expect(page.locator("label[for=regInput]")).toHaveText("Key in your register number.");
    await expect(page.locator("#regInput")).toHaveAttribute("placeholder", "e.g. 12");
    await expect(page.locator("#regInput")).toHaveAttribute("inputmode", "numeric");
    await checkPage(page, testInfo, "slice2-landing");

    const err = page.locator("#loginError");
    await page.click("#startBtn");
    await expect(err).toHaveText("Please choose your class.");
    await page.selectOption("#classInput", "3E1");
    await page.click("#startBtn");
    await expect(err).toHaveText("Please key in your register number.");
    for (const bad of ["0", "51", "99"]) {
      await page.fill("#regInput", bad);
      await page.click("#startBtn");
      await expect(err).toHaveText("Register numbers are whole numbers from 1 to 50.");
    }
    await page.locator("#regInput").fill("");
    await page.locator("#regInput").pressSequentially("1.a5");
    expect(await page.locator("#regInput").inputValue()).toBe("15"); // only digits can be typed
    expect(errors).toEqual([]);
  });
});

test.describe("new student", () => {
  test("Before you start, home page, locks and 4 key terms", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    await resetServer(request, ["3E1"]);
    await login(page, "3E1", 12);

    const modal = page.locator("#briefing");
    await expect(modal.locator("h2")).toHaveText("📋 Before you start");
    await expect(modal.locator("li")).toHaveText(BRIEFING);
    await expect(modal.locator("button")).toHaveText("✅ I'm ready");
    await checkPage(page, testInfo, "slice2-before-you-start");

    // Until "I'm ready", every page shows the pop-up.
    await page.goto("/#terms");
    await expect(page.locator("#briefing")).toBeVisible();
    await page.goto("/#station1");
    await expect(page.locator("#briefing")).toBeVisible();
    await page.click("#briefing button");
    await expect(page.locator("#briefing")).toHaveCount(0);
    expect(page.url()).toMatch(/#home$/);

    await expect(page.locator(".topbar-chip")).toHaveText("Class 3E1 · Register No. 12");
    await expect(page.locator(".lead").first()).toHaveText("Welcome! Start with Station 1.");
    await expect(page.locator(".notice")).toHaveCount(0);
    await expect(page.locator("#howLink")).toHaveText("📋 How this works");
    await expect(page.locator("#switchLink")).toHaveText("🔄 Sharing this device? Switch student");
    await expect(page.locator(".terms-card")).toContainText("Start here: 4 key terms");
    await expect(page.locator(".terms-card")).toContainText("A 1-minute look before Station 2");
    await expect(page.locator(".journey-count")).toHaveText("0 of 5 stations done");
    await expect(page.locator(".station-name")).toHaveText([
      "📝 Station 1: Your Customer Service Stories", "📘 Station 2: Learn: Customer Service",
      "💬 Station 3: Chat with Alex", "🛍️ Station 4: Serve Suzzie at Stylez", "✅ Station 5: Check and Exit Ticket"
    ]);
    await expect(page.locator(".station-desc")).toHaveText([
      "Think about your own experiences as a customer.",
      "Short notes on quality customer service, the four stages and service recovery.",
      "Be the customer. Chat with Nexora's customer service officer.",
      "Switch roles. Now you're the customer service officer.",
      "Check what you've learnt and tell your teacher how confident you feel."
    ]);
    await expect(page.locator(".status-pill")).toHaveText(["Not started", "🔒 Locked", "🔒 Locked", "🔒 Locked", "🔒 Locked"]);
    await expect(page.locator(".shelf-name")).toHaveText([
      "Story Sharer, not earned yet", "Service Scholar, not earned yet", "Service Spotter, not earned yet",
      "Service Star, not earned yet", "Chapter 6 Champion, not earned yet"
    ]);
    await expect(page.locator("a[href='#report']")).toHaveCount(0);
    await checkPage(page, testInfo, "slice2-home");

    // A locked station cannot be opened: tapping explains, typing its address goes home.
    await page.click("#stationCard3", { force: true }); // marked aria-disabled; a tap only explains
    await expect(page.locator("#lockedMsg3")).toHaveText("Finish Station 2 first to open this station.");
    expect(page.url()).toMatch(/#home$/);
    await page.goto("/#station2");
    await expect(page.locator(".journey-count")).toBeVisible();
    expect(page.url()).toMatch(/#home$/);

    // Station 1 is open.
    await page.click("#stationCard1");
    await expect(page.locator("h1.page-title")).toHaveText("📝 Station 1: Your Customer Service Stories");
    await page.click("#homeBtn");

    // "How this works" reopens the pop-up with Close.
    await page.click("#howLink");
    await expect(page.locator("#briefing button")).toHaveText("Close");
    await page.click("#briefing button");

    await page.click(".terms-card");
    await expect(page.locator("h1.page-title")).toHaveText("📘 4 key terms");
    await expect(page.locator(".lead")).toHaveText("You'll meet these words in Station 2. Read them once now.");
    await expect(page.locator(".term-card")).toHaveText([
      "Customer service: Customer service refers to what businesses do for their customers so that they are happy and satisfied.",
      "Quality customer service: Quality customer service means doing more for customers to exceed their expectations.",
      "Service breakdown: A service breakdown occurs when customers make a complaint about a product or service.",
      "Service recovery: Service recovery is a process whereby a business takes action in response to service breakdown or failure."
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
    await saved; // "soon" save: about 10 to 13 seconds

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
    await expect(page2.locator(".notice")).toHaveText("Welcome back! Your work has been loaded.");
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
    await page.selectOption("#classInput", "3E1");
    await page.fill("#regInput", "8");
    await page.click("#startBtn");
    await expect(page.locator(".notice")).toHaveText("Welcome back! Your work has been loaded.");
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
    await page.selectOption("#classInput", "3E1"); // the class list was cached on this device
    await page.fill("#regInput", "9");
    await page.click("#startBtn");
    await expect(page.locator(".notice")).toHaveText("Welcome back! Your work has been loaded.");
    await expect(page.locator("#briefing")).toHaveCount(0); // "I'm ready" from this device's copy
    await expect(page.locator("#netBanner")).toHaveText("📡 No internet. Your work is saved on this device and will be sent when the connection is back.");
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
    const busyReply = page.waitForResponse(r => r.url().endsWith("/api") && r.request().method() === "POST", { timeout: 25000 });
    await page.click("#briefing button");
    expect((await (await busyReply).json()).error).toBe("busy");
    await expect(page.locator("#netBanner")).toHaveText("⏳ Your answers have not been sent yet. They are safe on this device. We will keep trying.", { timeout: 5000 });
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
    await page.selectOption("#classInput", "3E1");
    await page.fill("#regInput", "11");
    await page.click("#startBtn");
    await expect(page.locator("#briefing button")).toHaveText("✅ I'm ready"); // starts again
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
    await expect(page.locator(".add-class .field-note")).toHaveText("Classes appear in the class dropdown on the home page, in this order.");
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
    await expect(page.locator("#classInput option")).toHaveText(["Choose your class…", "3E1", "3E2"]);
    expect(errors).toEqual([]);
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
    expect(fromApp.done).toEqual({ 1: t(2), 2: t(6) });  // finished stations never removed
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
    expect(sheet.Students[0]).toEqual(["Key", "Class", "Register No.", "Stations finished", "Q2 first try", "Q3 and Q4 first try",
      "Confidence 1", "Confidence 2", "Confidence 3", "Confidence 4", "Last saved", "Cleared at", "Record"]);
  });
});
