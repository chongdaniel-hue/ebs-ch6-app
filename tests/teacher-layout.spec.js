const {test,expect}=require('@playwright/test');
const {CODE,resetServer,expectNoSidewaysScroll}=require('./helpers');
test('teacher preview uses student cards and freely navigable activity steps',async({page,request},testInfo)=>{
 await resetServer(request,['PREVIEW']);await page.goto('/#teacher-preview-2');await page.locator('#teacherCode').fill(CODE());await page.locator('#teacherEnter').click();
 await expect(page.locator('#lessonCard')).toHaveCount(1);await expect(page.locator('#lessonProgressText')).toContainText('1 of 13');
 await page.locator('#previewNext').click();await expect(page.locator('#lessonProgressText')).toContainText('2 of 13');
 for(let i=0;i<5;i++)await page.locator('#previewNext').click();
 await expect(page.locator('img[data-img="STAGE1_BANNER"]')).toBeVisible();await expectNoSidewaysScroll(page);
 await page.screenshot({path:testInfo.outputPath('teacher-layout.png'),fullPage:true});
 await page.locator('a[href="#teacher-preview-4"]').click();await expect(page.locator('.step-tab[aria-disabled="true"]')).toHaveCount(0);
 await page.locator('[data-preview-tab]').last().click();await expect(page.locator('.step-tab[aria-current="step"]')).toHaveCount(1);
 await expect(page.locator('.teacher-lesson-part textarea:enabled')).toHaveCount(0);await expectNoSidewaysScroll(page);
});
