// Version 0.12.0: five fixes from three student simulations (storyboard section H).
// 1 share-link steps, 2 one rule for typed answers, 3 neutral self-check prompts,
// 4 Look at these again pointers, 5 Not finished yet pop-ups that list everything.
// Runs at 1366x768 (Chromebook), 810x1080 (iPad), 1280px and 360px.
const {test,expect}=require('@playwright/test');
const {resetServer,login,apiPost,watchErrors,expectNoSidewaysScroll,expectNoAmpersand}=require('./helpers');

const SHORT='Too short.'; // 10 characters
const LONG='This is a full sentence about good service.';
async function student(page,request,reg){
  await resetServer(request,['3E1']);await login(page,'3E1',reg);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});
}
// Opens a tab of a level by its stored number.
async function tab(page,num,t){await page.goto('/#home');await page.evaluate(([num,t])=>{setUi(`s${num}.tab`,t);location.hash=`#level${shown(num)}`;},[num,t]);await expect(page.locator('#levelMain')).toBeVisible();if(await page.locator('.step-tab').count())await expect(page.locator('.step-tab').nth(t)).toHaveClass(/current/);}
const missing=page=>page.locator('#notFinished .missing-list li');
async function closePopup(page){await page.locator('#notFinished button').click();await expect(page.locator('#notFinished')).toHaveCount(0);}

test('1. share-link steps: the same three numbered steps in Levels 4, 5 and 6; the link rule is unchanged',async({page,request},info)=>{
  const errors=watchErrors(page);await student(page,request,40);
  const shapes=[];
  for(const num of [3,4,6]){
    await tab(page,num,0);
    const steps=page.locator('.conversation-share .share-steps');
    await expect(steps.locator('.share-steps-title')).toHaveText('How to get your chat link:');
    await expect(steps.locator('.share-step-text')).toHaveText(['In your Gemini chat, tap Share at the top right.','Tap Create public link, then tap Copy link.','Come back to this page and paste the link in the box below.']);
    await expect(steps.locator('.share-step-num')).toHaveText(['1','2','3']);
    await expect(steps.locator('.share-step-icon svg')).toHaveCount(3);
    await expect(page.locator('.conversation-share')).not.toContainText('Use Share in Gemini');
    shapes.push(await steps.evaluate(el=>el.outerHTML.replace(/conversationHelp\d/,'')));
    // Unchanged: the tick plus a link containing "gemini" opens Next.
    const next=page.locator('#nextBtn');await expect(next).toBeDisabled();
    await page.locator(`#conversationLink${num}`).fill('https://example.com/chat');
    await expect(page.locator(`#conversationError${num}`)).toHaveText('Please paste the link to your Gemini chat. It should contain the word Gemini.');
    await page.locator('.tick-input').check();await expect(next).toBeDisabled();
    await page.locator(`#conversationLink${num}`).fill('https://gemini.google.com/share/abc123');await expect(next).toBeEnabled();
    await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  }
  expect(new Set(shapes).size).toBe(1);
  // Each step row is at least 44px tall and the circles and icons line up.
  const rows=await page.locator('.share-step').evaluateAll(els=>els.map(e=>Math.round(e.getBoundingClientRect().height)));
  rows.forEach(h=>expect(h).toBeGreaterThanOrEqual(44));
  await page.reload();await expect(page.locator('#conversationLink6')).toHaveValue('https://gemini.google.com/share/abc123');await expect(page.locator('.tick-input')).toBeChecked();
  expect(errors).toEqual([]);
});

test('2. every sentence box needs at least one full sentence; Skill or quality and the link boxes do not',async({page,request})=>{
  const errors=watchErrors(page);await student(page,request,41);
  // Level 1: all three at once, labelled Q1 to Q3.
  await page.goto('/#level1');
  await expect(page.locator('.story-card .field-label strong')).toHaveText(['Q1.','Q2.','Q3.']);
  await expect(page.locator('#part0')).toContainText('Type at least one full sentence in each box, then tap Submit.');
  await expect(page.locator('#part0')).not.toContainText('characters');
  await page.click('#submitL1');
  await expect(missing(page)).toHaveText(['✗ Q1: Write at least one full sentence','✗ Q2: Write at least one full sentence','✗ Q3: Write at least one full sentence']);
  await closePopup(page);
  for(const k of ['s1.q1','s1.q2','s1.q3']) await page.fill(`textarea[data-answer="${k}"]`,SHORT);
  await page.fill('textarea[data-answer="s1.q1"]',LONG);
  await page.click('#submitL1');await expect(missing(page)).toHaveText(['✗ Q2: Write at least one full sentence','✗ Q3: Write at least one full sentence']);await closePopup(page);
  // Reflections in Levels 2 and 3: the hint and both pop-ups.
  await page.goto('/#level2');await page.evaluate(()=>{setUi('s2.card',7);renderLevel(2);});
  await expect(page.locator('[data-answer="s2.video"]')).toHaveAttribute('placeholder','Write at least one full sentence...');
  await page.locator('#lessonNext').click();
  await expect(page.locator('#reflectionRequired')).toContainText('Complete all questions');
  await expect(page.locator('#reflectionRequired')).toContainText('Please complete all questions before moving on. Write at least one full sentence in each box.');
  await page.locator('#reflectionRequired button').click();
  await page.fill('[data-answer="s2.video"]',SHORT);await page.locator('#lessonNext').click();
  await expect(page.locator('#reflectionRequired')).toContainText('Answer too short');
  await expect(page.locator('#reflectionRequired')).toContainText('Your answer is too short. Write at least one full sentence in each box.');
  await page.locator('#reflectionRequired button').click();
  for(const [c,key] of [[5,'s2.think1'],[6,'s2.think2']]){
    await page.goto('/#level3');await page.evaluate(c=>{setUi('s7.card',c);renderLevel(7);},c);
    await page.fill(`[data-answer="${key}"]`,SHORT);await page.locator('#lessonNext').click();
    await expect(page.locator('#reflectionRequired')).toContainText('Your answer is too short. Write at least one full sentence in each box.');
    await page.locator('#reflectionRequired button').click();
  }
  // Level 4 Q1: one word is enough for Skill or quality; the reason needs a sentence.
  await tab(page,3,1);
  await page.fill('textarea[data-answer="s3.q1a"]','Patient');
  await page.fill('textarea[data-answer="s3.q1b"]',SHORT);
  await page.click('#submitL3');
  await expect(missing(page)).toHaveText(['✗ Q1: This is important to customers because','✗ Q2 P','✗ Q2 Q','✗ Q2 R','✗ Q2 S']);
  await closePopup(page);
  // Levels 5 and 6.
  for(const [num,btn] of [[4,'#submitL4'],[6,'#submitL6']]){
    await tab(page,num,1);
    const boxes=page.locator('.story-card textarea');
    await boxes.nth(0).fill(SHORT);await boxes.nth(1).fill(LONG);
    await page.locator('#levelMain input[type=checkbox]').first().check();
    await page.click(btn);await expect(missing(page)).toHaveText(['✗ Q2']);await closePopup(page);
  }
  // Level 7: Q3 at Check answer, Q4 and Q5 on the exit ticket.
  await tab(page,5,0);
  await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.correct));renderLevel(5);});
  await page.fill('textarea[data-answer="s5.q5"]',SHORT);
  await page.click('#submitL5');await expect(missing(page)).toHaveText(['✗ Q3']);await closePopup(page);
  await tab(page,5,1);
  await page.fill('textarea[data-answer="s5.q6"]',SHORT);await page.fill('textarea[data-answer="s5.q7"]',SHORT);
  await page.evaluate(()=>{[1,2,3,4].forEach(r=>setAnswer(`s5.q8.${r}`,2));renderLevel(5);});
  await page.click('#submitExit');await expect(missing(page)).toHaveText(['✗ Q4','✗ Q5']);await closePopup(page);
  // Link boxes are not held to the length rule: a short link containing "gemini" is enough.
  await tab(page,3,0);await page.locator('#conversationLink3').fill('gemini.ai/x');await page.locator('.tick-input').check();
  await expect(page.locator('#nextBtn')).toBeEnabled();
  await expectNoAmpersand(page);
  expect(errors).toEqual([]);
});

test('5. empty submits list everything missing at once, labelled as on screen',async({page,request},info)=>{
  const errors=watchErrors(page);await student(page,request,42);
  await page.goto('/#level1');await page.click('#submitL1');
  await expect(missing(page)).toHaveCount(3);await expect(page.locator('#notFinished')).not.toContainText('Box');await closePopup(page);
  await tab(page,3,1);await page.click('#submitL3');
  await expect(missing(page)).toHaveText(['✗ Q1: Skill or quality','✗ Q1: This is important to customers because','✗ Q2 P','✗ Q2 Q','✗ Q2 R','✗ Q2 S']);await closePopup(page);
  await tab(page,4,1);
  await expect(page.locator('.roleplay-stages legend')).toHaveText('Q1. Which stages did you do?');
  await expect(page.locator('.story-card .field-label strong')).toHaveText(['Q2.','Q3.']);
  await page.click('#submitL4');await expect(missing(page)).toHaveText(['✗ Q1: Choose the stages you used','✗ Q2','✗ Q3']);await closePopup(page);
  await tab(page,6,1);
  await expect(page.locator('.recovery-steps-check legend')).toHaveText('Q1. Which of the 8 steps did you use?');
  await expect(page.locator('.story-card .field-label strong')).toHaveText(['Q2.','Q3.']);
  await page.click('#submitL6');await expect(missing(page)).toHaveText(['✗ Q1: Choose the steps you used','✗ Q2','✗ Q3']);
  await expect(page.locator('#notFinished')).not.toContainText('Box');
  await expectNoSidewaysScroll(page);await closePopup(page);
  await tab(page,5,0);await page.click('#submitL5');
  await expect(missing(page)).toHaveText(['✗ Q1 i','✗ Q1 ii','✗ Q1 iii','✗ Q1 iv','✗ Q2','✗ Q3']);await closePopup(page);
  await tab(page,5,1);await page.click('#submitExit');
  await expect(missing(page)).toHaveText(['✗ Q4','✗ Q5','✗ Q6 (row 1)','✗ Q6 (row 2)','✗ Q6 (row 3)','✗ Q6 (row 4)']);await closePopup(page);
  // Nothing was pre-selected and nothing was submitted.
  expect(await page.evaluate(()=>[rec.submitted.s1,rec.submitted.s4,rec.submitted.s6,rec.submitted['s5.exit'],Object.keys(rec.first).length])).toEqual([undefined,undefined,undefined,undefined,0]);
  expect(errors).toEqual([]);
});

test('3 and 4. neutral self-check prompts beside right and wrong feedback; line R points to Level 3',async({page,request})=>{
  const errors=watchErrors(page);await student(page,request,43);
  // Level 4: line R wrong on the first try, the others right.
  await tab(page,3,1);
  await page.fill('textarea[data-answer="s3.q1a"]','Knowledgeable');
  await page.fill('textarea[data-answer="s3.q1b"]','he answered my questions about prices accurately.');
  for(const [id,v] of [['P','3'],['Q','1'],['R','0'],['S','0']]) await page.selectOption(`#sel_${id}`,v);
  await page.click('#submitL3');
  const note=page.locator('[data-q="q1"] .check-note');
  await expect(note).toHaveText("Self-check: Does it say how this skill or quality helps the customer? For example, a knowledgeable officer answers questions accurately, so the customer doesn't get wrong information.");
  await expect(note.locator('.check-icon svg use, .check-icon svg')).not.toHaveCount(0); // 🔎 drawn as the search icon
  await expect(page.locator('.feedback.right').first()).toBeVisible();await expect(page.locator('.feedback.wrong').first()).toBeVisible();
  const look=await note.evaluate(el=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,left:s.borderLeftWidth,leftColour:s.borderLeftColor,top:s.borderTopColor};});
  const wrong=await page.locator('.feedback.wrong').first().evaluate(el=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,left:s.borderLeftColor};});
  expect(look.bg).not.toBe(wrong.bg);expect(look.left).toBe('1px');expect(look.leftColour).toBe(look.top);
  expect(await note.innerText()).not.toMatch(/[✓✗]/);
  // The wrong line R stays wrong on Check again: the summary card points to Level 3.
  await page.click('#checkAgainBtn');
  await expect(page.locator('.missed-list li')).toHaveText(['Closing the customer experience positively (Level 3, Stage 3: Closing the customer experience positively)']);
  // Level 7 Q3.
  await tab(page,5,0);
  await page.evaluate(()=>{L5_MARKED.forEach(it=>setAnswer(it.answerKey,it.correct));setAnswer('s5.q3.i',true);renderLevel(5);});
  await page.fill('textarea[data-answer="s5.q5"]','customers return repeatedly to the shop.');
  await page.click('#submitL5');
  const note7=page.locator('[data-q="q5"] .check-note');
  await expect(note7).toHaveText('Self-check: Did you name one reason (customers return repeatedly, customers recommend the business to their relatives and friends, or customer loyalty ensures the continuity of the business) and explain what it means for the business?');
  expect(await note7.innerText()).not.toMatch(/[✓✗]/);
  await expect(page.locator('[data-q="q3"] .feedback.wrong').first()).toBeVisible();
  // The report: line R points to Level 3.
  await page.goto('/#report');
  await expect(page.locator('.look-list li').first()).toHaveText('Closing the customer experience positively (Level 3, Stage 3: Closing the customer experience positively)');
  await expectNoAmpersand(page);
  expect(errors).toEqual([]);
});

test('answers saved before 0.12.0 still show; submitted work is not checked again; reload restores everything',async({page,request})=>{
  const errors=watchErrors(page);await resetServer(request,['3E1']);
  const T='2026-10-28T02:00:00.000Z',a=v=>({v,t:T});
  // A 0.11.9 student who submitted Levels 5 and 6 with short answers and is part-way through Level 7.
  await apiPost(request,{action:'save',app:'0.11.9',record:{v:1,cls:'3E1',reg:44,updatedAt:T,baseClearedAt:'',agreed:T,profile:{name:{v:'Test Student 44',t:T}},
    done:{1:T,2:T,7:T,3:T,4:T,6:T},submitted:{s4:T,s6:T},reached:{levels7:1,'s5.tabs':1},first:{},second:{},
    answers:{'s1.q1':a('Short one'),'s4.q1':a('Greeted her'),'s4.q2':a('Ask more'),'s4.stages':a(['Approach']),'s6.q1':a('Calmer'),'s6.q2':a('Listen'),'s6.steps':a(['Listen']),'s5.q6':a('8 steps')},ui:{}}});
  await login(page,'3E1',44);
  await expect(page.locator('.journey-count')).toHaveText('6 of 7 levels done');
  // Level 5 and 6 stay submitted: read-only, recap shown, no Submit.
  for(const num of [4,6]){await tab(page,num,1);await expect(page.locator('.recap-card')).toBeVisible();await expect(page.locator('.story-card textarea').first()).toHaveAttribute('readonly','');}
  // The exit ticket keeps the saved short answer and accepts more typing.
  await tab(page,5,1);await expect(page.locator('textarea[data-answer="s5.q6"]')).toHaveValue('8 steps');
  await page.fill('textarea[data-answer="s5.q6"]','Service recovery has 8 steps.');
  await page.reload();await expect(page.locator('textarea[data-answer="s5.q6"]')).toHaveValue('Service recovery has 8 steps.');
  // The report shows every saved answer under the new labels.
  await page.goto('/#report');
  const l5=page.locator('.report-answer-level').nth(4),l6=page.locator('.report-answer-level').nth(5),l1=page.locator('.report-answer-level').nth(0);
  await expect(l1.locator('.qa-q').first()).toHaveText(/^Q1\. Think of a time/);await expect(l1).toContainText('Short one');
  await expect(l5.locator('.qa-q')).toContainText(['Q1. Which stages did you do?','Q2. What is one thing you feel you did well when serving Suzzie?','Q3. What is one thing you would do differently next time?']);
  await expect(l5).toContainText('Greeted her');await expect(l5).toContainText('Ask more');
  await expect(l6.locator('.qa-q')).toContainText(['Q1. Which of the 8 steps did you use?','Q2. How did Suzzie feel at the end of the chat? What did you do that helped?','Q3. What is one thing you would do differently next time?']);
  await expect(l6).toContainText('Calmer');
  await expect(page.locator('main')).not.toContainText('Box ');
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  expect(errors).toEqual([]);
});
