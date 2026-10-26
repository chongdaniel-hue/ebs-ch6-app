const {test,expect}=require('@playwright/test');
const {resetServer,login,expectNoSidewaysScroll}=require('./helpers');
test('all reflections need saved text, edits invalidate saves, and next/finish show errors',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await login(page,'3E1',7);await page.locator('#briefing button').click();
 await page.evaluate(()=>{rec.done[1]='2026-10-26T00:00:00Z';saveLocal();});await page.goto('/#level2');await page.locator('#continueBtn').click();
 const modal=page.locator('#reflectionRequired');await page.locator('#continueBtn').click();await expect(modal).toContainText('Please complete all questions and select Save');await modal.getByRole('button').click();
 await page.locator('[data-save-reflection="s2.video"]').click();await expect(modal).toBeVisible();await modal.getByRole('button').click();
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June and offered help.');await page.locator('#continueBtn').click();await expect(modal).toBeVisible();await modal.getByRole('button').click();await page.locator('[data-save-reflection="s2.video"]').click();
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June warmly and offered help.');await page.locator('#continueBtn').click();await expect(modal).toBeVisible();await modal.getByRole('button').click();await page.locator('[data-save-reflection="s2.video"]').click();
 await expectNoSidewaysScroll(page);await page.locator('.lesson-video .think-card').screenshot({path:`tests/screenshots/required-reflection-${testInfo.project.name}.png`});await page.locator('#continueBtn').click();await expect(page.locator('#part2')).toBeVisible();
 await page.reload();expect(await page.evaluate(()=>reflectionSaved('s2.video'))).toBe(true);
 await page.evaluate(()=>{setUi('s2.tab',2);rec.reached['s2.tabs']=2;rec.reached['s2.t2']=3;saveLocal();renderLevel(2);});
 await page.locator('#continueBtn').click();await expect(modal).toBeVisible();await modal.getByRole('button').click();await page.locator('[data-answer="s2.think1"]').fill('The replies did not acknowledge the customer.');await page.locator('[data-save-reflection="s2.think1"]').click();await page.locator('#continueBtn').click();await page.locator('#continueBtn').click();
 await page.locator('#finishBtn').click();await expect(modal).toBeVisible();await modal.getByRole('button').click();await page.locator('[data-answer="s2.think2"]').fill('Used products cannot be returned for hygiene reasons.');await page.locator('[data-save-reflection="s2.think2"]').click();await page.locator('#finishBtn').click();await expect(page.locator('#badgeModal')).toBeVisible();
 expect(await page.locator('.think-title').allTextContents()).not.toContain('Think about it (optional)');
});
