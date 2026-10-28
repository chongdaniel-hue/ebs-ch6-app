const {test,expect}=require('@playwright/test');
const {resetServer}=require('./helpers');
test('server rejects unnamed and mismatched reads and writes without exposing student records',async({request})=>{
  await resetServer(request,['PRIVATE']);
  const post=async body=>(await request.post('/api',{data:JSON.stringify(body),headers:{'Content-Type':'text/plain'}})).json();
  const record={cls:'PRIVATE',reg:40,profile:{name:{v:'Privacy Test Student',t:new Date().toISOString()}},answers:{'s1.q1':{v:'Private answer must never leak',t:new Date().toISOString()}},baseClearedAt:''};
  expect((await post({action:'save',name:'Privacy Test Student',record})).ok).toBe(true);
  for(const name of [undefined,'','Wrong Student']){
    const params={action:'load',class:'PRIVATE',reg:'40'};
    if(name!==undefined)params.name=name;
    const replies=[await (await request.get('/api?'+new URLSearchParams(params))).json(),await post({...params}),await post({action:'save',name,record})];
    for(const reply of replies){
      expect(reply.ok).toBe(false);
      expect(reply).not.toHaveProperty('record');
      expect(JSON.stringify(reply)).not.toContain('Privacy Test Student');
      expect(JSON.stringify(reply)).not.toContain('Private answer');
    }
  }
  const changed=structuredClone(record);changed.profile.name.v='Another Name';
  expect((await post({action:'save',name:'Privacy Test Student',record:changed})).error).toBe('name_mismatch');
  const allowed=await post({action:'load',class:'PRIVATE',reg:40,name:'  PRIVACY   TEST STUDENT  '});
  expect(allowed.record.answers['s1.q1'].v).toBe('Private answer must never leak');
});
test('minimum-length guidance and accessible quiz names',async({page,request})=>{
  const {login}=require('./helpers');
  await resetServer(request,['PRIVATE']);await login(page,'PRIVATE',1);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');setUi('s2.cardLayout','cards15');setUi('s2.card',7);saveLocal();});
  await page.goto('/#level2');await expect(page.locator('#lessonCard')).toContainText('Watch this video showing poor and good service');
  await page.locator('[data-answer="s2.video"]').fill('ok');await page.locator('#lessonNext').click();await expect(page.locator('#reflectionRequired')).toContainText('Write at least 20 characters');await page.keyboard.press('Escape');await expect(page.locator('#reflectionRequired')).toHaveCount(0);
  await page.goto('/#level7');
  const labels=await page.locator('.mcq-btn').evaluateAll(xs=>xs.map(x=>x.getAttribute('aria-label')));
  expect(labels.length).toBeGreaterThan(0);for(const label of labels){expect(label).toMatch(/^[A-D]\. /);expect(label).not.toMatch(/^([A-D])\1/);}
  await expect(page.locator('body')).toContainText('Q1.');await expect(page.locator('body')).not.toContainText('Q5.');
});

test('older backend GET compatibility preserves names and never retries identity denials',async({page,request})=>{
  await resetServer(request,['COMPAT']);await page.goto('/');
  const seen=[];
  await page.route('**/api**',async route=>{
    const req=route.request();const data=req.method()==='POST'?JSON.parse(req.postData()):Object.fromEntries(new URL(req.url()).searchParams);
    if(data.action!=='load')return route.continue();
    seen.push({method:req.method(),name:data.name});
    if(req.method()==='POST')return route.fulfill({json:{ok:false,error:data.name==='Denied Student'?'name_mismatch':'unknown_action'}});
    return route.continue();
  });
  expect((await page.evaluate(()=>loadStudentRecord('COMPAT',1,'Compatibility Student'))).ok).toBe(true);
  expect(seen).toEqual([{method:'POST',name:'Compatibility Student'},{method:'GET',name:'Compatibility Student'}]);
  seen.length=0;
  expect((await page.evaluate(()=>loadStudentRecord('COMPAT',1,'Denied Student'))).error).toBe('name_mismatch');
  expect(seen).toEqual([{method:'POST',name:'Denied Student'}]);
});
