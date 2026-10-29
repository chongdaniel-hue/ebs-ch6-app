const {test,expect}=require('@playwright/test');
const {resetServer,login,expectNoSidewaysScroll}=require('./helpers');
test('all reflections need at least one full sentence (20 characters) before Next and Finish, and are kept after reload',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await login(page,'3E1',7);await page.locator('#briefing button').click();
 await page.evaluate(()=>{rec.done[1]='2026-10-26T00:00:00Z';setUi('s2.cardLayout','cards15');setUi('s2.card',7);saveLocal();});await page.goto('/#level2');
 const modal=page.locator('#reflectionRequired');await expect(page.locator('#lessonProgressText')).toContainText('8 of 13 · Watch: A better welcome at Nexora');
 await page.locator('#lessonNext').click();await expect(modal).toContainText('Please complete all questions before moving on.');await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);
 await page.locator('[data-answer="s2.video"]').fill('ok');await page.locator('#lessonNext').click();await expect(modal).toContainText('Your answer is too short. Write at least one full sentence in each box.');await modal.getByRole('button').click();await expect(page.locator('[data-answer="s2.video"]')).toBeFocused();
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June warmly and offered help.');
 await expectNoSidewaysScroll(page);await page.locator('[data-reflection="s2.video"]').screenshot({path:`tests/screenshots/required-reflection-${testInfo.project.name}.png`});
 await page.locator('#lessonNext').click();await expect(modal).toHaveCount(0);await expect(page.locator('#lessonProgressText')).toContainText('9 of 13 · Quick check');
 await page.reload();expect(await page.evaluate(()=>reflectionSaved('s2.video'))).toBe(true);
 // Level 3 (stored as 7): the two Think about it boxes on cards 6 and 7.
 await page.evaluate(()=>{rec.done[2]='2026-10-26T00:00:00Z';setUi('s7.card',5);saveLocal();});await page.goto('/#level3');await expect(page.locator('#lessonProgressText')).toContainText('6 of 7');await page.locator('#lessonNext').click();await expect(modal).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('[data-answer="s2.think1"]').fill('The replies did not acknowledge the customer.');await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('7 of 7 · Handling returns');
 await expect(page.locator('#lessonNext')).toHaveText('Finish Level 3');
 await page.locator('#lessonNext').click();await expect(modal).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('[data-answer="s2.think2"]').fill('Used products cannot be returned for hygiene reasons.');await page.locator('#lessonNext').click();await expect(page.locator('#badgeModal')).toBeVisible();
 expect(await page.locator('.think-title').allTextContents()).not.toContain('Think about it (optional)');
});
