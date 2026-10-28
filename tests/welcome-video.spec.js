const {test,expect}=require('@playwright/test');
const fs=require('fs');const path=require('path');
const {resetServer,login,CODE,expectNoSidewaysScroll,expectNoAmpersand}=require('./helpers');

const VIDEOS={
 betterWelcome:{id:'_Esvxks4ZjQ',heading:'Watch: A better welcome at Nexora',prompt:'Watch this video showing poor and good service. Notice what Alex does differently and how June responds.',title:'Video: A better welcome at Nexora'},
 serviceRecovery:{id:'IWZ4xwI2fF8',heading:'Watch: The 8 steps in action',prompt:'Watch Alex use all 8 steps to help June with her cracked phone.',title:'Video: Alex uses the 8 steps of service recovery to help June with her cracked phone'}
};

// Every check that a video is embedded from YouTube the agreed way, with nothing that starts playback.
async function expectYouTubeVideo(page,key){
 const v=VIDEOS[key];const frame=page.locator(`.video-frame[data-video="${key}"]`);await expect(frame).toHaveCount(1);
 const iframe=frame.locator('iframe');
 await expect(iframe).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${v.id}?rel=0`);
 const src=await iframe.getAttribute('src');expect(src).not.toMatch(/autoplay|mute/i);expect(await iframe.getAttribute('autoplay')).toBeNull();
 await expect(iframe).toHaveAttribute('title',v.title);await expect(iframe).toHaveAttribute('loading','lazy');
 await expect(iframe).toHaveAttribute('allow','encrypted-media; picture-in-picture; fullscreen');expect(await iframe.getAttribute('allowfullscreen')).not.toBeNull();
 await expect(iframe).toHaveAttribute('referrerpolicy','strict-origin-when-cross-origin');
 await expect(page.locator(`#video_${key}_title`)).toHaveText(v.heading);await expect(page.locator(`#video_${key}_prompt`)).toHaveText(v.prompt);
 const link=frame.locator('xpath=following-sibling::p[1]/a');await expect(link).toHaveText('Video not loading? Watch it on YouTube');
 await expect(link).toHaveAttribute('href',`https://youtu.be/${v.id}`);await expect(link).toHaveAttribute('target','_blank');
 // 16:9 box inside the column, never wider than the page, with the thin card border.
 const box=await frame.evaluate(el=>{const r=el.getBoundingClientRect(),i=el.querySelector('iframe').getBoundingClientRect(),cs=getComputedStyle(el);return {w:r.width,h:r.height,iw:i.width,right:r.right,page:document.documentElement.clientWidth,border:cs.borderTopWidth,radius:parseFloat(cs.borderTopLeftRadius)};});
 expect(Math.abs(box.w/box.h-16/9)).toBeLessThan(0.03);expect(box.right).toBeLessThanOrEqual(box.page);expect(box.iw).toBeGreaterThan(box.w-4);expect(box.border).toBe('1px');expect(box.radius).toBeGreaterThan(0);
}

test('both YouTube videos are embedded privately, without autoplay, in their agreed places',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await page.goto('/#teacher-preview-2');await page.locator('#teacherCode').fill(CODE());await page.locator('#teacherEnter').click();
 // Video A in Level 2, Video B in Level 3.
 await expect(page.locator('.video-frame iframe')).toHaveCount(1);await expect(page.locator('video, .video-transcript, [src*=".mp4"]')).toHaveCount(0);
 await expectYouTubeVideo(page,'betterWelcome');
 // Video A: card 8, right after card 7 (the three approaches and C03), with its reflection under it.
 const partA=page.locator('#teacherPart2_7_0');await expect(partA.locator('.video-frame[data-video="betterWelcome"]')).toHaveCount(1);
 await expect(page.locator('#teacherPart2_6_0 [data-img="C03"]')).toHaveCount(1);
 await expect(partA.locator('.video-link + .think-card [data-answer="s2.video"]')).toHaveCount(1);
 await expect(partA.locator('.think-card label')).toHaveText('What did Alex do to make June feel welcome? Why did she bring her friend back?');
 await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
 await page.locator('#teacherPart2_7_0').screenshot({path:`tests/screenshots/video-a-${testInfo.project.name}.png`});
 // Video B: Level 3 card 5, on its own card straight after the 8 steps.
 await page.goto('/#teacher-preview-3');
 await expect(page.locator('.video-frame iframe')).toHaveCount(1);await expectYouTubeVideo(page,'serviceRecovery');
 await expect(page.locator('#teacherPart7_4_0 .video-frame[data-video="serviceRecovery"]')).toHaveCount(1);
 await expect(page.locator('#teacherPart7_3_0 .path-stop')).toHaveCount(8);await expect(page.locator('#teacherPart7_3_0 .video-frame')).toHaveCount(0);
 await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
 await page.locator('#teacherPart7_4_0 .lesson-video').screenshot({path:`tests/screenshots/video-b-${testInfo.project.name}.png`});
 expect(await page.evaluate(()=>localStorage.getItem('ch6_active'))).toBeNull();
});

test('students see Video A on card 8, and s2.video is required before Next and before Finish',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await login(page,'3E1',7);await page.locator('#briefing button').click();
 await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');setUi('s2.cardLayout','cards15');setUi('s2.card',6);saveLocal();});
 await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toContainText('7 of 13');await expect(page.locator('.video-frame')).toHaveCount(0);
 await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toHaveCount(0);await expect(page.locator('#lessonProgressText')).toContainText('8 of 13 · Watch: A better welcome at Nexora');
 await expectYouTubeVideo(page,'betterWelcome');await expectNoSidewaysScroll(page);
 await page.locator('#lessonCard').screenshot({path:`tests/screenshots/video-a-card-${testInfo.project.name}.png`});
 const modal=page.locator('#reflectionRequired');await page.locator('#lessonNext').click();await expect(modal).toBeVisible();await page.keyboard.press('Escape');
 await page.evaluate(()=>{setAnswer('s2.think1','The replies did not acknowledge the customer.');setAnswer('s2.think2','Used products cannot be returned for hygiene reasons.');finishLevel(2);});await expect(modal).toBeVisible();await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>isDone(2))).toBe(false);
 await page.evaluate(()=>{setAnswer('s2.video','Alex greeted June warmly and offered help.');finishLevel(2);});await expect(page.locator('#badgeModal')).toBeVisible();
});

test('the 8 steps all show at once (Level 3 card 4), and Video B is on its own card next (card 5)',async({page,request},testInfo)=>{
 await resetServer(request,['3E1']);await login(page,'3E1',8);await page.locator('#briefing button').click();
 await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');setUi('s7.card',3);saveLocal();});await page.goto('/#level3');
 await expect(page.locator('#lessonProgressText')).toContainText('4 of 7 · The 8 service recovery steps');
 await expect(page.locator('#lessonCard')).toContainText("Follow Nexora's staff member as he uses the 8 steps with a customer whose new phone screen cracked on its own.");
 await expect(page.locator('.path-stop')).toHaveCount(8);await expect(page.locator('#showStepBtn')).toHaveCount(0);await expect(page.locator('.slide-in')).toHaveCount(0);
 await expect(page.locator('.video-frame')).toHaveCount(0);await expect(page.locator('#lessonNext')).toBeEnabled();await expect(page.locator('#lessonNextNote')).toHaveCount(0);
 await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toHaveCount(0);
 await expect(page.locator('#lessonProgressText')).toContainText('5 of 7 · Watch: The 8 steps in action');
 await expectYouTubeVideo(page,'serviceRecovery');
 await expect(page.locator('#lessonCard .think-card')).toHaveCount(0);
 await expectNoSidewaysScroll(page);await page.locator('#lessonCard .lesson-video').screenshot({path:`tests/screenshots/video-b-card-${testInfo.project.name}.png`});
 // Read aloud leaves the video link out.
 const spoken=await page.evaluate(()=>blockSpeechText(document.getElementById('lessonCard')));
 expect(spoken).toContain('Watch Alex use all 8 steps');expect(spoken).not.toContain('Video not loading');expect(spoken).not.toContain('youtube');
 await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toHaveCount(0);await expect(page.locator('#lessonProgressText')).toContainText('6 of 7');
});

test('no video files are kept in assets',async()=>{
 const found=[];const walk=d=>fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(mp4|webm|mov|m4v|vtt)$/i.test(e.name))found.push(p);});
 walk(path.join(__dirname,'..','assets'));expect(found).toEqual([]);
});
