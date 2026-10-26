const {test,expect}=require('@playwright/test');
const {resetServer,CODE,expectNoSidewaysScroll}=require('./helpers');
test('welcome video sits after benefits, plays on request and leaves progress unchanged',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await page.goto('/#teacher-preview-2');await page.locator('#teacherCode').fill(CODE());await page.locator('#teacherEnter').click();
 const video=page.locator('video');await expect(video).toHaveCount(1);await expect(video).toHaveAttribute('controls','');expect(await video.getAttribute('autoplay')).toBeNull();
 await expect(page.locator('#nexoraVideoTitle')).toHaveText('Watch: A better welcome at Nexora');await expect(page.locator('.lesson-video .think-card')).toContainText('Why did she bring her friend back?');
 await expect.poll(()=>video.evaluate(v=>v.readyState)).toBeGreaterThan(0);
 expect(await video.evaluate(v=>v.paused)).toBe(true);expect(await video.evaluate(v=>v.duration)).toBeGreaterThan(44);
 const order=await page.locator('#teacherPart2_0_1').innerText();expect(order.indexOf('Why does quality')).toBeLessThan(order.indexOf('Watch: A better'));
 await video.evaluate(v=>({width:v.clientWidth,height:v.clientHeight}));
 await expectNoSidewaysScroll(page);await page.locator('.lesson-video').screenshot({path:`tests/screenshots/welcome-video-${testInfo.project.name}.png`});
 await video.evaluate(v=>v.play());await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(0);await video.evaluate(v=>v.pause());expect(await video.evaluate(v=>v.paused)).toBe(true);
 expect(await page.evaluate(()=>localStorage.getItem('ch6_active'))).toBeNull();
});
