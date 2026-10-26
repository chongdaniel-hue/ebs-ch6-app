const {test,expect}=require('@playwright/test');
const {resetServer,login,expectNoSidewaysScroll,expectNoAmpersand,CODE}=require('./helpers');
async function start(page,request){await resetServer(request,['NEW']);await login(page,'NEW',1);await page.locator('#briefing button').click();await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});}
test('Level 2 has one card, back/next progress, automatic saving and required reflections',async({page,request},info)=>{
 await start(page,request);await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toContainText('1 of 10');await expect(page.locator('#lessonCard')).toHaveCount(1);await expect(page.locator('#lessonBack')).toBeDisabled();
 await page.locator('#lessonNext').click();await expect(page.locator('[data-save-reflection]')).toHaveCount(0);await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June and helped her choose a phone.');await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('3 of 10');await page.locator('#lessonBack').click();await expect(page.locator('[data-answer="s2.video"]')).toHaveValue('Alex greeted June and helped her choose a phone.');
 await page.reload();await expect(page.locator('#lessonProgressText')).toContainText('2 of 10');
 await page.evaluate(()=>{setUi('s2.card',3);renderLevel(2);});await expect(page.locator('.stage-row')).toHaveCount(5);await expect(page.locator('[data-img="C02"]')).toHaveAttribute('src','assets/img/C02-five-stages.png');
 await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/new-five-stages-${info.project.name}.png`,fullPage:true});
 await page.evaluate(()=>{setUi('s2.card',7);renderLevel(2);});await expect(page.locator('.path-stop')).toHaveCount(8);
 await expect(page.locator('#recoveryNextStep,#recoveryBackStep')).toHaveCount(0);await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('9 of 10');
});
test('chat completion uses backend checks and invalid-link popups without manual confirmation controls',async({page,request})=>{
 await start(page,request);
 for(const n of [3,4]){
  await page.goto('/#level'+n);const input=page.locator('#conversationLink'+n),tick=page.locator('.tick-input');await expect(page.locator('.conversation-open,.conversation-confirm')).toHaveCount(0);await expect(tick).toBeEnabled();
  await input.fill('https://example.com/share/fake');await tick.click();await expect(page.locator('#invalidConversationLink')).toContainText('link you pasted is invalid');await expect(tick).not.toBeChecked();await expect(page.locator('#nextBtn')).toBeDisabled();await page.keyboard.press('Escape');
  await input.fill('https://gemini.google.com/share/AbCdEf123456');await tick.click();await expect(tick).toBeChecked();await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.locator('#conversationLink'+n).fill('not a link');await expect(page.locator('.tick-input')).not.toBeChecked();await expect(page.locator('#nextBtn')).toBeDisabled();
 }
});
test('Suzzie checklist, colours, saved-value compatibility and report evidence',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{setUi('s4.tab',1);});await page.goto('/#level4');await expect(page.locator('[data-roleplay-stage]')).toHaveCount(5);await expect(page.locator('[data-roleplay-stage]:checked')).toHaveCount(0);
 await page.locator('[data-answer="s4.q1"]').fill('I listened carefully to Suzzie.');await page.locator('[data-answer="s4.q2"]').fill('I would ask about the colour and size first.');await page.locator('#submitL4').click();await expect(page.locator('#notFinished')).toContainText('choose the stages');await page.keyboard.press('Escape');await page.locator('[data-roleplay-stage="Support"]').check();await page.locator('#submitL4').click();await expect(page.locator('.recap-card')).toBeVisible();
 await page.goto('/#stylez');await expect(page.locator('body')).toContainText('black, white, navy blue and grey');
 await page.goto('/#level3');await page.evaluate(()=>{setUi('s3.tab',1);setAnswer('s3.q2.P',3);renderLevel(3);});await expect(page.locator('#sel_P')).toHaveValue('3');await expect(page.locator('#sel_P option:checked')).toHaveText('Performing service recovery');await expect(page.locator('#sel_P option')).toHaveText(['Choose a stage…','Approaching customers','Presenting product information','Closing the customer experience positively','Provide support services','Performing service recovery']);
 await page.goto('/#report');await expect(page.locator('body')).toContainText('Which stages did you do?');await expect(page.locator('body')).toContainText('Support');await expectNoSidewaysScroll(page);
});
test('Level 5 permits edits before retry, guards empty text and keeps first tries',async({page,request})=>{
 await start(page,request);await page.goto('/#level5');await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.type==='tf'?!it.correct:'A'));setAnswer('s5.q5','Good service brings customers back to the business.');renderLevel(5);});await page.locator('#submitL5').click();await expect(page.locator('[data-answer="s5.q5"]')).toBeEditable();await page.locator('[data-answer="s5.q5"]').fill('');await page.locator('#checkAgainBtn').click();await expect(page.locator('#notFinished')).toBeVisible();await page.keyboard.press('Escape');await page.locator('[data-answer="s5.q5"]').fill('Good service encourages customers to return and recommend the shop.');
 const first=await page.evaluate(()=>JSON.stringify(rec.first));await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.correct));renderLevel(5);});await page.locator('#checkAgainBtn').click();expect(await page.evaluate(()=>JSON.stringify(rec.first))).toBe(first);await expect(page.locator('.all-good,.missed-card')).toBeVisible();
});
test('recovery faces change red to green, confidence faces differ, champion confetti respects reduced motion',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{teacher={};renderTeacherLesson(2);});const fills=await page.locator('.path-face .mood-graphic>circle').evaluateAll(xs=>xs.map(x=>x.getAttribute('fill')));expect(fills).toHaveLength(8);expect(new Set(fills).size).toBe(8);expect(fills[0]).toBe('#ef4444');expect(fills[7]).toBe('#22c55e');
 await page.goto('/#level5');await page.evaluate(()=>{setUi('s5.tab',1);renderLevel(5);});const shapes=await page.locator('.face-options').first().locator('.mood-graphic').evaluateAll(xs=>xs.map(x=>x.outerHTML));expect(new Set(shapes).size).toBe(4);await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/new-confidence-${info.project.name}.png`,fullPage:true});
 await page.evaluate(()=>showChampionPopup());await expect(page.locator('.confetti-burst i')).toHaveCount(48);await page.keyboard.press('Escape');await page.evaluate(()=>document.querySelector('.confetti-burst')?.remove());await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>showChampionPopup());await expect(page.locator('.confetti-burst')).toHaveCount(0);
});
test('Back to my route focuses the stage just completed',async({page,request})=>{
 await start(page,request);await page.goto('/#level3');await page.evaluate(()=>showBadgePopup(3));await page.getByRole('button',{name:'Back to my route',exact:true}).click();await expect(page).toHaveURL(/#home$/);await expect(page.locator('#levelCard3')).toBeFocused();
 for(const [route,id] of [['terms','termsDone'],['report','reportBack']]){await page.goto('/#level4');await page.goto('/#'+route);await page.locator('#'+id).click();await expect(page.locator('#levelCard4')).toBeFocused();}
});
test('read aloud highlights words, follows speech boundaries and removes highlights on stop',async({page,request})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},speak:u=>{window.lastSpeech=u;u.onstart?.();}},configurable:true});window.SpeechSynthesisUtterance=function(text){this.text=text;};});
 await start(page,request);await page.goto('/#level2');await page.locator('.listen-btn').first().click();await expect(page.locator('.speech-word')).not.toHaveCount(0);await expect(page.locator('.reading-now')).toHaveCount(1);await page.evaluate(()=>{const word=speechWords[2];window.lastSpeech.onboundary({charIndex:word.start});});await expect(page.locator('.reading-now')).toHaveCount(1);await page.locator('.listen-btn').first().click();await expect(page.locator('.speech-word')).toHaveCount(0);
});

test('every lesson card has a heading, no overflow or emoji text, and correct sticky clearance',async({page,request})=>{
 await start(page,request);await page.goto('/#level2');const total=await page.evaluate(()=>lessonCards().length);
 for(let i=0;i<total;i++){await page.evaluate(i=>{setUi('s2.card',i);renderLevel(2);window.scrollTo(0,0);},i);await expectNoSidewaysScroll(page);await expectNoAmpersand(page);await expect(page.locator('#lessonCard')).toHaveCount(1);expect(await page.locator('#lessonCard').innerText()).not.toContain('Submit anyway');}
 await page.evaluate(()=>{setUi('s2.card',0);renderLevel(2);});await page.locator('#lessonNext').click();await expect.poll(()=>page.locator('#lessonCard').evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(100);
});

test('Home opens the route progress directly below the sticky header',async({page,request})=>{await start(page,request);await page.goto('/#level2');await page.locator('#homeBtn').click();await expect(page).toHaveURL(/#home$/);await expect(page.locator('#routeProgress')).toBeFocused();await expect.poll(()=>page.locator('#routeProgress').evaluate(el=>Math.abs(el.getBoundingClientRect().top-document.querySelector('.topbar').getBoundingClientRect().bottom))).toBeLessThan(25);});
test('the old 21-card position migrates to the matching compact card without losing answers',async({page,request})=>{await start(page,request);await page.evaluate(()=>{setUi('s2.card',17);setAnswer('s2.video','Alex welcomed June and offered to help.');});await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toContainText('8 of 10');await expect(page.locator('.path-stop')).toHaveCount(8);expect(await page.evaluate(()=>getAnswer('s2.video'))).toBe('Alex welcomed June and offered to help.');await page.reload();await expect(page.locator('#lessonProgressText')).toContainText('8 of 10');});
