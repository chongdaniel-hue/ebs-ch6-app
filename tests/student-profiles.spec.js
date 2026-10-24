const {test,expect}=require('@playwright/test');
const {resetServer,apiPost,apiGet,CODE,expectNoSidewaysScroll}=require('./helpers');
const T='2026-10-20T02:00:00.000Z';
const profileRecord=(reg,name)=>({v:1,cls:'3E1',reg,updatedAt:T,baseClearedAt:'',agreed:T,done:{1:T},submitted:{},reached:{},first:{},second:{},answers:{'s1.q1':{v:'Saved work',t:T}},ui:{},profile:{name:{v:name,t:T}}});
test('student names register once, lock, sync and identify reports without replacing progress',async({page,request,browser},testInfo)=>{
 await resetServer(request,['3E1']);await page.goto('/');
 await expect(page.locator('#nameInput')).toHaveValue('');await expect(page.locator('#classInput')).toHaveValue('3E1');await page.locator('#regInput').selectOption('5');await page.locator('#startBtn').click();await expect(page.locator('#loginError')).toContainText('name at the top');
 await page.locator('#nameInput').fill('  Demo Student Five  ');await page.locator('#startBtn').click();await page.locator('#briefing button').click();
 await expect(page.locator('#studentNameInput')).toHaveValue('Demo Student Five');
 await expect.poll(async()=>{const r=await apiGet(request,{action:'load',class:'3E1',reg:5});return r.record?.profile?.name?.v;}).toBe('Demo Student Five');
 await page.evaluate(()=>{setAnswer('s1.q1','My existing answer','now');});
 await expect(page.locator('#studentNameInput')).toHaveAttribute('readonly','');await expect(page.locator('#studentNameForm button')).toHaveCount(0);
 const loaded=await apiGet(request,{action:'load',class:'3E1',reg:5});
 const attempt=JSON.parse(JSON.stringify(loaded.record));attempt.profile.name={v:'Replacement Name',t:new Date().toISOString()};
 const rejectedRename=await apiPost(request,{action:'save',record:attempt});expect(rejectedRename.record.profile.name.v).toBe('Demo Student Five');
 const ctx=await browser.newContext();const other=await ctx.newPage();await other.goto('http://localhost:8788/');await other.locator('#nameInput').fill('Different Name');await expect(other.locator('#classInput')).toHaveValue('3E1');await other.locator('#regInput').selectOption('5');await other.locator('#startBtn').click();await expect(other.locator('#loginError')).toContainText('already been registered');await other.locator('#nameInput').fill('Demo Student Five');await other.locator('#startBtn').click();await expect(other.locator('.welcome-card')).toBeVisible();expect(await other.evaluate(()=>getAnswer('s1.q1'))).toBe('My existing answer');await ctx.close();
 await page.goto('/#report');await expect(page.locator('.level-sub')).toContainText('Demo Student Five');await expectNoSidewaysScroll(page);
 await page.screenshot({path:`tests/screenshots/named-report-${testInfo.project.name}.png`});
});
test('both selectors list actual registered names, protect access, distinguish duplicate names and reset another profile releasing identity',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);for(const reg of [5,6])await apiPost(request,{action:'save',record:profileRecord(reg,'Demo Student')});
 const list=await apiPost(request,{action:'profileList',purpose:'unlock',code:CODE(),class:'3E1'});expect(list.students.map(s=>s.name)).toEqual(['Demo Student','Demo Student']);expect(list.students[0]).not.toHaveProperty('record');expect((await apiPost(request,{action:'profileList',purpose:'reset',code:'wrong',class:'3E1'})).error).toBe('bad_code');
 await page.goto('/');await page.locator('[data-unlock-progress]').click();let modal=page.locator('#studentUnlockModal');await modal.locator('#unlockPassword').fill(CODE());await modal.getByRole('button',{name:'Continue',exact:true}).click();await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStudent option')).toHaveText(['Choose a student','Demo Student · Register No. 5','Demo Student · Register No. 6']);await modal.locator('#unlockStudent').selectOption('5');await modal.locator('input[value="3"]').check();await modal.locator('#applyUnlock').click();await page.locator('#studentUnlocked button').click();expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.unlockedLevels[3]).toBeTruthy();
 await page.locator('[data-reset-progress]').click();await modal.locator('#unlockPassword').fill(process.env.TEST_RESET_CODE.toLowerCase());await modal.getByRole('button',{name:'Continue',exact:true}).click();await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStudent option')).toHaveCount(3);await modal.locator('#unlockStudent').selectOption('6');await expect(modal.locator('.unlock-levels')).toBeHidden();await expect(modal.locator('#unlockAllSelection')).toBeHidden();await expect(modal.locator('#unlockIdentity')).toHaveText('Demo Student · Register No. 6');await modal.locator('#applyUnlock').click();
 const confirm=page.locator('#progressResetModal');await expect(confirm).toContainText('Demo Student, Class 3E1, Register No. 6');await page.screenshot({path:`tests/screenshots/named-reset-confirm-${testInfo.project.name}.png`});await confirm.locator('button[type=submit]').click();await expect(confirm).toHaveCount(0);
 const cleared=await apiGet(request,{action:'load',class:'3E1',reg:6});expect(cleared.record).toBeNull();expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.answers['s1.q1'].v).toBe('Saved work');
 const after=await apiPost(request,{action:'profileList',purpose:'reset',code:process.env.TEST_RESET_CODE,class:'3E1'});expect(after.students.map(s=>s.reg)).toEqual([5]);
});


test('a legacy profile can save its name once and stays locked after reload until reset',async({page,request})=>{
 await resetServer(request,['3E1']);const legacy=profileRecord(9,'');delete legacy.profile;await apiPost(request,{action:'save',record:legacy});
 await page.addInitScript(r=>{localStorage.setItem('ch6_active',JSON.stringify({cls:r.cls,reg:r.reg}));localStorage.setItem('ch6_rec_3E1#9',JSON.stringify(r));},legacy);
 await page.goto('/#home');await expect(page.locator('#studentNameInput')).toBeEditable();await page.locator('#studentNameInput').fill('Demo Legacy Student');await page.locator('#studentNameForm button').click();await expect(page.locator('#studentNameInput')).toHaveAttribute('readonly','');await expect(page.locator('#studentNameForm button')).toHaveCount(0);
 await expect.poll(async()=>{const r=await apiGet(request,{action:'load',class:'3E1',reg:9});return r.record?.profile?.name?.v;}).toBe('Demo Legacy Student');
 await page.reload();await expect.poll(()=>page.locator('#studentNameInput').getAttribute('readonly')).toBe('');await expect(page.locator('#studentNameInput')).toHaveValue('Demo Legacy Student');
 const clear=await apiPost(request,{action:'clearStudent',code:CODE(),class:'3E1',reg:9});expect(clear.record).toBeNull();
 await page.reload();await expect(page.locator('#nameInput')).toBeEditable();await expect(page.locator('#regInput')).toHaveValue('');

});

test('saved home identity is locked and occupied register numbers reject another name',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await apiPost(request,{action:'save',record:profileRecord(5,'Demo Five')});
 await page.goto('/');await expect(page.locator('#classInput')).toHaveValue('3E1');await page.locator('#nameInput').fill('Another Student');await page.locator('#regInput').selectOption('5');await page.locator('#startBtn').click();
 await expect(page.locator('#loginError')).toContainText('This register number has already been registered to a student profile.');
 await page.locator('#nameInput').fill('Demo Five');await page.locator('#startBtn').click();
 const select=page.locator('#studentRegisterInput');await expect(select).toHaveValue('5');await expect(select).toBeDisabled();await expect(page.locator('#studentNameInput')).toHaveAttribute('readonly','');
 await expect(select.locator('option')).toHaveText(Array.from({length:40},(_,i)=>String(i+1)));
 for(const purpose of ['reset','unlock']){const r=await apiPost(request,{action:'profileList',purpose,code:purpose==='reset'?process.env.TEST_RESET_CODE:CODE(),class:'3E1'});expect(r.students.find(s=>s.name==='Demo Five').reg).toBe(Number(await select.inputValue()));}
 await page.reload();await expect(select).toBeDisabled();await expect(select).toHaveValue('5');await expect(page.locator('#studentNameInput')).toHaveAttribute('readonly','');await expectNoSidewaysScroll(page);
 await page.locator('#studentNameForm').screenshot({path:`tests/screenshots/home-register-${testInfo.project.name}.png`});
 const r=await apiGet(request,{action:'load',class:'3E1',reg:5});expect(r.record.profile.name.v).toBe('Demo Five');expect(r.record.answers['s1.q1'].v).toBe('Saved work');
});
