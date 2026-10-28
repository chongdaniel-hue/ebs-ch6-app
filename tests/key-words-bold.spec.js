// Version 0.10.0: key words inside Level 2 textbook lines are bold (<strong>). Only how the
// text looks changes: the words, Read aloud and Levels 3 to 5 stay as they were.
const {test,expect}=require('@playwright/test');
const {resetServer,login,watchErrors,expectNoSidewaysScroll,expectNoAmpersand,notesCard}=require('./helpers');

// Card position (0-based, in the 19-card notes: 13 to 18 are now Level 3) -> phrases that must each be a <strong> on that card, exactly.
const BOLD={
  0:["happy and satisfied","exceed their expectations","make a complaint","takes action","service breakdown or failure"],
  1:["happy and satisfied","the moment a customer enters","continues even after the customer has made a purchase","exceed their expectations"],
  2:["positive experience","return repeatedly","recommend the business","Customer loyalty","continuity of the business"],
  4:["features and benefits","meet the needs and wants of customers","increase customer satisfaction"],
  6:["making eye contact, smiling and greeting them politely","in a friendly way","use their name","polite question","as quickly as possible","looking closely at a product","actually buying it","comfortable or welcome","return to the business again"],
  9:["asking the correct questions and listening carefully","try the product immediately","new arrivals or special promotions","open-ended questions","Listen carefully","body language"],
  10:["with pride","unique features and benefits","Demonstrate","detailed answers","positive words","repeat the product's features and benefits"],
  11:["negative aspect of the product","positive functions","Agree with the customers first","point out an advantage","provide you with clues","misinformed","tactfully"],
  13:["complete a sale","Makes remarks","Looks happy","Asks for other products","Show appreciation"],
  14:["help given to customers after they have bought a product","better than their competitors","Listen","Clarify","relevant and accurate information"],
  15:["make a complaint","takes action","build customer loyalty","bad experience can be turned into a good one","lose its customers to competitors"]
};
const STEP_BOLD=[["Listen carefully","full attention"],["Be patient","Do not interrupt"],["Apologise"],["Acknowledge their feelings","assure them of help"],["Ask questions"],["Offer solutions"],["Refer customers to more senior staff"],["Thank customers"]];

async function open(page,request){
  await resetServer(request,['3E1']);await login(page,'3E1',12);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});
  await page.goto('/#level2');
}
async function card(page,c){await notesCard(page,c);}
const strongs=page=>page.locator('#lessonCard strong').allTextContents();

test('every listed key phrase is bold on its card, and never in a heading, title, speech line or question',async({page,request})=>{
  const errors=watchErrors(page);await open(page,request);
  for(const [c,phrases] of Object.entries(BOLD)){
    await card(page,Number(c));
    const found=await strongs(page);
    for(const p of phrases) expect(found,`card ${Number(c)+1}: "${p}"`).toContain(p);
    expect(await page.locator('#lessonCard').locator('h2 strong, h3 strong, .technique-title strong, .pk-title strong, .say strong, .think-card strong, button strong, summary strong').count(),`card ${Number(c)+1}`).toBe(0);
    await expectNoSidewaysScroll(page);await expectNoAmpersand(page);
  }
  // Speech lines are normal weight so the bold key words stand out; Customer: and Staff: stay bold.
  await card(page,11);
  expect(await page.locator(".technique-say").first().evaluate(el=>[getComputedStyle(el).fontWeight,getComputedStyle(el.querySelector(".say-who")).fontWeight])).toEqual(["400","700"]);
  await card(page,6);
  expect(await page.locator("#lessonCard .say").evaluateAll(els=>els.map(el=>getComputedStyle(el).fontWeight))).toEqual(Array(5).fill("400"));
  // The 8 steps on the path card and in the fold-out on the real-life example card.
  await card(page,16);
  for(let i=0;i<8;i++) expect(await page.locator(`#pathLabel${i+1} strong`).allTextContents()).toEqual(STEP_BOLD[i]);
  await card(page,17);
  const strip=await page.locator('.step-strip li').evaluateAll(li=>li.map(x=>Array.from(x.querySelectorAll('strong')).map(s=>s.textContent)));
  expect(strip).toEqual(STEP_BOLD);
  // The 4 key terms page on the home route uses the same cards.
  await page.goto('/#terms');
  expect(await page.locator('.term-list strong').allTextContents()).toEqual(expect.arrayContaining(BOLD[0]));
  expect(errors).toEqual([]);
});

test('the bold words do not change the wording, and Read aloud reads the sentences normally',async({page,request})=>{
  await page.addInitScript(()=>{
    window.__spoken=[];
    Object.defineProperty(window,"speechSynthesis",{value:{speak(u){window.__spoken.push(u.text);},cancel(){},getVoices(){return [];}},configurable:true});
    window.SpeechSynthesisUtterance=function(t){this.text=t;};
  });
  await open(page,request);
  await card(page,15);
  await expect(page.locator('#lessonCard')).toContainText("A customer's complaint provides an opportunity for a business to build customer loyalty. This is because if the complaint is handled well, the customer's bad experience can be turned into a good one.");
  await page.locator('#lessonCard .listen-btn').click();
  const spoken=(await page.evaluate(()=>window.__spoken)).join(' ').replace(/\s+/g,' ');
  expect(spoken).toContain("A customer's complaint provides an opportunity for a business to build customer loyalty.");
  expect(spoken).toContain("A business will lose its customers to competitors if it does not try to win a customer back.");
  // Real-life example: the closed fold-out (and its label) is not read.
  await card(page,17);
  await page.evaluate(()=>{window.__spoken=[];});
  await page.locator('#lessonCard .listen-btn').click();
  const spoken2=(await page.evaluate(()=>window.__spoken)).join(' ');
  expect(spoken2).toContain('A customer complained to a food delivery app');
  expect(spoken2).not.toContain('Show the 8 steps');
  expect(spoken2).not.toContain('Listen carefully to the complaint');
});

test('nothing in Levels 4, 5 and 7 (Levels 3 to 5 before 0.11.0) gained bold',async({page,request})=>{
  await open(page,request);
  // The bold words in Levels 3 to 5 before 0.10.0, by stored level number.
  const BEFORE={"3.0":[],"3.1":[],"4.0":["You are the customer service officer. Suzzie is your customer."],"4.1":["2.","3."],"5.0":[],"5.1":[]};
  const now={};
  for(const n of [3,4,5]){
    await page.goto('/#home');await page.goto(`/#level${({3:4,4:5,5:7})[n]}`);
    const tabs=await page.locator('.step-tab').count();
    for(let t=0;t<tabs;t++){await page.locator('.step-tab').nth(t).click();now[`${n}.${t}`]=await page.locator('#levelMain strong').allTextContents();}
  }
  expect(now).toEqual(BEFORE);
});
