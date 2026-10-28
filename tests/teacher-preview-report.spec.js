const {test,expect}=require("@playwright/test");
const {CODE,resetServer,apiPost,apiGet,login,shot,watchErrors,expectNoSidewaysScroll,expectNoAmpersand}=require("./helpers");
const T="2026-10-22T01:00:00.000Z";
function sample(){return {v:1,cls:"3E1",reg:5,updatedAt:T,baseClearedAt:"",agreed:T,done:{},submitted:{},reached:{},first:{"s3q2.P":{a:3,ok:true,t:T},"s5q3.i":{a:true,ok:false,t:T}},second:{"s5q3.i":{a:false,ok:true,t:T}},answers:{"s1.q1":{v:"A staff member helped me. <script> 😊",t:T},"s2.think2":{v:"Used clothing",t:T},"s3.q1a":{v:"Clear communication",t:T},"s3.q2.Q":{v:1,t:T},"s4.q2":{v:"Ask more questions",t:T},"s5.q4":{v:"B",t:T},"s5.q7":{v:"How can I improve?",t:T},"s5.q8.1":{v:2,t:T}},ui:{}};}
async function prepare(page,request){await resetServer(request,["3E1"]);await apiPost(request,{action:"save",record:sample()});await login(page,"3E1",5);await expect(page.locator(".welcome-card")).toBeVisible();}

test("teachers can view all lesson sections immediately without changing student work",async({page,request},testInfo)=>{
 const errors=watchErrors(page);await prepare(page,request);
 const before=await page.evaluate(()=>JSON.stringify(rec));
 const local=await page.evaluate(()=>localStorage.getItem("ch6_rec_3E1#5"));
 await page.goto("/#teacher");await page.fill("#teacherCode",CODE());await page.click("#teacherEnter");
 await expect(page.locator(".teacher-lesson-links a")).toHaveCount(5);
 let saves=0;page.on("request",request=>{if(request.method()==="POST" && request.postDataJSON()?.action==="save") saves++;});
 for(let n=1;n<=5;n++){
  await page.locator(`a[href="#teacher-preview-${n}"]`).click();
  await expect(page.locator("h1")).toContainText(`Level ${n}:`);
  await expect(page.locator(".teacher-preview-note")).toBeVisible();
  await expect(page.locator("#continueBtn,#nextBtn")).toHaveCount(0);
  await expect(page.locator(".teacher-lesson-part input:enabled,.teacher-lesson-part textarea:enabled,.teacher-lesson-part select:enabled")).toHaveCount(0);
  if(n===2){await expect(page.locator(".teacher-lesson-step")).toHaveCount(19);await expect(page.locator(".qc-btn:enabled")).toHaveCount(0);await expect(page.locator(".path-stop")).toHaveCount(8);await expect(page.locator('img[data-img="SUITABILITY"]')).toBeVisible();}
  if(n===5){await expect(page.locator('[data-answer="s5.q7"]')).toBeVisible();}
  await expectNoSidewaysScroll(page);await expectNoAmpersand(page);await shot(page,testInfo,"teacher-preview-level-"+n);
  expect(await page.evaluate(()=>JSON.stringify(rec))).toBe(before);
  expect(await page.evaluate(()=>localStorage.getItem("ch6_rec_3E1#5"))).toBe(local);
 }
 expect(saves).toBe(0);
 expect((await apiGet(request,{action:"load",class:"3E1",reg:5})).record.done).toEqual({});
 await page.goto("/#home");await expect(page.locator("#levelCard2")).toBeDisabled();
 expect(errors).toEqual([]);
});

test("direct lesson preview requires teacher sign-in even with a student login",async({page,request})=>{
 await prepare(page,request);await page.goto("/#teacher-preview-5");
 await expect(page.locator("#teacherCode")).toBeVisible();
 await expect(page.locator(".teacher-lesson-part")).toHaveCount(0);
});

test("learning report includes every saved answer, drafts, retries and unanswered items",async({page,request},testInfo)=>{
 const errors=watchErrors(page);await prepare(page,request);const before=await page.evaluate(()=>JSON.stringify(rec));
 await page.goto("/#report");await expect(page.locator(".report-answer-level")).toHaveCount(5);
 const answers=page.locator(".learning-answers");
 await expect(answers.locator(".qa")).toHaveCount(31);
 await expect(answers.locator(".qa-a").first()).toHaveText("A staff member helped me. <script> 😊");
 await expect(answers.locator("script")).toHaveCount(0);
 for(const text of ["Used clothing","Clear communication","Ask more questions","How can I improve?","Not answered yet","Confident"]) await expect(answers).toContainText(text);
 await expect(answers).toContainText("Presenting product information");
 await expect(answers).toContainText("Performing service recovery");
 await expect(answers).toContainText("Let me personally make sure this gets fixed today.");
 await expect(answers).toContainText("True (wrong)");await expect(answers).toContainText("False (right)");
 await expectNoSidewaysScroll(page);await expectNoAmpersand(page);await shot(page,testInfo,"learning-report-all-answers");
 expect(await page.evaluate(()=>JSON.stringify(rec))).toBe(before);expect(errors).toEqual([]);
});
