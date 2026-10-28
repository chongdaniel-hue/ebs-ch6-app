const {test,expect}=require('@playwright/test');
const {resetServer,apiPost,apiGet,login,CODE,expectNoSidewaysScroll,expectNoAmpersand}=require('./helpers');
const T='2026-10-20T02:00:00.000Z';
function record(reg=5){return {v:1,cls:'3E1',reg,updatedAt:T,baseClearedAt:'',agreed:T,done:{},submitted:{},reached:{},first:{},second:{},answers:{'s1.q1':{v:'Keep this answer',t:T}},ui:{}};}
async function seed(request){await resetServer(request,['3E1','Empty']);for(const reg of [5,6])await apiPost(request,{action:'save',record:record(reg)});}
test('authenticated selected and all levels persist without completion, cannot be forged, survive stale saves and reset clears grants',async({request})=>{
 await seed(request);
 const action={action:'unlockStudent',class:'3E1',reg:5,levels:[3,5]};
 expect((await apiPost(request,{...action,code:'wrong-unlock-test'})).error).toBe('bad_code');
 expect((await apiPost(request,{...action,levels:[6],code:CODE()})).error).toBe('bad_levels');
 expect((await apiPost(request,{...action,reg:7,code:CODE()})).error).toBe('no_student');
 let saved=await apiPost(request,{action:'save',record:{...record(),unlockedLevels:{4:T}}});
 expect(saved.record.unlockedLevels).toEqual({});
 const unlocked=await apiPost(request,{...action,code:'  '+CODE().toLowerCase()+'  '});
 expect(unlocked.ok).toBe(true);expect(Object.keys(unlocked.record.unlockedLevels)).toEqual(['3','5']);
 for(const k of ['answers','done','submitted','first','second','reached','ui'])expect(unlocked.record[k]).toEqual(record()[k]);
 saved=await apiPost(request,{action:'save',record:{...record(),unlockedLevels:{4:T}}});
 expect(Object.keys(saved.record.unlockedLevels)).toEqual(['3','5']);
 expect((await apiGet(request,{action:'load',class:'3E1',reg:6})).record.unlockedLevels).toEqual({});
 expect((await apiPost(request,{...action,levels:[1,2,3,4,5],code:CODE()})).ok).toBe(true);
 expect(Object.keys((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.unlockedLevels)).toHaveLength(5);
 await apiPost(request,{action:'clearStudent',class:'3E1',reg:5,code:CODE()});
 expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record).toBeNull();
 expect((await apiPost(request,{action:'save',record:saved.record})).error).toBe('cleared');
});
test('footer unlock chooses a profile, selected/all levels, password errors, persistence and active student isolation',async({page,request,browser},testInfo)=>{
 await seed(request);await login(page,'3E1',5);await expect(page.locator('.welcome-card')).toBeVisible();
 await page.locator('[data-unlock-progress]').click();
 const modal=page.locator('#studentUnlockModal');const password=modal.locator('#unlockPassword');
 await expect(password).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(modal.getByRole('button',{name:'Cancel',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);await expect(page.locator('[data-unlock-progress]')).toBeFocused();
 await page.locator('[data-unlock-progress]').click();await password.fill('wrong-test-unlock');await modal.getByRole('button',{name:'Continue',exact:true}).click();await expect(modal.locator('#unlockError')).toContainText('Incorrect passcode');
 await password.fill(CODE().toLowerCase());await modal.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(modal.locator('#unlockSelection')).toBeVisible();await expect(modal.locator('#unlockClass')).toHaveValue('');
 await modal.locator('#unlockClass').selectOption('Empty');await expect(modal.locator('#unlockStatus')).toContainText('No registered student profiles');
 await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStudent option')).toHaveCount(3);await modal.locator('#unlockStudent').selectOption('6');
 await expect(modal.locator('input[type=checkbox]:checked')).toHaveCount(0);await expect(modal.locator('#applyUnlock')).toBeDisabled();
 await modal.locator('input[type=checkbox][value="3"]').check();await modal.locator('input[type=checkbox][value="5"]').check();
 await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
 await page.screenshot({path:`tests/screenshots/unlock-selected-${testInfo.project.name}.png`});
 await modal.locator('#applyUnlock').click();await expect(page.locator('#studentUnlocked')).toBeVisible();
 expect(await page.evaluate(()=>student.reg)).toBe(5);expect(await page.evaluate(()=>isUnlocked(3))).toBe(false);
 await page.locator('#studentUnlocked button').click();
 // A new browser context loads the server grants, while other levels stay locked.
 const ctx=await browser.newContext({viewport:testInfo.project.use.viewport});const other=await ctx.newPage();
 await other.goto('http://localhost:8788/');await expect(other.locator('#classInput')).toHaveValue('3E1');await other.locator('#regInput').selectOption('6');await other.locator('#nameInput').fill('Test Student 6');await other.locator('#startBtn').click();await expect(other.locator('.welcome-card')).toBeVisible();
 expect(await other.evaluate(()=>isUnlocked(3))).toBe(true);expect(await other.evaluate(()=>isUnlocked(4))).toBe(false);
 await other.goto('http://localhost:8788/#level3');await expect(other.locator('h1.page-title')).toContainText('Level 3');
 await expect(other.locator('.step-tab[aria-disabled=true]')).toHaveCount(0);expect(await other.evaluate(()=>Object.keys(rec.done))).toEqual([]);
 await ctx.close();
 // Grant all levels to the current profile too, without switching identity.
 await page.locator('[data-unlock-progress]').click();await password.fill(CODE());await modal.getByRole('button',{name:'Continue',exact:true}).click();await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStudent option')).toHaveCount(3);await modal.locator('#unlockStudent').selectOption('5');await modal.locator('#unlockAllSelection').click();await expect(modal.locator('input[type=checkbox]:checked')).toHaveCount(5);await modal.locator('#applyUnlock').click();await expect(page.locator('#studentUnlocked')).toBeVisible();await page.locator('#studentUnlocked button').click();
 expect(await page.evaluate(()=>[1,2,3,4,5].every(isUnlocked))).toBe(true);expect(await page.evaluate(()=>Object.keys(rec.done))).toEqual([]);await page.reload();await expect.poll(()=>page.evaluate(()=>Object.keys(rec.unlockedLevels || {}).length)).toBe(5);
 await page.goto('/#level2');await page.evaluate(()=>{setUi('s2.card',16);renderLevel(2);});await expect(page.locator('#pathLabel8')).toBeVisible();await expect(page.locator('#lessonNext')).toBeEnabled();
 await expectNoSidewaysScroll(page);expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.answers['s1.q1'].v).toBe('Keep this answer');
});

test('failed backend action preserves access and clearing class during a pending load does not freeze the dialog',async({page,request})=>{
 await seed(request);await page.goto('/');await page.locator('[data-unlock-progress]').click();const modal=page.locator('#studentUnlockModal');await modal.locator('#unlockPassword').fill(CODE());await modal.getByRole('button',{name:'Continue',exact:true}).click();
 let release;const pending=new Promise(r=>{release=r;});
 await page.route('**/api',async route=>{const b=route.request().postDataJSON();if(b.action==='profileList'){await pending;}await route.continue();});
 await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStatus')).toContainText('Loading');await modal.locator('#unlockClass').selectOption('');release();
 await modal.locator('#unlockClass').selectOption('3E1');await expect(modal.locator('#unlockStudent option')).toHaveCount(3);await modal.locator('#unlockStudent').selectOption('5');await modal.locator('#unlockAllSelection').click();await expect(modal.locator('#applyUnlock')).toBeEnabled();
 await page.unroute('**/api');
 await page.route('**/api',route=>{const b=route.request().postDataJSON();if(b.action==='unlockStudent')return route.fulfill({json:{ok:false,error:'unknown_action'}});return route.continue();});
 await modal.locator('#applyUnlock').click();await expect(modal.locator('#unlockError')).toContainText('update Apps Script');expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.unlockedLevels).toEqual({});
 await page.unroute('**/api');await page.route('**/api',route=>{const b=route.request().postDataJSON();return b.action==='unlockStudent'?route.abort():route.continue();});await modal.locator('#applyUnlock').click();await expect(modal.locator('#unlockError')).toContainText('internet');expect((await apiGet(request,{action:'load',class:'3E1',reg:5})).record.unlockedLevels).toEqual({});
});
