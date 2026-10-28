// Tap to enlarge: every zoomable picture in Level 2 opens visibly larger than it is drawn
// inline, never wider than its own file, at laptop and phone widths.
const {test,expect}=require('@playwright/test');
const {resetServer,login,watchErrors,expectNoSidewaysScroll}=require('./helpers');

test('every Level 2 picture opens larger than inline, sharp and no wider than its file',async({page,request},info)=>{
  const errors=watchErrors(page);
  await resetServer(request,['3E1']);await login(page,'3E1',9);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});
  await page.goto('/#level2');
  const seen=[];
  for(let c=0;c<18;c++){
    await page.evaluate(c=>{setUi('s2.card',c);renderLevel(2);},c);
    const buttons=page.locator('#lessonCard .zoom-btn');
    const count=await buttons.count();
    for(let i=0;i<count;i++){
      const btn=buttons.nth(i);
      const img=btn.locator('img');
      await btn.scrollIntoViewIfNeeded();
      await expect.poll(()=>img.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
      const inline=await img.evaluate(el=>({id:el.dataset.img,w:el.getBoundingClientRect().width,nw:el.naturalWidth}));
      await btn.click();
      const big=page.locator('.zoom-img');
      await expect.poll(()=>big.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
      const w=await big.evaluate(el=>el.getBoundingClientRect().width);
      // Visibly larger: at least 15% wider than inline (a wide strip is already drawn about
      // 1050px wide on a 1280px laptop), never drawn wider than the file, and on wider screens
      // as large as the screen allows.
      expect(w,`${inline.id} on card ${c+1}`).toBeGreaterThan(inline.w*1.15);
      expect(w,`${inline.id} not upscaled`).toBeLessThanOrEqual(inline.nw+1);
      if(info.project.name==='laptop'){
        const fit=await big.evaluate(el=>Math.floor(Math.min(el.naturalWidth,(innerWidth-24),(innerHeight-80)*el.naturalWidth/el.naturalHeight)));
        expect(w,`${inline.id} fills the screen`).toBeGreaterThanOrEqual(fit-2);
      }
      if(info.project.name==='phone' && i===0 && c===2) await page.screenshot({path:`tests/screenshots/zoom-C01-${info.project.name}.png`});
      if(info.project.name==='laptop' && inline.id==='C03') await page.screenshot({path:`tests/screenshots/zoom-C03-${info.project.name}.png`});
      seen.push(inline.id);
      await page.keyboard.press('Escape');
      await expect(page.locator('.zoom-backdrop')).toHaveCount(0);
      await expectNoSidewaysScroll(page);
    }
  }
  // All the Level 2 comics and screenshots were checked.
  expect(seen).toEqual(expect.arrayContaining(['C01','PK_FEATURES','PK_PRICE','PK_CARE','PK_WARRANTY','PK_SELLING_POINT','C02','C03','SUITABILITY','C04','R01','R02','N03','R03']));
  expect(errors).toEqual([]);
});
