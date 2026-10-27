const {test,expect}=require('@playwright/test');
const {resetServer,login,expectNoSidewaysScroll,expectNoAmpersand,CODE}=require('./helpers');
async function start(page,request){await resetServer(request,['NEW']);await login(page,'NEW',1);await page.locator('#briefing button').click();await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});}
test('Level 2 has 15 cards with back/next progress, automatic saving and required reflections',async({page,request},info)=>{
 await start(page,request);await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toHaveText('1 of 15 · 4 key terms');await expect(page.locator('#lessonCard')).toHaveCount(1);await expect(page.locator('#lessonBack')).toBeDisabled();
 await expect(page.locator('#lessonCard .term-definition')).toHaveCount(4);await expect(page.locator('#lessonCard .exam-label').first()).toContainText('Exam wording');
 const labels=['4 key terms','What is customer service?','Why quality customer service matters','Skills and qualities','Good product knowledge','The four stages','Stage 1: Approaching customers','Watch: A better welcome at Nexora','Quick check','Stage 2: Presenting product information','Stage 3: Closing the customer experience positively','Stage 4: Service breakdown and service recovery','The 8 service recovery steps','Real-life example: poor service recovery','Handling returns'];
 expect(await page.evaluate(()=>L2_CARDS.map(c=>c.label))).toEqual(labels);
 await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('2 of 15');await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toHaveCount(0);await expect(page.locator('#lessonProgressText')).toContainText('3 of 15');
 await page.evaluate(()=>{setUi('s2.card',7);renderLevel(2);});await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June and helped her choose a phone.');await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('9 of 15');await page.locator('#lessonBack').click();await expect(page.locator('[data-answer="s2.video"]')).toHaveValue('Alex greeted June and helped her choose a phone.');
 await page.reload();await expect(page.locator('#lessonProgressText')).toContainText('8 of 15');
 // The four stages, the four-panel comic and its own Remember this line.
 await page.evaluate(()=>{setUi('s2.card',5);renderLevel(2);});await expect(page.locator('.stage-row')).toHaveCount(4);
 await expect(page.locator('.stage-row th')).toHaveText(['1. Approaching customers','2. Presenting product information','3. Closing the customer experience positively','4. Performing service recovery']);
 await expect(page.locator('.stage-row.stage-3 td')).toHaveText('Summarise what the customer decided and any next steps, thank the customer, and give good after-sales support (e.g. warranty, repairs, exchanges and refunds).');
 await expect(page.locator('[data-img="C02"]')).toHaveAttribute('src','assets/img/C02-four-stages-v2.jpg');
 await expect(page.locator('.recap-card p')).toHaveText('The four stages are approaching customers, presenting product information, closing the customer experience positively and performing service recovery.');
 await expect(page.locator('#lessonCard')).not.toContainText('support services');
 await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/new-four-stages-${info.project.name}.png`,fullPage:true});
 // Stage 3: after-sales support, four cards.
 await page.evaluate(()=>{setUi('s2.card',10);renderLevel(2);});await expect(page.locator('#lessonCard h2')).toHaveText('After-sales support');await expect(page.locator('#lessonCard .icon-card')).toHaveCount(4);
 await expect(page.locator('#lessonCard .icon-card').nth(3)).toHaveText(/Exchanges and refunds\s*Explain the store's rules for exchanges and refunds\./);
 // Stage 4: definitions, C04, then the two loyalty lines.
 await page.evaluate(()=>{setUi('s2.card',11);renderLevel(2);});await expect(page.locator('#lessonCard [data-img="C04"]')).toHaveCount(1);await expect(page.locator('#lessonCard .second-chance')).toHaveText('A complaint is a second chance. If you fix it well, the customer may become more loyal. If you ignore it, they may go to a competitor and tell their friends.');
 // Card 14: the 8 step labels above the question.
 await page.evaluate(()=>{setUi('s2.card',13);renderLevel(2);});await expect(page.locator('.step-strip li')).toHaveText(['1 Listen','2 Be patient','3 Apologise','4 Acknowledge','5 Ask questions','6 Offer solutions','7 Refer','8 Thank']);
 await expect(page.locator('[data-reflection="s2.think1"] label')).toHaveText('Was this good service recovery? Which of the 8 service recovery steps were missing?');
 await page.evaluate(()=>{setUi('s2.card',14);renderLevel(2);});await expect(page.locator('.recap-card p')).toHaveText("If a customer is unhappy with a product, you can offer a replacement, an exchange or a refund. Always check the store's return rules first.");
 await expectNoAmpersand(page);
});
test('quick check: nothing pre-selected, instant feedback, one more try, then the answer; required before Next; not scored',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{setUi('s2.cardLayout','cards15');setUi('s2.card',8);saveLocal();});await page.goto('/#level2');
 await expect(page.locator('#lessonCard h2')).toHaveText('Quick check: which approach is this?');await expect(page.locator('#lessonCard')).toContainText('Tap one for each.');
 await expect(page.locator('#lessonCard .listen-btn')).toHaveCount(0);
 await expect(page.locator('.qc-btn')).toHaveCount(9);await expect(page.locator('.qc-btn.picked')).toHaveCount(0);await expect(page.locator('.qc-btn[aria-pressed="true"]')).toHaveCount(0);
 await page.locator('#lessonNext').click();await expect(page.locator('#notFinished')).toContainText('a)');await page.keyboard.press('Escape');
 const item=id=>page.locator(`.qc-item[data-key="s2.qc.${id}"]`);
 await item('a').getByRole('button',{name:'Greeting'}).click();await expect(item('a').locator('.feedback.right')).toHaveText('✓ Correct: the staff member welcomes a regular customer by name. That is the greeting approach.');await expect(item('a').locator('.qc-btn:enabled')).toHaveCount(0);
 await item('b').getByRole('button',{name:'Greeting'}).click();await expect(item('b').locator('.feedback.wrong')).toHaveText('✗ Is this a welcome, or a question showing the staff member is ready to help?');
 await item('b').getByRole('button',{name:'Service'}).click();await expect(item('b').locator('.feedback.right')).toContainText('✓ Correct:');
 await item('c').getByRole('button',{name:'Greeting'}).click();await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ What is the customer looking at, and what does the staff member talk about?');
 await item('c').getByRole('button',{name:/^Service/}).click();await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ The answer is Product: the staff member talks about the phone the customer is looking at. That is the product approach.');
 await expect(item('c').locator('.right-tag')).toBeVisible();
 await page.reload();await expect(item('b').locator('.feedback.right')).toBeVisible();await expect(item('c').locator('.feedback.wrong')).toContainText('The answer is Product');
 await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/quick-check-${info.project.name}.png`,fullPage:true});
 await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('10 of 15');
 expect(await page.evaluate(()=>ALL_MARKED().some(it=>/qc/.test(it.attemptKey)) || Object.keys(rec.first).some(k=>/qc/.test(k)))).toBe(false);
});
test('chat completion accepts any pasted text containing gemini, with no server check',async({page,request})=>{
 await start(page,request);const calls=[];page.on('request',r=>{if(/validateConversationLink/.test(r.postData()||''))calls.push(r.url());});
 const help='Please paste the link to your Gemini chat. It should contain the word Gemini.';
 for(const n of [3,4]){
  await page.goto('/#level'+n);const input=page.locator('#conversationLink'+n),tick=page.locator('.tick-input'),note=page.locator('#conversationError'+n);await expect(input).toHaveValue('');await expect(tick).not.toBeChecked();await expect(note).toHaveText('');
  await input.fill('https://example.com/share/fake');await expect(note).toHaveText(help);await tick.click();await expect(tick).toBeChecked();await expect(page.locator('#nextBtn')).toBeDisabled();await expect(page.locator('#conversationError'+n)).toHaveText(help);
  await page.locator('#conversationLink'+n).fill('My chat: g.co/GEMINI/share/abc');await expect(page.locator('#conversationError'+n)).toHaveText('');await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.reload();await expect(page.locator('#conversationLink'+n)).toHaveValue('My chat: g.co/GEMINI/share/abc');await expect(page.locator('.tick-input')).toBeChecked();await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.locator('.tick-input').click();await expect(page.locator('#nextBtn')).toBeDisabled();
 }
 expect(calls).toEqual([]);
});
test('Suzzie checklist, colours, saved-value compatibility and report evidence',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{setUi('s4.tab',1);});await page.goto('/#level4');await expect(page.locator('[data-roleplay-stage]')).toHaveCount(4);await expect(page.locator('[data-roleplay-stage]:checked')).toHaveCount(0);
 await page.locator('[data-answer="s4.q1"]').fill('I listened carefully to Suzzie.');await page.locator('[data-answer="s4.q2"]').fill('I would ask about the colour and size first.');await page.locator('#submitL4').click();await expect(page.locator('#notFinished')).toContainText('choose the stages');await page.keyboard.press('Escape');await page.locator('[data-roleplay-stage="Close"]').check();await page.locator('#submitL4').click();await expect(page.locator('.recap-card')).toBeVisible();
 await page.evaluate(()=>{setUi('s4.tab',0);renderLevel(4);});await page.locator('#stylezFacts summary').click();await expect(page.locator('#stylezFacts')).toContainText('black, white, navy blue and grey');
 await page.goto('/#level3');await page.evaluate(()=>{setUi('s3.tab',1);setAnswer('s3.q2.P',3);renderLevel(3);});await expect(page.locator('#sel_P')).toHaveValue('3');await expect(page.locator('#sel_P option:checked')).toHaveText('Performing service recovery');await expect(page.locator('#sel_P option')).toHaveText(['Choose a stage…','Approaching customers','Presenting product information','Closing the customer experience positively','Performing service recovery']);
 await page.goto('/#report');await expect(page.locator('body')).toContainText('Which stages did you do?');await expect(page.locator('body')).toContainText('Close');await expectNoSidewaysScroll(page);
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
test('old card positions (21-card and 10-card layouts) move to the matching card without losing answers',async({page,request})=>{await start(page,request);await page.evaluate(()=>{setUi('s2.card',17);setAnswer('s2.video','Alex welcomed June and offered to help.');});await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toContainText('13 of 15');expect(await page.evaluate(()=>getAnswer('s2.video'))).toBe('Alex welcomed June and offered to help.');await page.reload();await expect(page.locator('#lessonProgressText')).toContainText('13 of 15');
 await page.evaluate(()=>{setUi('s2.cardLayout','compact10');setUi('s2.card',4);renderLevel(2);});await expect(page.locator('#lessonProgressText')).toContainText('7 of 15 · Stage 1');
 await page.evaluate(()=>{setUi('s2.cardLayout','compact10');setUi('s2.card',9);renderLevel(2);});await expect(page.locator('#lessonProgressText')).toContainText('15 of 15');});
test('report shows "Nothing to look at again" only once Level 3 Q2 and Level 5 Q1 and Q2 have all been tried',async({page,request})=>{
 await start(page,request);
 await page.goto('/#report');await expect(page.locator('.look-none')).toHaveText('Finish Levels 3 and 5 to see what to look at again.');
 await page.evaluate(()=>{L3_Q2.forEach(it=>rec.first[it.attemptKey]={a:it.correct,ok:true,t:nowIso()});saveLocal();renderReport();});
 await expect(page.locator('.look-none')).toHaveText('Finish Levels 3 and 5 to see what to look at again.');
 await page.evaluate(()=>{L5_MARKED.forEach(it=>rec.first[it.attemptKey]={a:it.correct,ok:true,t:nowIso()});saveLocal();renderReport();});
 await expect(page.locator('.look-none')).toContainText('Nothing to look at again. You got everything right on the first try!');
 await page.evaluate(()=>{rec.first['s5q4'].ok=false;renderReport();});
 await expect(page.locator('.look-none')).toHaveCount(0);await expect(page.locator('.look-list li')).toHaveCount(1);
});
test('home hides the saved profile card; Level 2 pictures enlarge; Back and Next stay on screen',async({page,request},info)=>{
 await start(page,request);await page.goto('/#home');await expect(page.locator('#studentNameForm')).toHaveCount(0);await expect(page.locator('.topbar-chip')).toContainText('Test Student 1');await expect(page.locator('#switchLink')).toContainText('Sharing this device? Switch student');
 await page.goto('/#level2');await page.evaluate(()=>{setUi('s2.card',2);renderLevel(2);});
 const nav=page.locator('.lesson-card-nav');await expect(nav).toHaveCSS('position','sticky');
 const box=await nav.boundingBox();const vh=page.viewportSize().height;expect(box.y+box.height).toBeLessThanOrEqual(vh+1);expect(box.y).toBeGreaterThan(vh-120);
 for(const b of await page.locator('.lesson-card-nav .btn').all()){const bb=await b.boundingBox();expect(bb.height).toBeGreaterThanOrEqual(44);}
 const zoom=page.locator('.zoom-btn').first();const alt=await zoom.locator('img').getAttribute('alt');await zoom.click();
 await expect(page.locator('.zoom-backdrop .zoom-img')).toHaveAttribute('alt',alt);await expect(page.locator('.zoom-close')).toBeFocused();await page.keyboard.press('Escape');await expect(page.locator('.zoom-backdrop')).toHaveCount(0);await expect(zoom).toBeFocused();
 await zoom.click();await page.locator('.zoom-close').click();await expect(page.locator('.zoom-backdrop')).toHaveCount(0);
 if(info.project.name==='laptop'){const h=await zoom.locator('img').evaluate(i=>i.getBoundingClientRect().height);expect(h).toBeLessThanOrEqual(vh*0.45+1);}
 await expectNoSidewaysScroll(page);
});
