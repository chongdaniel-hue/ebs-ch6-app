const {test,expect}=require('@playwright/test');
const {resetServer,login,expectNoSidewaysScroll,expectNoAmpersand,CODE,notesCard}=require('./helpers');
async function start(page,request){await resetServer(request,['NEW']);await login(page,'NEW',1);await page.locator('#briefing button').click();await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});}
test('the notes: Level 2 has 13 cards and Level 3 has 7, with back/next progress, automatic saving and required reflections',async({page,request},info)=>{
 await start(page,request);await page.goto('/#level2');await expect(page.locator('#lessonProgressText')).toHaveText('1 of 13 · 4 key terms');await expect(page.locator('#lessonCard')).toHaveCount(1);await expect(page.locator('#lessonBack')).toBeDisabled();
 await expect(page.locator('#lessonCard .term-definition')).toHaveCount(4);await expect(page.locator('#lessonCard .exam-label')).toHaveCount(0);await expect(page.locator('#lessonCard .term-name')).toHaveText(['Customer service','Quality customer service','Service breakdown','Service recovery']);
 const labels=['4 key terms','What is customer service?','Why quality customer service matters','Skills and qualities','Good product knowledge','The four stages','Stage 1: Approaching customers','Watch: A better welcome at Nexora','Quick check',"Stage 2: Finding out customers' needs and wants",'Stage 2: Presenting the product','Stage 2: Handling questions and objections','Stage 2: Quick check','Stage 3: Closing the customer experience positively','Stage 3: After-sales support','Stage 4: Service breakdown and service recovery','The 8 service recovery steps','Watch: The 8 steps in action','Real-life example: Poor service recovery','Handling returns'];
 expect(await page.evaluate(()=>lessonCards(2).concat(lessonCards(7)).map(c=>c.label))).toEqual(labels);
 expect(await page.evaluate(()=>[lessonCards(2).length,lessonCards(7).length])).toEqual([13,7]);
 await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('2 of 13');await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toHaveCount(0);await expect(page.locator('#lessonProgressText')).toContainText('3 of 13');
 await page.evaluate(()=>{setUi('s2.card',7);renderLevel(2);});await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('[data-answer="s2.video"]').fill('Alex greeted June and helped her choose a phone.');await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('9 of 13');await page.locator('#lessonBack').click();await expect(page.locator('[data-answer="s2.video"]')).toHaveValue('Alex greeted June and helped her choose a phone.');
 await page.reload();await expect(page.locator('#lessonProgressText')).toContainText('8 of 13');
 // The four stages, the four-panel comic and its own Remember this line.
 await page.evaluate(()=>{setUi('s2.card',5);renderLevel(2);});await expect(page.locator('.stage-row')).toHaveCount(4);
 await expect(page.locator('.stage-row th')).toHaveText(['1. Approaching customers','2. Presenting product information','3. Closing the customer experience positively','4. Performing service recovery']);
 await expect(page.locator('.stage-row.stage-2 td')).toHaveText("Find out the customer's needs, present a suitable product and handle questions or objections.");await expect(page.locator('.stage-row.stage-3 td')).toHaveText('Thank the customer, sum up what they decided and give after-sales support.');
 await expect(page.locator('[data-img="C02"]')).toHaveAttribute('src','assets/img/C02-four-stages-v2.jpg');
 await expect(page.locator('#lessonCard .recap-card')).toHaveCount(0);
 await expect(page.locator('#lessonCard')).not.toContainText('support services');
 await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/new-four-stages-${info.project.name}.png`,fullPage:true});
 // Stage 3: after-sales support, four cards, then the three enquiry chips.
 await notesCard(page,14);await expect(page.locator('#lessonCard h2')).toHaveText('After-sales support');await expect(page.locator('#lessonCard .grid-4 .icon-card')).toHaveCount(4);
 await expect(page.locator('#lessonCard .grid-4 .icon-card').nth(3)).toHaveText(/Exchanges and refunds\s*Explain the store's rules for exchanges and refunds\./);
 // Stage 4: definitions, C04, then the two textbook lines (pp. 140 and 141).
 await notesCard(page,15);await expect(page.locator('#lessonCard [data-img="C04"]')).toHaveCount(1);await expect(page.locator('#lessonCard .second-chance')).toHaveCount(0);
 await expect(page.locator('#lessonCard > p, #lessonCard .part > p').filter({hasText:/complaint|win a customer back/})).toHaveText(["A customer's complaint provides an opportunity for a business to build customer loyalty. This is because if the complaint is handled well, the customer's bad experience can be turned into a good one.","A business will lose its customers to competitors if it does not try to win a customer back."]);
 // Card 14: the 8 steps in textbook wording, 1 to 4 on the left and 5 to 8 on the right on wide screens.
 await notesCard(page,17);await expect(page.locator('.steps-details')).not.toHaveAttribute('open','');await expect(page.locator('.steps-details summary')).toHaveText('Show the 8 steps');await expect(page.locator('.step-strip')).toBeHidden();await page.locator('.steps-details summary').click();await expect(page.locator('.step-strip')).toBeVisible();await expect(page.locator('.step-strip li')).toHaveText(["1Listen carefully to the complaint. Give customers full attention.","2Be patient. Do not interrupt customers when they are describing their unhappiness.","3Apologise to the customers for the inconvenience caused.","4Acknowledge their feelings and assure them of help to solve the problem.","5Ask questions if more information is needed.","6Offer solutions.","7Refer customers to more senior staff if unable to provide them with an acceptable solution.","8Thank customers for bringing the problem to our attention."]);
 const cols=await page.locator('.step-strip li').evaluateAll(li=>li.map(x=>Math.round(x.getBoundingClientRect().left)));
 if(info.project.name==='laptop'){expect(new Set(cols.slice(0,4)).size).toBe(1);expect(new Set(cols.slice(4)).size).toBe(1);expect(cols[4]).toBeGreaterThan(cols[0]);}else{expect(new Set(cols).size).toBe(1);}
 await expectNoSidewaysScroll(page);
 await expect(page.locator('[data-reflection="s2.think1"] label')).toHaveText('Was this good service recovery? Which of the 8 service recovery steps were missing?');
 await notesCard(page,18);await expect(page.locator('#lessonCard .recap-card')).toHaveCount(0);
 await expectNoAmpersand(page);
});
test('quick check: nothing pre-selected, instant feedback, one more try, then the answer; required before Next; not scored',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{setUi('s2.cardLayout','cards15');setUi('s2.card',8);saveLocal();});await page.goto('/#level2');
 await expect(page.locator('#lessonCard h2')).toHaveText('Quick check: Which approach is this?');await expect(page.locator('#lessonCard')).toContainText('Select the most appropriate approach for each question.');
 await expect(page.locator('#lessonCard .listen-btn')).toHaveCount(0);
 await expect(page.locator('.qc-btn')).toHaveCount(9);await expect(page.locator('.qc-btn.picked')).toHaveCount(0);await expect(page.locator('.qc-btn[aria-pressed="true"]')).toHaveCount(0);
 await page.locator('#lessonNext').click();await expect(page.locator('#notFinished')).toContainText('a)');await page.keyboard.press('Escape');
 const item=id=>page.locator(`.qc-item[data-key="s2.qc.${id}"]`);
 await item('a').getByRole('button',{name:'Greeting'}).click();await expect(item('a').locator('.feedback.right')).toHaveText('✓ Correct: The staff member welcomes a regular customer by name. That is the greeting approach.');await expect(item('a').locator('.qc-btn:enabled')).toHaveCount(0);
 await item('b').getByRole('button',{name:'Greeting'}).click();await expect(item('b').locator('.feedback.wrong')).toHaveText('✗ Is this a welcome, or a question showing the staff member is ready to help?');
 await item('b').getByRole('button',{name:'Service'}).click();await expect(item('b').locator('.feedback.right')).toContainText('✓ Correct:');
 await item('c').getByRole('button',{name:'Greeting'}).click();await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ What is the customer looking at, and what does the staff member talk about?');
 await item('c').getByRole('button',{name:/^Service/}).click();await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ The answer is Product: The staff member talks about the phone the customer is looking at. That is the product approach.');
 await expect(item('c').locator('.right-tag')).toBeVisible();
 await page.reload();await expect(item('b').locator('.feedback.right')).toBeVisible();await expect(item('c').locator('.feedback.wrong')).toContainText('The answer is Product');
 await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/quick-check-${info.project.name}.png`,fullPage:true});
 await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('10 of 13');
 expect(await page.evaluate(()=>ALL_MARKED().some(it=>/qc/.test(it.attemptKey)) || Object.keys(rec.first).some(k=>/qc/.test(k)))).toBe(false);
});
test('chat completion accepts any pasted text containing gemini, with no server check',async({page,request})=>{
 await start(page,request);const calls=[];page.on('request',r=>{if(/validateConversationLink/.test(r.postData()||''))calls.push(r.url());});
 const help='Please paste the link to your Gemini chat. It should contain the word Gemini.';
 // Stored numbers 3, 4 and 6: Levels 4, 5 and 6.
 for(const n of [3,4,6]){
  await page.goto('/#level'+({3:4,4:5,6:6})[n]);const input=page.locator('#conversationLink'+n),tick=page.locator('.tick-input'),note=page.locator('#conversationError'+n);await expect(input).toHaveValue('');await expect(tick).not.toBeChecked();await expect(note).toHaveText('');
  await input.fill('https://example.com/share/fake');await expect(note).toHaveText(help);await tick.click();await expect(tick).toBeChecked();await expect(page.locator('#nextBtn')).toBeDisabled();await expect(page.locator('#conversationError'+n)).toHaveText(help);
  await page.locator('#conversationLink'+n).fill('My chat: g.co/GEMINI/share/abc');await expect(page.locator('#conversationError'+n)).toHaveText('');await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.reload();await expect(page.locator('#conversationLink'+n)).toHaveValue('My chat: g.co/GEMINI/share/abc');await expect(page.locator('.tick-input')).toBeChecked();await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.locator('.tick-input').click();await expect(page.locator('#nextBtn')).toBeDisabled();
 }
 expect(calls).toEqual([]);
});
test('Suzzie checklist, colours, saved-value compatibility and report evidence',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{setUi('s4.tab',1);});await page.goto('/#level5');await expect(page.locator('[data-roleplay-stage]')).toHaveCount(4);await expect(page.locator('[data-roleplay-stage]:checked')).toHaveCount(0);
 await page.locator('[data-answer="s4.q1"]').fill('I listened carefully to Suzzie.');await page.locator('[data-answer="s4.q2"]').fill('I would ask about the colour and size first.');await page.locator('#submitL4').click();await expect(page.locator('#notFinished')).toContainText('Choose the stages');await page.keyboard.press('Escape');await page.locator('[data-roleplay-stage="Close"]').check();await page.locator('#submitL4').click();await expect(page.locator('.recap-card')).toBeVisible();
 await page.evaluate(()=>{setUi('s4.tab',0);renderLevel(4);});await page.locator('#stylezFacts summary').click();await expect(page.locator('#stylezFacts')).toContainText('black, white, navy blue and grey');
 await page.goto('/#level4');await page.evaluate(()=>{setUi('s3.tab',1);setAnswer('s3.q2.P',3);renderLevel(3);});await expect(page.locator('#sel_P')).toHaveValue('3');await expect(page.locator('#sel_P option:checked')).toHaveText('Performing service recovery');await expect(page.locator('#sel_P option')).toHaveText(['Choose a stage…','Approaching customers','Presenting product information','Closing the customer experience positively','Performing service recovery']);
 await page.goto('/#report');await expect(page.locator('body')).toContainText('Which stages did you do?');await expect(page.locator('body')).toContainText('Close');await expectNoSidewaysScroll(page);
});
test('Level 7 permits edits before retry, guards empty text and keeps first tries',async({page,request})=>{
 await start(page,request);await page.goto('/#level7');await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.type==='tf'?!it.correct:'A'));setAnswer('s5.q5','Good service brings customers back to the business.');renderLevel(5);});await page.locator('#submitL5').click();await expect(page.locator('[data-answer="s5.q5"]')).toBeEditable();await page.locator('[data-answer="s5.q5"]').fill('');await page.locator('#checkAgainBtn').click();await expect(page.locator('#notFinished')).toBeVisible();await page.keyboard.press('Escape');await page.locator('[data-answer="s5.q5"]').fill('Good service encourages customers to return and recommend the shop.');
 const first=await page.evaluate(()=>JSON.stringify(rec.first));await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.correct));renderLevel(5);});await page.locator('#checkAgainBtn').click();expect(await page.evaluate(()=>JSON.stringify(rec.first))).toBe(first);await expect(page.locator('.all-good,.missed-card')).toBeVisible();
});
test('recovery faces change red to green, confidence faces differ, champion confetti respects reduced motion',async({page,request},info)=>{
 await start(page,request);await page.evaluate(()=>{teacher={};teacherPreviewPositions[7]={tab:3,part:1};renderTeacherLesson(7);});const fills=await page.locator('.path-face .mood-graphic>circle').evaluateAll(xs=>xs.map(x=>x.getAttribute('fill')));expect(fills).toHaveLength(8);expect(new Set(fills).size).toBe(8);expect(fills[0]).toBe('#ef4444');expect(fills[7]).toBe('#22c55e');
 await page.goto('/#level7');await page.evaluate(()=>{setUi('s5.tab',1);renderLevel(5);});const shapes=await page.locator('.face-options').first().locator('.mood-graphic').evaluateAll(xs=>xs.map(x=>x.outerHTML));expect(new Set(shapes).size).toBe(4);await expectNoSidewaysScroll(page);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`tests/screenshots/new-confidence-${info.project.name}.png`,fullPage:true});
 await page.evaluate(()=>showChampionPopup());await expect(page.locator('.confetti-burst i')).toHaveCount(48);await page.keyboard.press('Escape');await page.evaluate(()=>document.querySelector('.confetti-burst')?.remove());await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>showChampionPopup());await expect(page.locator('.confetti-burst')).toHaveCount(0);
});
test('Back to my route focuses the stage just completed',async({page,request})=>{
 await start(page,request);await page.goto('/#level4');await page.evaluate(()=>showBadgePopup(3));await page.getByRole('button',{name:'Back to my route',exact:true}).click();await expect(page).toHaveURL(/#home$/);await expect(page.locator('#levelCard3')).toBeFocused();
 for(const [route,id] of [['terms','termsDone'],['report','reportBack']]){await page.goto('/#level5');await page.goto('/#'+route);await page.locator('#'+id).click();await expect(page.locator('#levelCard4')).toBeFocused();}
});
test('read aloud highlights words, follows speech boundaries and removes highlights on stop',async({page,request})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},speak:u=>{window.lastSpeech=u;u.onstart?.();}},configurable:true});window.SpeechSynthesisUtterance=function(text){this.text=text;};});
 await start(page,request);await page.goto('/#level2');await page.locator('.listen-btn').first().click();await expect(page.locator('.speech-word')).not.toHaveCount(0);await expect(page.locator('.reading-now')).toHaveCount(1);await page.evaluate(()=>{const word=speechWords[2];window.lastSpeech.onboundary({charIndex:word.start});});await expect(page.locator('.reading-now')).toHaveCount(1);await page.locator('.listen-btn').first().click();await expect(page.locator('.speech-word')).toHaveCount(0);
});

test('every lesson card has a heading, no overflow or emoji text, and correct sticky clearance',async({page,request})=>{
 await start(page,request);await page.goto('/#level2');const total=await page.evaluate(()=>lessonCards(2).length+lessonCards(7).length);
 for(let i=0;i<total;i++){await page.evaluate(i=>{const n=i<13?2:7;setUi(`s${n}.card`,i<13?i:i-13);renderLevel(n);window.scrollTo(0,0);},i);await expectNoSidewaysScroll(page);await expectNoAmpersand(page);await expect(page.locator('#lessonCard')).toHaveCount(1);expect(await page.locator('#lessonCard').innerText()).not.toContain('Submit anyway');}
 await page.evaluate(()=>{setUi('s2.card',0);renderLevel(2);});await page.locator('#lessonNext').click();await expect.poll(()=>page.locator('#lessonCard').evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(100);
});

test('Home opens the route progress directly below the sticky header',async({page,request})=>{await start(page,request);await page.goto('/#level2');await page.locator('#homeBtn').click();await expect(page).toHaveURL(/#home$/);await expect(page.locator('#routeProgress')).toBeFocused();await expect.poll(()=>page.locator('#routeProgress').evaluate(el=>Math.abs(el.getBoundingClientRect().top-document.querySelector('.topbar').getBoundingClientRect().bottom))).toBeLessThan(25);});
test('old card positions (10-, 15-, 18- and 19-card layouts) move to the matching card of Level 2 or 3 without losing answers',async({page,request})=>{
 await start(page,request);await page.evaluate(()=>{setAnswer('s2.video','Alex welcomed June and offered to help.');saveLocal();});
 // [layout, card, level students see, progress line]
 const cases=[['compact10',4,2,'7 of 13 · Stage 1'],['cards15',9,2,"10 of 13 · Stage 2: Finding out customers' needs and wants"],['cards15',10,3,'1 of 7 · Stage 3: Closing the customer experience positively'],
  ['cards15',13,3,'6 of 7 · Real-life example'],['compact10',9,3,'7 of 7 · Handling returns'],['cards18',11,2,'12 of 13 · Stage 2: Handling questions and objections'],
  ['cards18',12,3,'1 of 7 · Stage 3: Closing the customer experience positively'],['cards18',17,3,'7 of 7 · Handling returns'],['cards19',16,3,'4 of 7 · The 8 service recovery steps'],['cards19',17,3,'6 of 7 · Real-life example']];
 for(const [layout,card,level,text] of cases){
  // Saved by the old app: the notes position only moves when the record loads.
  await page.evaluate(([layout,card])=>{setUi('s2.cardLayout',layout);setUi('s2.card',card);saveLocal();},[layout,card]);
  await page.reload();await page.goto('/#home');await page.goto('/#level'+level);
  await expect(page.locator('#lessonProgressText'),layout+' '+card).toContainText(text);
 }
 expect(await page.evaluate(()=>getAnswer('s2.video'))).toBe('Alex welcomed June and offered to help.');
 await page.reload();await page.goto('/#home');await page.goto('/#level3');await expect(page.locator('#lessonProgressText')).toContainText('6 of 7 · Real-life example');
});
test('report shows "Nothing to look at again" only once Level 4 Q2 and Level 7 Q1 and Q2 have all been tried',async({page,request})=>{
 await start(page,request);
 await page.goto('/#report');await expect(page.locator('.look-none')).toHaveText('Finish Levels 4 and 7 to see what to look at again.');
 await page.evaluate(()=>{L3_Q2.forEach(it=>rec.first[it.attemptKey]={a:it.correct,ok:true,t:nowIso()});saveLocal();renderReport();});
 await expect(page.locator('.look-none')).toHaveText('Finish Levels 4 and 7 to see what to look at again.');
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
