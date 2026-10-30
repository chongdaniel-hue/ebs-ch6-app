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

test('Home keeps teachers on the main route and every level opens as preview',async({page,request})=>{
 await resetServer(request,['PREVIEW']);await page.goto('/#teacher');await page.locator('#teacherCode').fill(CODE());await page.locator('#teacherEnter').click();
 await page.locator('#homeBtn').click();await expect(page).toHaveURL(/#teacher-home$/);await expect(page.locator('.route .level-card')).toHaveCount(7);
 await page.locator('a[href="#teacher-preview-6"]').click();await expect(page.getByRole('heading',{name:'Level 6: Win Suzzie Back',exact:true})).toBeVisible();await page.locator('#homeBtn').click();await expect(page).toHaveURL(/#teacher-home$/);await expect(page.getByRole('heading',{name:'Teacher view',exact:true})).toBeVisible();
 await page.reload();await expect(page.locator('#teacherCode')).toBeVisible();await page.locator('#teacherCode').fill(CODE());await page.locator('#teacherEnter').click();await expect(page.locator('.route .level-card')).toHaveCount(7);
});
