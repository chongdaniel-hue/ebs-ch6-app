const { test, expect } = require("@playwright/test");
const { resetServer, apiPost, apiGet, login, shot, expectNoSidewaysScroll, expectNoAmpersand } = require("./helpers");
const resetCode = () => process.env.TEST_RESET_CODE;
const T = "2026-10-20T02:00:00.000Z";
function record(reg = 5) {
  return {v:1, cls:"3E1", reg, updatedAt:T, baseClearedAt:"", agreed:T,
    done:{1:T,2:T,3:T,4:T,5:T}, submitted:{q:T}, reached:{"s4.tabs":1},
    first:{q:{a:"test",ok:true,t:T}}, second:{q:{a:"test",ok:true,t:T}},
    answers:{"s1.q1":{v:"Sample answer",t:T}}, ui:{"s4.tab":{v:1,t:T}}};
}
async function prepare(page, request) {
  await resetServer(request, ["3E1"]);
  await apiPost(request,{action:"save",record:record()});
  await apiPost(request,{action:"save",record:record(6)});
  await login(page,"3E1",5);
  await expect(page.locator(".welcome-card")).toBeVisible();
  await page.locator(".home-learning-report a.btn").click();
  await expect(page.locator("h1.page-title")).toHaveText("My learning report");
}

test("password, cancel, keyboard focus, server reset, reload and other students", async ({page, request}, testInfo) => {
  await prepare(page,request);
  await page.evaluate(()=>showProgressReset({...student}));
  const modal=page.locator("#progressResetModal");
  const input=modal.locator("input");
  await expect(input).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(modal.getByRole("button",{name:"Cancel",exact:true})).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await expectNoSidewaysScroll(page);
  await expectNoAmpersand(page);
  await shot(page,testInfo,"reset-progress-password");
  await modal.getByRole("button",{name:"Cancel",exact:true}).click();
  expect((await apiGet(request,{action:"load",class:"3E1",reg:5})).record.done[5]).toBe(T);
  await page.evaluate(()=>showProgressReset({...student}));
  await input.fill("wrong-test-password");
  await modal.getByRole("button",{name:"Reset progress",exact:true}).click();
  await expect(page.locator("#progressResetError")).toHaveText("Incorrect password. Try again.");
  expect((await apiGet(request,{action:"load",class:"3E1",reg:5})).record.done[5]).toBe(T);
  await input.fill("  "+resetCode().toLowerCase()+"  ");
  await modal.getByRole("button",{name:"Reset progress",exact:true}).click();
  await expect(modal).toHaveCount(0);
  await expect(page.locator('#nameInput')).toBeEditable();
  await expect(page.locator('#nameInput')).toHaveValue('');await expect(page.locator('#regInput')).toHaveValue('');
  const loaded=await apiGet(request,{action:'load',class:'3E1',reg:5});expect(loaded.record).toBeNull();expect(loaded.clearedAt).toBeTruthy();
  expect(await page.evaluate(()=>localStorage.getItem('ch6_rec_3E1#5'))).toBeNull();
  expect((await apiGet(request,{action:'load',class:'3E1',reg:6})).record.done[5]).toBe(T);
  expect((await apiPost(request,{action:'save',record:record()})).error).toBe('cleared');
  await page.reload();await expect(page.locator('#nameInput')).toBeEditable();
  await page.screenshot({path:`tests/screenshots/reset-registration-${testInfo.project.name}.png`,fullPage:true});
  await page.locator('#nameInput').fill('New Demo Student');await page.locator('#regInput').selectOption('5');await page.locator('#startBtn').click();await page.locator('#briefing button').click();
  await expect(page.locator('.topbar-chip')).toContainText('New Demo Student');
  await expect.poll(async()=>(await apiGet(request,{action:'load',class:'3E1',reg:5})).record?.profile?.name?.v).toBe('New Demo Student');
  expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.done).toEqual({});
});

test("offline reset preserves progress; delayed saves cannot revive cleared answers",async({page,request})=>{
  await prepare(page,request);
  await page.route("**/api", async route=>{
    const data=route.request().postDataJSON();
    if(data && data.action==="resetProgress") return route.abort();
    return route.continue();
  });
  await page.evaluate(()=>showProgressReset({...student}));
  await page.locator("#progressResetPassword").fill(resetCode());
  await page.locator("#progressResetModal button[type=submit]").click();
  await expect(page.locator("#progressResetError")).toContainText("could not be confirmed");
  expect(await page.evaluate(()=>!!rec.done[5])).toBe(true);
  await page.unroute("**/api");
  let release;
  const gate=new Promise(resolve=>release=resolve);
  let captured;
  const caught=new Promise(resolve=>captured=resolve);
  await page.route("**/api",async route=>{
    const data=route.request().postDataJSON();
    if(data && data.action==="save"){
      const response=await route.fetch();
      captured();
      await gate;
      return route.fulfill({response});
    }
    return route.continue();
  });
  await page.evaluate(()=>queueSave("now"));
  await caught;
  await page.locator("#progressResetPassword").fill(resetCode().toUpperCase());
  await page.locator("#progressResetModal button[type=submit]").click();
  await expect(page.locator("#nameInput")).toBeEditable();
  release();
  await expect.poll(()=>page.evaluate(()=>flushing)).toBe(false);
  expect(await page.evaluate(()=>rec)).toBeNull();
  expect(await page.evaluate(()=>student)).toBeNull();
});

test("server enforces password, independent lockout and successive reset epochs",async({request})=>{
  await resetServer(request,["3E1"]);
  expect((await apiGet(request,{action:"classes"})).version).toBe("0.6.32");
  await apiPost(request,{action:"save",record:record()});
  for(const code of ["",process.env.TEST_TEACHER_CODE,"wrong-test-password"])
    expect((await apiPost(request,{action:"resetProgress",code,class:"3E1",reg:5})).error).toBe("bad_code");
  expect((await apiGet(request,{action:"load",class:"3E1",reg:5})).record.done[5]).toBe(T);
  const first=await apiPost(request,{action:"resetProgress",code:resetCode().toLowerCase(),class:"3E1",reg:5});
  expect(first.ok).toBe(true);
  const newRecord={...record(),baseClearedAt:first.clearedAt};
  expect((await apiPost(request,{action:"save",record:newRecord})).ok).toBe(true);
  const second=await apiPost(request,{action:"resetProgress",code:resetCode().toUpperCase(),class:"3E1",reg:5});
  expect(second.clearedAt>first.clearedAt).toBe(true);
  expect((await apiPost(request,{action:"save",record:newRecord})).error).toBe("cleared");
  for(let n=0;n<7;n++) await apiPost(request,{action:"resetProgress",code:"wrong-test-password",class:"3E1",reg:5});
  expect((await apiPost(request,{action:"resetProgress",code:resetCode(),class:"3E1",reg:5})).error).toBe("locked_out");
  expect((await apiPost(request,{action:"teacherCheck",code:process.env.TEST_TEACHER_CODE})).ok).toBe(true);
});


test("missing backend setup preserves progress and the footer supports selecting a registered student",async({page,request})=>{
  await page.goto("/");
  await expect(page.locator("[data-reset-progress]")).toBeEnabled();
  await prepare(page,request);
  await page.route("**/api",async route=>{
    const data=route.request().postDataJSON();
    if(data && data.action==="resetProgress") return route.fulfill({json:{ok:false,error:"unknown_action"}});
    return route.continue();
  });
  await page.evaluate(()=>showProgressReset({...student}));
  await page.locator("#progressResetPassword").fill(resetCode());
  await page.locator("#progressResetModal button[type=submit]").click();
  await expect(page.locator("#progressResetError")).toHaveText("Reset is not set up on the server yet. Ask your teacher.");
  expect(await page.evaluate(()=>!!rec.done[5])).toBe(true);
  expect((await apiGet(request,{action:"load",class:"3E1",reg:5})).record.done[5]).toBe(T);
  expect(await page.locator("#progressResetPassword").inputValue()).toBe("");
});
