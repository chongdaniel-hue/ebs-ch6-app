// Version 0.10.0: a second quick check after Stage 2, part 3 (which objection technique is this?).
// Same look and behaviour as the first; saved as s2.qc2.<id>.1 and .2; not scored or reported.
const {test,expect}=require('@playwright/test');
const {resetServer,login,watchErrors,expectNoSidewaysScroll,expectNoAmpersand}=require('./helpers');
const OPTIONS=["Negative into selling point","Yes, but","Share concerns","Correct misconception"];

test('quick check 2: nothing pre-selected, hint, one more try, the answer, required before Next, not scored',async({page,request},info)=>{
  const errors=watchErrors(page);
  await resetServer(request,['3E1']);await login(page,'3E1',14);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');setAnswer('s2.qc.a.1','Greeting');saveLocal();});
  await page.goto('/#level2');await page.evaluate(()=>{setUi('s2.card',12);renderLevel(2);});
  await expect(page.locator('#lessonProgressText')).toHaveText('13 of 19 · Stage 2: Quick check');
  await expect(page.locator('#lessonCard h2')).toHaveText('Quick check: Which technique is this?');
  await expect(page.locator('#lessonCard')).toContainText('Tap one for each.');
  await expect(page.locator('#lessonCard .listen-btn')).toHaveCount(0);
  const item=id=>page.locator(`.qc-item[data-key="s2.qc2.${id}"]`);
  // The lines, as in the Part 3 examples.
  await expect(item('a').locator('.say')).toHaveText(['Customer: "The Nexora Spark\'s camera is quite basic."','Staff: "You\'re right, the camera is simple. However, the Spark\'s battery lasts longer than many phones at this price."']);
  await expect(item('b').locator('.say')).toHaveText(['Customer: "I can only trade in an old Nexora phone, right?"','Staff: "Good question! You can trade in an old phone of any brand, and we\'ll give you store credit off your new Nexora phone."']);
  await expect(item('c').locator('.say')).toHaveText(['Customer: "The Nexora Core\'s box looks so plain."','Staff: "It\'s plain because it\'s made mostly of recycled cardboard, which is better for the environment."']);
  await expect(item('d').locator('.say')).toHaveText(['Customer: "Hmm, I\'m not sure about buying a new phone today."','Staff: "That\'s okay! What\'s making you unsure? Tell me more and I\'ll see how I can help."']);
  // Four options in technique order, nothing pre-selected, 44px tall; 2 by 2 on phones.
  for(const id of ['a','b','c','d']) await expect(item(id).locator('.qc-btn')).toHaveText(OPTIONS);
  await expect(page.locator('.qc-btn.picked, .qc-btn[aria-pressed="true"]')).toHaveCount(0);
  const boxes=await item('a').locator('.qc-btn').evaluateAll(b=>b.map(x=>{const r=x.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),h:r.height,w:Math.round(r.width)};}));
  boxes.forEach(b=>expect(b.h).toBeGreaterThanOrEqual(44));
  if(info.project.name==='phone'){
    expect(boxes[0].y).toBe(boxes[1].y);expect(boxes[2].y).toBe(boxes[3].y);expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
    expect(boxes[0].x).toBe(boxes[2].x);expect(boxes[1].x).toBe(boxes[3].x);expect(boxes[0].w).toBe(boxes[1].w);
  }else{
    expect(new Set(boxes.map(b=>b.y)).size).toBe(1);
  }
  // Next is held until every item is finished.
  await page.locator('#lessonNext').click();await expect(page.locator('#notFinished')).toContainText('a)');await page.keyboard.press('Escape');
  // a) right first time.
  await item('a').getByRole('button',{name:'Yes, but',exact:true}).click();
  await expect(item('a').locator('.feedback.right')).toHaveText('✓ Correct: The staff member agrees that the camera is simple, then points out a different advantage: the long battery life. That is the "yes, but" response.');
  await expect(item('a').locator('.qc-btn:enabled')).toHaveCount(0);
  // b) wrong: the hint, the wrong pick greyed, one more try; right on the second try.
  await item('b').getByRole('button',{name:'Share concerns',exact:true}).click();
  await expect(item('b').locator('.feedback.wrong')).toHaveText("✗ Was the customer's information right? What does the staff member do about it?");
  await expect(item('b').locator('.qc-btn:disabled')).toHaveCount(1);
  await page.locator('.qc-list').screenshot({path:`tests/screenshots/quick-check-2-hint-${info.project.name}.png`});
  await item('b').getByRole('button',{name:'Correct misconception',exact:true}).click();
  await expect(item('b').locator('.feedback.right')).toHaveText('✓ Correct: The customer thought only Nexora phones could be traded in. The staff member politely gives the correct information. That is correcting a misconception tactfully.');
  // c) wrong twice: the right answer with its reason.
  await item('c').getByRole('button',{name:'Yes, but',exact:true}).click();
  await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ Does the staff member talk about a different feature, or show that the plain box itself is a good thing?');
  await item('c').getByRole('button',{name:'Share concerns',exact:true}).click();
  await expect(item('c').locator('.feedback.wrong')).toHaveText('✗ The answer is Negative into selling point: The customer sees the plain box as a negative. The staff member shows it is plain because it is made of recycled cardboard, which is a positive. That is turning a negative remark into a selling point.');
  await expect(item('c').locator('.right-tag')).toBeVisible();
  await page.locator('#lessonNext').click();await expect(page.locator('#notFinished')).toContainText('d)');await page.keyboard.press('Escape');
  await item('d').getByRole('button',{name:'Correct misconception',exact:true}).click();
  await expect(item('d').locator('.feedback.wrong')).toHaveText('✗ Does the staff member give the customer information, or ask the customer to say more?');
  await item('d').getByRole('button',{name:'Share concerns',exact:true}).click();
  await expect(item('d').locator('.feedback.right')).toHaveText('✓ Correct: The staff member asks the customer to say more about what is worrying them. That is encouraging customers to share their concerns.');
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  // Saved under its own keys; the first quick check is untouched; reload keeps everything.
  expect(await page.evaluate(()=>[getAnswer('s2.qc2.b.1'),getAnswer('s2.qc2.b.2'),getAnswer('s2.qc.a.1'),getAnswer('s2.qc.b.1')])).toEqual(['Share concerns','Correct misconception','Greeting',undefined]);
  await page.reload();
  await expect(item('c').locator('.feedback.wrong')).toContainText('The answer is Negative into selling point');
  await expect(item('a').locator('.feedback.right')).toBeVisible();
  // Not scored and not in the learning report.
  expect(await page.evaluate(()=>ALL_MARKED().some(it=>/qc/.test(it.attemptKey)) || Object.keys(rec.first).some(k=>/qc/.test(k)))).toBe(false);
  await page.locator('#lessonNext').click();await expect(page.locator('#lessonProgressText')).toContainText('14 of 19 · Stage 3: Closing the customer experience positively');
  await page.goto('/#report');await expect(page.locator('main')).not.toContainText('Which technique');await expect(page.locator('main')).not.toContainText('Negative into selling point');
  expect(errors).toEqual([]);
});
