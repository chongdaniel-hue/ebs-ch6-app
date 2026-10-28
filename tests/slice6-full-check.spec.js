// Slice 6 full check: every screen, at 1280px and 360px, for contrast, labels, headings,
// tap targets, ampersands and sideways scrolling. Screenshots of every screen for the
// visual check go to tests/screenshots/final-*.png.
const { test, expect } = require("@playwright/test");
const {
  watchErrors, expectNoAmpersand, expectNoSidewaysScroll, shot,
  CODE, resetServer, apiPost, login
} = require("./helpers");

// Runs in the page: returns a list of problems on the current screen.
function auditScreen() {
  const problems = [];
  // Student-entered text may contain emoji; the application UI must use graphics.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("script, style, textarea, [data-student-text]")) continue;
    if (/\p{Extended_Pictographic}/u.test(node.textContent)) problems.push("emoji remains in application UI");
  }
  document.querySelectorAll("svg.ui-graphic").forEach(icon => {
    if (!icon.querySelector("use[href]") || !icon.dataset.icon) problems.push("graphic without a symbol");
  });
  const visible = el => {
    if (!(el instanceof Element)) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    if (el.closest(".visually-hidden,[hidden]")) return false;
    const st = getComputedStyle(el);
    return st.visibility !== "hidden" && st.display !== "none";
  };
  const name = el => (el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""));

  // Contrast: text colour against the colour actually behind it, with opacity.
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const blend = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const background = el => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const bg = parse(getComputedStyle(e).backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 1) break; }
    }
    let c = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) c = blend(layers[i], c);
    return c;
  };
  const opacity = el => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  document.querySelectorAll("body *").forEach(el => {
    if (!visible(el)) return;
    const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("").trim();
    if (!text || !/[A-Za-z0-9]/.test(text)) return;
    if (el.closest("button:disabled,select:disabled,[aria-disabled='true']")) return; // disabled controls are exempt
    const st = getComputedStyle(el);
    const fg = parse(st.color); if (!fg) return;
    const bg = background(el);
    const shown = blend({ ...fg, a: fg.a * opacity(el) }, bg);
    const L1 = lum(shown), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(st.fontSize), bold = Number(st.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) problems.push(`contrast ${ratio.toFixed(2)} < ${need}: ${name(el)} "${text.slice(0, 40)}"`);
  });
  // Placeholder text in answer boxes.
  document.querySelectorAll("textarea[placeholder], input[placeholder]").forEach(el => {
    if (!visible(el)) return;
    const c = parse(getComputedStyle(el, "::placeholder").color);
    if (!c) return;
    const bg = background(el);
    const shown = blend(c, bg);
    const ratio = (Math.max(lum(shown), lum(bg)) + 0.05) / (Math.min(lum(shown), lum(bg)) + 0.05);
    if (ratio < 4.5) problems.push(`placeholder contrast ${ratio.toFixed(2)}: ${name(el)}`);
  });

  // Images: alt text (placeholders carry role="img" and an aria-label).
  document.querySelectorAll("img").forEach(img => { if (!img.getAttribute("alt")) problems.push(`image without alt: ${img.getAttribute("src")}`); });
  document.querySelectorAll(".img-placeholder").forEach(p => { if (!p.getAttribute("aria-label")) problems.push(`placeholder without label: ${p.dataset.img}`); });

  // Every control has an accessible name.
  document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach(el => {
    if (!visible(el)) return;
    const named = el.getAttribute("aria-label") || (el.labels && el.labels.length) || el.getAttribute("aria-labelledby");
    if (!named) problems.push(`control without a name: ${name(el)}`);
  });
  document.querySelectorAll("button, a[href]").forEach(el => {
    if (!visible(el)) return;
    if (!(el.textContent.trim() || el.getAttribute("aria-label"))) problems.push(`button or link without a name: ${name(el)}`);
  });

  // Tap targets: buttons and button links at least 44px tall.
  document.querySelectorAll("button, a.btn, .topbar-home, .tab, .step-tab, .level-card, summary").forEach(el => {
    if (!visible(el)) return;
    const h = el.getBoundingClientRect().height;
    if (h < 43.5) problems.push(`tap target ${Math.round(h)}px: ${name(el)} "${el.textContent.trim().slice(0, 30)}"`);
  });

  // One h1 per page; ids unique.
  const h1 = [...document.querySelectorAll("h1")].filter(visible).length;
  if (h1 !== 1) problems.push(`${h1} h1 headings`);
  const ids = {};
  document.querySelectorAll("[id]").forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
  Object.keys(ids).filter(k => ids[k] > 1).forEach(k => problems.push(`duplicate id: ${k}`));
  if (document.documentElement.lang !== "en-SG") problems.push("page language not set");
  return problems;
}

// The text of every screen is collected for the wording check against the storyboard.
const screenText = [];
async function check(page, testInfo, name, problemsOut) {
  await page.waitForTimeout(150);
  screenText.push(await page.evaluate(() => document.body.innerText + "\n" +
    [...document.querySelectorAll("[placeholder],[alt],[aria-label]")]
      .map(e => e.getAttribute("placeholder") || e.getAttribute("alt") || e.getAttribute("aria-label")).join("\n")));
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  const p = await page.evaluate(auditScreen);
  p.forEach(x => problemsOut.push(`${name}: ${x}`));
  await shot(page, testInfo, `final-${name}`);
}

const T = "2026-10-20T02:00:00.000Z";
const a = v => ({ v, t: T });

test("every student screen", async ({ page, request }, testInfo) => {
  const errors = watchErrors(page);
  const problems = [];
  await resetServer(request, []);
  await page.goto("/");
  await page.waitForSelector("#classNote");
  await check(page, testInfo, "landing-no-classes", problems);
  await apiPost(request, { action: "addClass", code: CODE(), name: "3E1" });
  await page.reload();
  await expect(page.locator("#classInput")).toHaveValue("3E1");
  await page.click("#startBtn");
  await check(page, testInfo, "landing-error", problems);
  await login(page, "3E1", 30);
  await page.waitForSelector("#briefing");
  await check(page, testInfo, "before-you-start", problems);
  await page.click("#briefing button");
  await check(page, testInfo, "home-new", problems);
  await page.click("#switchLink");
  await check(page, testInfo, "switch-modal", problems);
  await page.locator("#switchModal button", { hasText: "Cancel" }).click();
  await page.goto("/#terms");
  await check(page, testInfo, "terms", problems);

  // Level 1: before and after Submit, Not finished yet, badge.
  await page.goto("/#level1");
  await check(page, testInfo, "level1", problems);
  await page.click("#submitL1");
  await check(page, testInfo, "level1-not-finished", problems);
  await page.locator("#notFinished button", { hasText: "Go back" }).click();
  for (let i=1;i<=3;i++) await page.locator(`textarea[data-answer="s1.q${i}"]`).fill("The staff listened carefully and helped the customer.");
  await page.click("#submitL1");
  await check(page, testInfo, "level1-recap", problems);
  await page.click("#finishBtn");
  await check(page, testInfo, "badge-popup", problems);
  await page.locator("#badgeModal button").click();
  await check(page, testInfo, "home-in-progress", problems);

  // Level 2 (13 cards) and Level 3 (7 cards), every card (quick checks answered, one wrong first, so its feedback is checked too).
  await page.evaluate(() => {
    for(const key of REFLECTION_KEYS){setAnswer(key,"A complete reflection.");setUi(`${key}.saved`,rec.answers[key].t);}
    setAnswer("s2.qc.a.1","Greeting");setAnswer("s2.qc.b.1","Greeting");setAnswer("s2.qc.b.2","Service");setAnswer("s2.qc.c.1","Service");setAnswer("s2.qc.c.2","Greeting");
    setAnswer("s2.qc2.a.1","Yes, but");setAnswer("s2.qc2.b.1","Share concerns");setAnswer("s2.qc2.b.2","Correct misconception");setAnswer("s2.qc2.c.1","Negative into selling point");setAnswer("s2.qc2.d.1","Yes, but");setAnswer("s2.qc2.d.2","Correct misconception");
    setUi("s2.card",0); saveLocal();
  });
  for (const [level, cards] of [[2, 13], [3, 7]]) {
    await page.goto("/#home"); await page.goto(`/#level${level}`);
    for (let c = 1; c <= cards; c++) {
      await expect(page.locator("#lessonProgressText")).toContainText(`${c} of ${cards}`);
      await check(page, testInfo, `level${level}-card${String(c).padStart(2, "0")}`, problems);
      await page.locator("#lessonNext").click();
    }
    await check(page, testInfo, `level${level}-badge`, problems);
    await page.locator("#badgeModal button").click();
  }

  // Level 4 (Chat with Alex): chat, think back, feedback with a wrong answer, revealed.
  await page.goto("/#level4");
  await check(page, testInfo, "level3-chat", problems);
  await page.locator("input[id^=conversationLink]").fill("https://gemini.google.com/share/AbCd1234");
  await page.locator(".tick-input").check();
  await page.click("#nextBtn");
  await page.fill('textarea[data-answer="s3.q1a"]', "Knowledgeable");
  await page.fill('textarea[data-answer="s3.q1b"]', "accurate answers");
  for (const [id, v] of [["P", "3"], ["Q", "0"], ["R", "1"], ["S", "0"]]) await page.selectOption(`#sel_${id}`, v);
  await check(page, testInfo, "level3-thinkback", problems);
  await page.click("#submitL3");
  await check(page, testInfo, "level3-feedback", problems);
  await page.selectOption("#sel_Q", "1");
  await check(page, testInfo, "level3-changed", problems);
  await page.click("#checkAgainBtn");
  await check(page, testInfo, "level3-resolved", problems);
  await page.click("#finishBtn");
  await page.locator("#badgeModal button").click();

  // Level 5 (Serve Suzzie).
  await page.goto("/#level5");
  await check(page, testInfo, "level4-roleplay", problems);
  await page.click("#stylezFacts summary");
  await check(page, testInfo, "stylez-information", problems);
  await expect(page.locator(".stylez-fact")).toHaveCount(17);
  await page.locator("input[id^=conversationLink]").fill("https://gemini.google.com/share/AbCd1234");
  await page.locator(".tick-input").check();
  await page.click("#nextBtn");
  await page.locator('[data-roleplay-stage="Approach"]').check();
  await page.fill('textarea[data-answer="s4.q1"]', "Greeted her");
  await page.fill('textarea[data-answer="s4.q2"]', "Ask more");
  await page.click("#submitL4");
  await check(page, testInfo, "level4-recap", problems);
  await page.click("#finishBtn");
  await page.locator("#badgeModal button").click();

  // Level 6 (Win Suzzie Back): roleplay, the 8-step checklist, recap, badge.
  await page.goto("/#level6");
  await check(page, testInfo, "level6-roleplay", problems);
  await page.locator("input[id^=conversationLink]").fill("https://gemini.google.com/share/AbCd1234");
  await page.locator(".tick-input").check();
  await page.click("#nextBtn");
  await check(page, testInfo, "level6-reflect", problems);
  await page.locator('[data-recovery-step="Apologise"]').check();
  await page.fill('textarea[data-answer="s6.q1"]', "Calmer, because I said sorry.");
  await page.fill('textarea[data-answer="s6.q2"]', "Ask more questions");
  await page.click("#submitL6");
  await check(page, testInfo, "level6-recap", problems);
  await page.click("#finishBtn");
  await check(page, testInfo, "level6-badge", problems);
  await page.locator("#badgeModal button").click();

  // Level 7 (the Check): check, feedback, revealed, exit ticket, champion.
  await page.goto("/#level7");
  await check(page, testInfo, "level5-check", problems);
  for (const [id, label] of [["i", "True"], ["ii", "True"], ["iii", "True"], ["iv", "True"]]) await page.locator(`.tf-item[data-key="s5.q3.${id}"] .tf-btn`, { hasText: label }).click();
  await page.locator(".mcq-btn", { hasText: "Our chargers" }).click();
  await page.fill('textarea[data-answer="s5.q5"]', "customers return");
  await page.click("#submitL5");
  await check(page, testInfo, "level5-feedback", problems);
  await page.click("#checkAgainBtn");
  await check(page, testInfo, "level5-revealed", problems);
  await page.click("#nextBtn");
  await page.fill('textarea[data-answer="s5.q6"]', "8 steps");
  await page.fill('textarea[data-answer="s5.q7"]', "Refunds?");
  for (const r of [1, 2, 3, 4]) await page.locator(`.face-btn[data-key="s5.q8.${r}"][data-value="${r - 1}"]`).click();
  await check(page, testInfo, "level5-exit", problems);
  await page.click("#submitExit");
  await check(page, testInfo, "champion", problems);
  await page.locator("#badgeModal button", { hasText: "Back to my route" }).click();
  await check(page, testInfo, "home-all-done", problems);
  await page.click(".welcome-card a.btn");
  await check(page, testInfo, "report", problems);

  // No console errors on any screen (the offline step below causes failed requests on purpose).
  expect(errors).toEqual([]);

  // Offline bar.
  await page.route("**/api", r => r.abort());
  await page.evaluate(() => { setAnswer("s1.q1", "x", "now"); });
  await page.waitForSelector("#netBanner", { timeout: 15000 });
  await page.goto("/#home");
  await check(page, testInfo, "offline-bar", problems);

  expect(problems).toEqual([]);
});

test("every Teacher Mode screen", async ({ page, request }, testInfo) => {
  const problems = [];
  await resetServer(request, ["3E1"]);
  await apiPost(request, { action: "save", record: {
    v: 1, cls: "3E1", reg: 4, updatedAt: T, baseClearedAt: "", agreed: T, done: { 1: T, 2: T, 3: T }, submitted: {}, reached: {},
    first: { "s3q2.P": { a: 3, ok: true, t: T }, "s3q2.Q": { a: 0, ok: false, t: T }, "s3q2.R": { a: 2, ok: true, t: T }, "s3q2.S": { a: 0, ok: true, t: T } },
    second: { "s3q2.Q": { a: 1, ok: true, t: T } }, answers: { "s1.q1": a("Good"), "s5.q7": a("Why?") }, ui: {}
  } });
  await page.goto("/#teacher");
  await check(page, testInfo, "teacher-gate", problems);
  await page.fill("#teacherCode", "wrong");
  await page.click("#teacherEnter");
  await expect(page.locator("#teacherError")).toBeVisible();
  await check(page, testInfo, "teacher-gate-error", problems);
  await page.fill("#teacherCode", CODE());
  await page.click("#teacherEnter");
  await expect(page.locator(".tab.current")).toHaveText("Classes");
  await check(page, testInfo, "teacher-classes", problems);
  await page.locator(".class-row button").first().click();
  await check(page, testInfo, "teacher-remove-modal", problems);
  await page.locator("#removeClassModal button", { hasText: "Cancel" }).click();
  await page.click("#tab_results");
  await check(page, testInfo, "teacher-results-empty", problems);
  await page.selectOption("#resultsClass", "3E1");
  await page.waitForSelector(".results-summary");
  await check(page, testInfo, "teacher-results", problems);
  await page.locator(".students-table tbody tr").first().click();
  await check(page, testInfo, "teacher-student", problems);
  await page.click("#clearStudent");
  await check(page, testInfo, "teacher-clear-modal", problems);
  await page.locator("#clearModal button", { hasText: "Cancel" }).click();
  await page.click("#tab_device");
  await check(page, testInfo, "teacher-device", problems);
  await page.click("#resetDevice");
  await check(page, testInfo, "teacher-reset-modal", problems);
  expect(problems).toEqual([]);
});

test.afterAll(async ({}, testInfo) => {
  require("fs").writeFileSync(`test-results/screen-text-${testInfo.project.name}.txt`, screenText.join("\n"));
});

// Google Sheets refuses to write past a tab's last row (a new tab has 1,000), so Code.gs
// adds rows first. Here the stand-in Sheet has only 5 rows per tab.
test("Code.gs keeps saving when the Students tab is full", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "laptop", "no browser needed; run once");
  const os = require("os"), path = require("path"), fs = require("fs");
  const { createAppsScript } = require("../server/apps-script-mock");
  const script = createAppsScript({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), "ch6-rows-")), teacherCode: "T1", maxRows: 5 });
  expect(JSON.parse(script.doPost(JSON.stringify({ action: "addClass", code: "T1", name: "3E1" }))).ok).toBe(true);
  for (let reg = 1; reg <= 12; reg++) {
    const reply = JSON.parse(script.doPost(JSON.stringify({ action: "save", name:"Test Student " + reg, record: { cls: "3E1", reg, profile:{name:{v:"Test Student " + reg,t:new Date().toISOString()}} } })));
    expect(reply.ok, `save ${reg}`).toBe(true);
  }
  const results = JSON.parse(script.doPost(JSON.stringify({ action: "results", code: "T1", class: "3E1" })));
  expect(results.students).toHaveLength(12);
});
