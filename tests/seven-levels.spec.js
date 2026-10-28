// Version 0.11.0: seven levels. The notes are Level 2 (13 cards) and Level 3 (7 cards), and
// Win Suzzie Back is Level 6. Stored level numbers never change meaning (Learn Part 2 is
// stored as 7, Win Suzzie Back as 6), and older records are migrated when they load.
const {test,expect}=require('@playwright/test');
const fs=require('fs'),os=require('os'),path=require('path');
const {resetServer,login,apiPost,apiGet,CODE,watchErrors,expectNoSidewaysScroll,expectNoAmpersand}=require('./helpers');

const T='2026-10-20T02:00:00.000Z';
// A record as the 0.10.0 app saved it: no "levels7" marker, notes positions in the 19-card layout.
function oldRecord(reg,extra){
  return Object.assign({v:1,cls:'3E1',reg,updatedAt:T,baseClearedAt:'',agreed:T,profile:{name:{v:`Test Student ${reg}`,t:T}},
    done:{},submitted:{},reached:{},first:{},second:{},answers:{},ui:{},unlockedLevels:{}},extra);
}
const ui=(card,layout)=>({'s2.card':{v:card,t:T},'s2.cardLayout':{v:layout||'cards19',t:T}});
async function putOld(request,record){await request.post('/__test/oldRecord',{data:JSON.stringify({cls:'3E1',reg:record.reg,record})});}
// Each level's status in the order students see: done, progress, new or locked.
const statuses=async page=>{await expect(page.locator('.journey-count, #lessonProgressText, .page-title').first()).toBeVisible();return page.evaluate(()=>LEVELS.map(l=>levelStatus(l.num)));};
function sheetRow(reg){
  const book=JSON.parse(fs.readFileSync(path.join(os.tmpdir(),'ebs-ch6-playwright-data','sheets.json'),'utf8'));
  return book.Students.find(r=>r[0]===`3E1#${reg}`);
}

test.describe('migration of saved work from 0.10.0',()=>{
  test('finished the old notes: Levels 2 and 3 both finished, with the same date',async({page,request})=>{
    const errors=watchErrors(page);
    await resetServer(request,['3E1']);
    await putOld(request,oldRecord(5,{done:{1:T,2:T},ui:ui(18)}));
    await login(page,'3E1',5);
    await expect(page.locator('.journey-count')).toHaveText('3 of 7 levels done');
    expect(await statuses(page)).toEqual(['done','done','done','new','locked','locked','locked']);
    expect(await page.evaluate(()=>[rec.done[7],rec.done[2]])).toEqual([T,T]);
    await expect(page.locator('.shelf-badge.earned .shelf-name')).toHaveText([/Story Sharer/,/Service Scholar/,/Service Saver/]);
    // The server copy is migrated on the next save, and the Sheet counts three levels.
    await page.goto('/#level4');await page.goto('/#home');
    await expect.poll(async()=>(await apiGet(request,{action:'load',class:'3E1',reg:5})).record.done[7]).toBe(T);
    await expect.poll(()=>sheetRow(5)[3]).toBe('3');
    await page.reload();
    expect(await statuses(page)).toEqual(['done','done','done','progress','locked','locked','locked']);
    expect(errors).toEqual([]);
  });

  test('part-way through the notes before card 14: stays in Level 2 on the same card',async({page,request})=>{
    await resetServer(request,['3E1']);
    await putOld(request,oldRecord(6,{done:{1:T},ui:ui(5)}));
    await login(page,'3E1',6);
    expect(await statuses(page)).toEqual(['done','progress','locked','locked','locked','locked','locked']);
    await page.goto('/#level2');
    await expect(page.locator('#lessonProgressText')).toHaveText('6 of 13 · The four stages');
  });

  test('part-way through the notes on card 14 or later: Level 2 finished, Level 3 on the matching card',async({page,request})=>{
    await resetServer(request,['3E1']);
    // 19-card layout, card 17 (The 8 service recovery steps).
    await putOld(request,oldRecord(7,{done:{1:T},ui:ui(16)}));
    // 18-card layout, card 16 (The 8 service recovery steps).
    await putOld(request,oldRecord(8,{done:{1:T},ui:ui(15,'cards18')}));
    // 19-card layout, card 19 (Handling returns): Level 3 card 7, after the video card.
    await putOld(request,oldRecord(19,{done:{1:T},ui:ui(18)}));
    // 15-card layout, card 11 (Stage 3: Closing the customer experience positively).
    await putOld(request,oldRecord(9,{done:{1:T},ui:ui(10,'cards15')}));
    for(const [reg,expected] of [[19,'7 of 7 · Handling returns'],[7,'4 of 7 · The 8 service recovery steps'],[8,'4 of 7 · The 8 service recovery steps'],[9,'1 of 7 · Stage 3: Closing the customer experience positively']]){
      await page.context().clearCookies();await page.goto('/');await page.evaluate(()=>localStorage.clear());
      await login(page,'3E1',reg);
      expect(await statuses(page)).toEqual(['done','done','progress','locked','locked','locked','locked']);
      await expect(page.locator('.shelf-badge.earned .shelf-name')).toHaveText([/Story Sharer/,/Service Scholar/]);
      await page.goto('/#level3');
      await expect(page.locator('#lessonProgressText')).toHaveText(expected);
      await page.goto('/#level2');
      await expect(page.locator('#lessonProgressText')).toHaveText('13 of 13 · Stage 2: Quick check');
    }
  });

  test('old Levels 3, 4 and 5 become Levels 4, 5 and 7; Level 6 opens after Serve Suzzie; a started Check stays open',async({page,request})=>{
    await resetServer(request,['3E1']);
    await putOld(request,oldRecord(10,{done:{1:T,2:T,3:T,4:T},ui:ui(18)}));
    await putOld(request,oldRecord(11,{done:{1:T,2:T,3:T,4:T},ui:ui(18),answers:{'s5.q5':{v:'customers come back again',t:T}}}));
    await putOld(request,oldRecord(12,{done:{1:T,2:T,3:T,4:T,5:T},ui:ui(18)}));
    await login(page,'3E1',10);
    expect(await statuses(page)).toEqual(['done','done','done','done','done','new','locked']);
    await page.evaluate(()=>localStorage.clear());await login(page,'3E1',11);
    expect(await statuses(page)).toEqual(['done','done','done','done','done','new','progress']);
    await page.goto('/#level7');await expect(page.locator('h1')).toContainText('Level 7: Check and Exit Ticket');
    await page.evaluate(()=>localStorage.clear());await login(page,'3E1',12);
    expect(await statuses(page)).toEqual(['done','done','done','done','done','new','done']);
  });

  test('unlock grants: old ones keep their meaning (an old notes grant opens Level 3 too), new ones do not spread',async({page,request})=>{
    await resetServer(request,['3E1']);
    await putOld(request,oldRecord(13,{unlockedLevels:{2:T,3:T}}));
    await login(page,'3E1',13);
    expect(await statuses(page)).toEqual(['new','new','new','new','locked','locked','locked']);
    // A new grant of Level 2 alone (stored 2) on a migrated record opens only Level 2.
    await putOld(request,oldRecord(14,{reached:{levels7:1}}));
    const r=await apiPost(request,{action:'unlockStudent',code:CODE(),class:'3E1',reg:14,levels:[2]});
    expect(Object.keys(r.record.unlockedLevels)).toEqual(['2']);
    // Grants for Levels 3 and 6 (stored 7 and 6) are accepted; 8 is not.
    expect((await apiPost(request,{action:'unlockStudent',code:CODE(),class:'3E1',reg:14,levels:[7,6]})).ok).toBe(true);
    expect((await apiPost(request,{action:'unlockStudent',code:CODE(),class:'3E1',reg:14,levels:[8]})).error).toBe('bad_levels');
    // An old grant to the notes is remapped on the server before new grants are added.
    await putOld(request,oldRecord(15,{unlockedLevels:{2:T}}));
    const r2=await apiPost(request,{action:'unlockStudent',code:CODE(),class:'3E1',reg:15,levels:[3]});
    expect(Object.keys(r2.record.unlockedLevels).sort()).toEqual(['2','3','7']);
  });

  test('a device copy from 0.10.0 is migrated too, and the migration runs only once',async({page,request})=>{
    await resetServer(request,['3E1']);
    await login(page,'3E1',16);await page.locator('#briefing button').click();
    // An old copy on this device (no marker) that had finished the old notes.
    await page.evaluate(T=>{const r=JSON.parse(localStorage.getItem('ch6_rec_3E1#16'));delete r.reached.levels7;r.done={1:T,2:T};r.ui['s2.card']={v:18,t:T};r.ui['s2.cardLayout']={v:'cards19',t:T};localStorage.setItem('ch6_rec_3E1#16',JSON.stringify(r));},T);
    await page.reload();
    expect(await statuses(page)).toEqual(['done','done','done','new','locked','locked','locked']);
    // A student who finishes only Part 1 now never gets Part 2 for free.
    await page.evaluate(()=>localStorage.clear());
    await resetServer(request,['3E1']);await login(page,'3E1',17);await page.locator('#briefing button').click();
    await page.evaluate(T=>{rec.done[1]=T;rec.done[2]=T;saveLocal();},T);
    await page.reload();
    expect(await page.evaluate(()=>[!!rec.done[2],!!rec.done[7]])).toEqual([true,false]);
  });
});

// Saves from the 0.10.0 app after the server update: it sends no "app", and its record may
// already carry the levels7 marker it loaded from the new server.
test.describe('the 0.10.0 app saving after the server update',()=>{
  const now=()=>new Date().toISOString();
  async function serverMarked(request,reg,extra){
    // The first save the new server sees adds the marker (as Dan reproduced with students 31 and 33).
    await apiPost(request,{action:'save',record:oldRecord(reg,extra)});
    const r=(await apiGet(request,{action:'load',class:'3E1',reg})).record;
    expect(r.reached.levels7).toBe(1);
    return r;
  }
  test('finishing the old Level 2 on the 0.10.0 page still finishes Level 3',async({page,request})=>{
    await resetServer(request,['3E1']);
    for(const reg of [31,33]){
      const r=await serverMarked(request,reg,{done:{1:T},ui:ui(5)});
      // The 0.10.0 page finishes all 19 cards: done[2] arrives after the marker.
      r.done[2]=now();r.ui['s2.card']={v:18,t:now()};
      expect((await apiPost(request,{action:'save',record:r})).record.done[7]).toBe(r.done[2]);
    }
    await login(page,'3E1',31);
    expect(await statuses(page)).toEqual(['done','done','done','new','locked','locked','locked']);
    await expect(page.locator('.shelf-badge.earned .shelf-name')).toHaveText([/Story Sharer/,/Service Scholar/,/Service Saver/]);
  });
  test('starting the old Check on the 0.10.0 page keeps it open in 0.11.0',async({page,request})=>{
    await resetServer(request,['3E1']);
    const r=await serverMarked(request,34,{done:{1:T,2:T,3:T,4:T},ui:ui(18)});
    expect(r.reached['open.5']).toBeUndefined();
    r.answers['s5.q3.i']={v:false,t:now()};
    expect((await apiPost(request,{action:'save',record:r})).record.reached['open.5']).toBe(1);
    await login(page,'3E1',34);
    expect(await statuses(page)).toEqual(['done','done','done','done','done','new','progress']);
    await page.goto('/#level7');await expect(page.locator('h1')).toContainText('Level 7: Check and Exit Ticket');
  });
  test('a student who finished only the new Part 1 never gets Part 2, even from an old page',async({request})=>{
    await resetServer(request,['3E1']);
    const r=await serverMarked(request,35,{done:{1:T}});
    // 0.11.0 saves Level 2 (Part 1) finished.
    r.done[2]=now();
    let saved=(await apiPost(request,{action:'save',record:r,app:'0.11.0'})).record;
    expect(saved.done[7]).toBeUndefined();
    // A stale 0.10.0 page that loaded this record saves it again: nothing new, nothing added.
    saved.answers['s1.q1']={v:'Typed on the old page.',t:now()};
    saved=(await apiPost(request,{action:'save',record:saved})).record;
    expect(saved.done[7]).toBeUndefined();
    expect(saved.reached['open.5']).toBeUndefined();
    // The 0.11.0 app never gets the old-app treatment, even for new Check work.
    const c=await serverMarked(request,36,{done:{1:T,2:T,7:T,3:T,4:T}});
    c.answers['s5.q5']={v:'customers come back',t:now()};
    expect((await apiPost(request,{action:'save',record:c,app:'0.11.0'})).record.reached['open.5']).toBeUndefined();
  });
  test('the app sends its version with every save',async({page,request})=>{
    await resetServer(request,['3E1']);await login(page,'3E1',37);await page.locator('#briefing button').click();
    const body=page.waitForRequest(r=>r.url().endsWith('/api')&&r.method()==='POST'&&r.postDataJSON().action==='save');
    await page.evaluate(()=>setAnswer('s1.q1','A story about good service.','now'));
    expect((await body).postDataJSON().app).toBe('0.11.0');
  });
});

async function freshStudent(page,request,reg){
  await resetServer(request,['3E1']);await login(page,'3E1',reg);await page.locator('#briefing button').click();
}

test('Level 2 ends on Stage 2: Quick check with Finish Level 2, then Level 3 opens',async({page,request})=>{
  const errors=watchErrors(page);await freshStudent(page,request,20);
  await page.evaluate(T=>{rec.done[1]=T;['a','b','c'].forEach((id,i)=>setAnswer(`s2.qc.${id}.1`,["Greeting","Service","Product"][i]));setAnswer('s2.video','Alex smiled and greeted June warmly.');saveLocal();},T);
  await page.goto('/#level2');await page.evaluate(()=>{setUi('s2.card',12);renderLevel(2);});
  await expect(page.locator('h1')).toHaveText('Level 2: Learn: Customer Service (Part 1)');
  await expect(page.locator('#lessonProgressText')).toHaveText('13 of 13 · Stage 2: Quick check');
  await expect(page.locator('#lessonNext')).toHaveText('Finish Level 2');
  await page.evaluate(()=>{QUICK_CHECK2.forEach(it=>setAnswer(`s2.qc2.${it.id}.1`,it.correct));renderLevel(2);});
  await page.locator('#lessonNext').click();
  await expect(page.locator('#badgeModal')).toContainText('You earned the Service Scholar badge!');
  await page.locator('#badgeModal').getByRole('button',{name:'Back to my route'}).click();
  expect(await statuses(page)).toEqual(['done','done','new','locked','locked','locked','locked']);
  await expectNoAmpersand(page);expect(errors).toEqual([]);
});

test('Level 3: 7 cards, all 8 steps at once, the video on its own card, reflections hold back Next, placeholder badge',async({page,request},info)=>{
  const errors=watchErrors(page);await freshStudent(page,request,21);
  await page.evaluate(T=>{rec.done[1]=T;rec.done[2]=T;saveLocal();},T);
  await page.goto('/#level3');
  await expect(page.locator('h1')).toHaveText('Level 3: Learn: Customer Service (Part 2)');
  const labels=[];
  for(let i=0;i<7;i++){
    await expect(page.locator('#lessonProgressText')).toContainText(`${i+1} of 7 · `);
    labels.push((await page.locator('#lessonProgressText').innerText()).split(' · ')[1]);
    await expect(page.locator('#lessonCard .listen-btn').or(page.locator('#lessonCard .video-frame')).first()).toBeVisible();
    await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
    if(i===3){
      await expect(page.locator('.path-stop')).toHaveCount(8);
      await expect(page.locator('#showStepBtn')).toHaveCount(0);
      await expect(page.locator('#lessonCard')).not.toContainText('Tap Show Step');
      await expect(page.locator('#lessonCard .video-frame')).toHaveCount(0);
      await expect(page.locator('.path-face')).toHaveCount(8);
      await expect(page.locator('#lessonNext')).toBeEnabled();
    }
    if(i===4){
      await expect(page.locator('#lessonCard .stage-label')).toContainText('Stage 4');
      await expect(page.locator('#lessonCard .video-title')).toHaveText('Watch: The 8 steps in action');
      await expect(page.locator('#lessonCard .video-prompt')).toHaveText('Watch Alex use all 8 steps to help June with her cracked phone.');
      await expect(page.locator('#lessonCard .video-frame iframe')).toHaveAttribute('src',/IWZ4xwI2fF8/);
      await expect(page.locator('#lessonCard .video-link a')).toHaveText('Video not loading? Watch it on YouTube');
      await expect(page.locator('#lessonCard .path-stop')).toHaveCount(0);
    }
    if(i===5||i===6){
      await page.locator('#lessonNext').click();
      await expect(page.locator('#reflectionRequired')).toBeVisible();
      await page.locator('#reflectionRequired button').click();
      await page.locator('#lessonCard textarea').fill('The staff did not apologise or offer a real solution.');
    }
    if(i<6){await page.locator('#lessonNext').click();}
  }
  expect(labels).toEqual(['Stage 3: Closing the customer experience positively','Stage 3: After-sales support','Stage 4: Service breakdown and service recovery','The 8 service recovery steps','Watch: The 8 steps in action','Real-life example: Poor service recovery','Handling returns']);
  await expect(page.locator('#lessonNext')).toHaveText('Finish Level 3');
  await page.locator('#lessonNext').click();
  const modal=page.locator('#badgeModal');
  await expect(modal).toContainText('You earned the Service Saver badge!');
  await expect(modal.locator('.img-placeholder')).toBeVisible();
  await expect(modal.locator('.img-placeholder-label')).toHaveText('Service Saver');
  await modal.screenshot({path:`tests/screenshots/level3-badge-${info.project.name}.png`});
  await modal.getByRole('button',{name:'Back to my route'}).click();
  // The keys are unchanged: s2.think1 and s2.think2.
  expect(await page.evaluate(()=>[!!getAnswer('s2.think1'),!!getAnswer('s2.think2'),!!rec.done[7]])).toEqual([true,true,true]);
  await expect(page.locator('.shelf-badge').nth(2).locator('.img-placeholder')).toBeVisible();
  await page.reload();
  expect(await statuses(page)).toEqual(['done','done','done','new','locked','locked','locked']);
  expect(errors).toEqual([]);
});

test('the new comics sit under their text, are not clipped or stretched, and open larger',async({page,request})=>{
  const errors=watchErrors(page);await freshStudent(page,request,22);
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');});
  const where=[[2,1,'C05',/the moment a customer enters/],[2,11,'C06',null],[3,0,'C07',null]];
  for(const [lv,card,id,before] of where){
    const num=lv===2?2:7;
    await page.goto(`/#level${lv}`);await page.evaluate(([n,c])=>{setUi(`s${n}.card`,c);renderLevel(n);},[num,card]);
    const btn=page.locator(`#lessonCard .zoom-btn[data-zoom="${id}"]`);const img=btn.locator('img');
    await expect(img).toBeVisible();
    await img.evaluate(el=>el.complete||new Promise(r=>el.onload=r));
    const m=await img.evaluate(el=>{const r=el.getBoundingClientRect(),card=document.getElementById('lessonCard').getBoundingClientRect();return {nw:el.naturalWidth,nh:el.naturalHeight,w:r.width,h:r.height,left:r.left,right:r.right,cl:card.left,cr:card.right};});
    expect(m.nw).toBe(1600);
    expect(m.w).toBeLessThanOrEqual(m.nw);
    expect(Math.abs(m.w/m.h-m.nw/m.nh)).toBeLessThan(0.02);
    expect(m.left).toBeGreaterThanOrEqual(m.cl);expect(m.right).toBeLessThanOrEqual(m.cr+0.5);
    expect(await img.getAttribute('alt')).toBe(await page.evaluate(id=>CONFIG.IMAGES[id].alt,id));
    // Directly under the text it explains.
    const prev=await btn.evaluate(el=>{const p=el.previousElementSibling;return p?p.className+'|'+p.textContent.slice(0,80):'';});
    if(id==='C05')expect(prev).toMatch(before);
    if(id==='C06')expect(prev).toMatch(/technique-cards/);
    if(id==='C07')expect(prev).toMatch(/closing-lines/);
    await btn.click();
    await expect(page.locator('.zoom-backdrop img')).toBeVisible();
    await page.keyboard.press('Escape');await expect(page.locator('.zoom-backdrop')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('Level 6: lock on tick plus Gemini link, the 8-step checklist, Finish and the Service Superstar badge',async({page,request},info)=>{
  const errors=watchErrors(page);await freshStudent(page,request,23);
  await page.evaluate(T=>{[1,2,7,3,4].forEach(n=>{rec.done[n]=T;});saveLocal();render();},T);
  expect(await statuses(page)).toEqual(['done','done','done','done','done','new','locked']);
  await page.goto('/#level6');
  await expect(page.locator('h1')).toHaveText(/Level 6: Win Suzzie Back/);
  await expect(page.locator('.level-sub')).toHaveText('Suzzie is upset. Use the 8 steps to turn her bad experience into a good one.');
  const main=page.locator('#levelMain');
  await expect(main.locator('.intro-with-pic p')).toHaveText('This time, Suzzie is upset about a problem with something she bought at Stylez. You are the customer service officer. Use the 8 service recovery steps to win her back. During your chat, try to:');
  await expect(main.locator('.win-back-tips .ic-body')).toHaveText(['Listen, be patient and apologise for the inconvenience caused','Acknowledge her feelings and ask questions to find out what happened','Offer a solution, and thank her for bringing the problem to your attention']);
  await expect(main.locator('.gem-btn')).toContainText('Open chat with Suzzie (new tab)');
  await expect(main.locator('.gem-btn')).toHaveAttribute('href','https://gemini.google.com/share/d/195NZFPCmJGy2oOoT9Kg-rpIayst2Zjdb?usp=sharing');
  await expect(main.locator('details')).toHaveCount(2);
  for(const d of await main.locator('details').all()) expect(await d.evaluate(x=>x.open)).toBe(false);
  await expect(main.locator('details summary')).toHaveText(['Show the 8 steps',/Stylez store facts/]);
  const next=page.locator('#nextBtn');
  await expect(next).toBeDisabled();await expect(page.locator('#nextNote')).toHaveText("Tick the box above when you've finished.");
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  await page.screenshot({path:`tests/screenshots/level6-tab1-locked-${info.project.name}.png`,fullPage:true});
  await page.locator('input.tick-input[data-answer="s6.tick"]').check();
  await expect(page.locator('#conversationError6')).toHaveText('Please paste the link to your Gemini chat. It should contain the word Gemini.');
  await expect(page.locator('#nextBtn')).toBeDisabled();
  await page.locator('#conversationLink6').fill('https://example.com/chat');await expect(page.locator('#nextBtn')).toBeDisabled();
  await page.locator('#conversationLink6').fill('https://GEMINI.google.com/share/abc123');
  await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.screenshot({path:`tests/screenshots/level6-tab1-unlocked-${info.project.name}.png`,fullPage:true});
  await page.locator('#nextBtn').click();
  // Tab 2: nothing ticked at first; each step has its icon; no stage colours.
  await expect(main.locator('legend')).toHaveText('1. Which of the 8 steps did you use?');
  await expect(main.locator('.step-chip')).toHaveText(['Listen','Be patient','Apologise','Acknowledge','Ask questions','Offer solutions','Refer','Thank'].map(t=>new RegExp(`^\\s*${t}\\s*$`)));
  await expect(main.locator('.step-chip input:checked')).toHaveCount(0);
  await expect(main.locator('.step-chip .ui-graphic, .step-chip svg, .step-chip img')).toHaveCount(8);
  expect(new Set(await main.locator('.step-chip').evaluateAll(els=>els.map(e=>getComputedStyle(e).borderLeftColor))).size).toBe(1);
  await expect(main.locator('.answer-field textarea')).toHaveCount(2);
  await expect(main.locator('.answer-field textarea').first()).toHaveAttribute('placeholder','At the end, Suzzie felt... because I...');
  await expect(main.locator('.answer-field textarea').nth(1)).toHaveAttribute('placeholder','Next time, I would...');
  await page.screenshot({path:`tests/screenshots/level6-tab2-${info.project.name}.png`,fullPage:true});
  await page.locator('#submitL6').click();
  await expect(page.locator('#notFinished')).toContainText('Q1: Choose the steps you used');
  await page.keyboard.press('Escape');
  await main.locator('.step-chip',{hasText:'Apologise'}).locator('input').check();
  await main.locator('.step-chip',{hasText:'Offer solutions'}).locator('input').check();
  await main.locator('.answer-field textarea').first().fill('At the end, Suzzie felt better because I apologised.');
  await main.locator('.answer-field textarea').nth(1).fill('Next time, I would ask more questions first.');
  await page.locator('#submitL6').click();
  await expect(main.locator('.recap-card')).toContainText("If a complaint is handled well, the customer's bad experience can be turned into a good one.");
  await page.reload();
  await expect(main.locator('.step-chip input:checked')).toHaveCount(2);
  await page.locator('#finishBtn').click();
  await expect(page.locator('#badgeModal')).toContainText('You earned the Service Superstar badge!');
  await expect(page.locator('#badgeModal img')).toHaveAttribute('src',/badge-service-superstar\.png/);
  await page.locator('#badgeModal').getByRole('button',{name:'Back to my route'}).click();
  expect(await statuses(page)).toEqual(['done','done','done','done','done','done','new']);
  expect(await page.evaluate(()=>[getAnswer('s6.steps'),getAnswer('s6.tick'),!!rec.submitted.s6,!!rec.done[6]])).toEqual([['Apologise','Offer solutions'],true,true,true]);
  expect(errors).toEqual([]);
});

test('home route and badge shelf of seven, report and Teacher Mode for seven levels',async({page,request},info)=>{
  const errors=watchErrors(page);await freshStudent(page,request,24);
  await page.evaluate(T=>{[1,2,7].forEach(n=>{rec.done[n]=T;});saveLocal();queueSave('now');render();},T);
  await expect(page.locator('.journey-count')).toHaveText('3 of 7 levels done');
  await expect(page.locator('.level-card .level-name')).toHaveText([/Your Customer Service Stories/,/Learn: Customer Service \(Part 1\)/,/Learn: Customer Service \(Part 2\)/,/Chat with Alex/,/Serve Suzzie at Stylez/,/Win Suzzie Back/,/Check and Exit Ticket/]);
  await expect(page.locator('.level-card .num-badge')).toHaveText(['✓','✓','✓','4','','','']);
  expect(await page.locator('.level-card').evaluateAll(x=>x.map(b=>b.className.match(/status-([a-z]+)/)[1]))).toEqual(['done','done','done','new','locked','locked','locked']);
  await expect(page.locator('.shelf-badge .shelf-name')).toHaveText([/Story Sharer/,/Service Scholar/,/Service Saver/,/Service Spotter/,/Service Star/,/Service Superstar/,/Completion Champion/]);
  await expect(page.locator('.shelf-badge').nth(2).locator('.img-placeholder')).toBeVisible();
  await expect(page.locator('.welcome-text')).toContainText("You've finished 3 of 7 levels. Great progress! Carry on with Level 4 below.");
  await page.locator('#levelCard6').dispatchEvent('click');
  await expect(page.locator('#lockedMsg6')).toHaveText('Finish Level 5 first to open this level.');
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  await page.screenshot({path:`tests/screenshots/home-seven-${info.project.name}.png`,fullPage:true});
  // Learning report (with Level 6 answers, as if a teacher had unlocked it)
  await page.evaluate(()=>{setAnswer('s6.link','https://gemini.google.com/share/x1');setAnswer('s6.steps',['Listen','Thank']);setAnswer('s6.q1','Suzzie felt calmer at the end of the chat.');saveLocal();queueSave('now');});
  await expect.poll(async()=>(await apiGet(request,{action:'load',class:'3E1',reg:24})).record.answers['s6.steps']?.v).toEqual(['Listen','Thank']);
  await page.goto('/#report');
  await expect(page.locator('.report-level-name')).toHaveText(['Level 1: Your Customer Service Stories','Level 2: Learn: Customer Service (Part 1)','Level 3: Learn: Customer Service (Part 2)','Level 4: Chat with Alex','Level 5: Serve Suzzie at Stylez','Level 6: Win Suzzie Back','Level 7: Check and Exit Ticket']);
  await expect(page.locator('.report-scores .ic-body')).toHaveText(['Level 4, Q2: First try – / 4.','Level 7, Q1 and Q2: First try – / 5.']);
  await expect(page.locator('.look-none')).toHaveText('Finish Levels 4 and 7 to see what to look at again.');
  await expect(page.locator('.report-answer-level h3')).toHaveText(['Level 1: Your Customer Service Stories','Level 2: Learn: Customer Service (Part 1)','Level 3: Learn: Customer Service (Part 2)','Level 4: Chat with Alex','Level 5: Serve Suzzie at Stylez','Level 6: Win Suzzie Back','Level 7: Check and Exit Ticket']);
  const l3=page.locator('.report-answer-level').nth(2),l6=page.locator('.report-answer-level').nth(5);
  await expect(l3).toContainText('Was this good service recovery?');await expect(l3).toContainText('Name ONE item Uniqlo');
  await expect(l6).toContainText('https://gemini.google.com/share/x1');await expect(l6).toContainText('Listen, Thank');await expect(l6).toContainText('Suzzie felt calmer');await expect(l6).toContainText('What is one thing you would do differently next time?');
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  // Teacher Mode
  await page.goto('/#teacher');
  if(await page.locator('#teacherCode').count()){await page.fill('#teacherCode',CODE());await page.click('#teacherEnter');}
  await expect(page.locator('.teacher-lesson-links a')).toHaveText(['Level 1','Level 2','Level 3','Level 4','Level 5','Level 6','Level 7']);
  await page.locator('.teacher-lesson-links a',{hasText:'Level 3'}).click();
  await expect(page.locator('h1')).toHaveText('Level 3: Learn: Customer Service (Part 2)');
  await expect(page.locator('.teacher-step-title')).toHaveCount(7);
  await page.goto('/#teacher-preview-6');await expect(page.locator('h1')).toHaveText('Level 6: Win Suzzie Back');
  await expect(page.locator('.teacher-step-title')).toHaveText(['Roleplay','Reflect']);
  await page.goto('/#teacher');await page.locator('.tabs .tab',{hasText:'Results'}).click();
  await page.locator('#resultsClass').selectOption('3E1');
  await expect(page.locator('.results-summary .sum-list').first().locator('li')).toHaveText(['Level 1: 1 of 1','Level 2: 1 of 1','Level 3: 1 of 1','Level 4: 0 of 1','Level 5: 0 of 1','Level 6: 0 of 1','Level 7: 0 of 1']);
  await expect(page.locator('.students-table tbody td').nth(1)).toHaveText('3');
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#downloadCsv')]);
  const csv=fs.readFileSync(await download.path(),'utf8');const head=csv.split('\r\n')[0];
  for(let n=1;n<=7;n++) expect(head).toContain(`Level ${n} finished`);
  expect(head).toContain('Level 6 Suzzie (upset) conversation link');expect(head).toContain('Level 6 steps used');expect(head).toContain('Level 6 reflection 2');
  expect(csv.split('\r\n')[1]).toContain('Listen; Thank');
  await page.locator('.student-row').first().click();
  await expect(page.locator('.student-report')).toContainText('Levels done: 3 of 7');
  await expect(page.locator('.student-report .sum-head')).toHaveText(['Level 1: stories','Level 2: Think about it','Level 3: Think about it','Level 4: Q1','Level 4: Q2','Level 5: reflections','Level 6: steps used and reflections','Level 7: Q1 and Q2','Exit ticket']);
  await expect(page.locator('.student-report')).toContainText('Suzzie felt calmer');
  // Footer Unlock: seven tick boxes in the order students see, carrying the stored numbers.
  await page.goto('/#home');await page.locator('[data-unlock-progress]').click();
  const modal=page.locator('#studentUnlockModal');
  await expect(modal).toContainText('open selected levels or all seven levels.');
  await expect(modal.locator('.unlock-level-option')).toHaveText(['Level 1: Your Customer Service Stories','Level 2: Learn: Customer Service (Part 1)','Level 3: Learn: Customer Service (Part 2)','Level 4: Chat with Alex','Level 5: Serve Suzzie at Stylez','Level 6: Win Suzzie Back','Level 7: Check and Exit Ticket']);
  expect(await modal.locator('.unlock-level-option input').evaluateAll(x=>x.map(i=>i.value))).toEqual(['1','2','7','3','4','6','5']);
  expect(errors).toEqual([]);
});

test('student text for seven levels: Before you start, Serve Suzzie, the Check hint, Look at these again',async({page,request})=>{
  await freshStudent(page,request,25);
  await page.goto('/#home');await page.locator('text=How this works').click();
  await expect(page.locator('#briefing')).toContainText("Levels 4, 5 and 6 open an AI chatbot in a new tab.");
  await page.keyboard.press('Escape');
  await expect(page.locator('.welcome-text')).toContainText('In 7 short levels');
  await page.evaluate(()=>localStorage.setItem('ch6_unlock_all','true'));
  await page.goto('/#level5');
  await expect(page.locator('.stages-box')).toHaveText(' Try to use the four stages from Levels 2 and 3: approach Suzzie, present product information, close positively (including after-sales support), and if there\'s a problem, perform service recovery.');
  expect(await page.evaluate(()=>L5_Q3.find(i=>i.id==='iv').hint)).toBe('Look at the definition of service breakdown in Level 3. When does a service breakdown occur?');
  expect(await page.evaluate(()=>LOOK_AGAIN)).toEqual({
    "s3q2.P":"Performing service recovery (Level 3, Stage 4: Service breakdown and service recovery)",
    "s3q2.Q":"Presenting product information (Level 2, The four stages)",
    "s3q2.R":"Closing the customer experience positively (Level 2, The four stages)",
    "s3q2.S":"Approaching customers (Level 2, The four stages)",
    "s5q3.i":"What customer service is (Level 2, What is customer service?)",
    "s5q3.ii":"Good product knowledge (Level 2, Good product knowledge)",
    "s5q3.iii":"The 8 steps of service recovery (Level 3, The 8 service recovery steps)",
    "s5q3.iv":"Service breakdown (Level 3, Stage 4: Service breakdown and service recovery)",
    "s5q4":"The 8 steps of service recovery (Level 3, The 8 service recovery steps)"});
});
