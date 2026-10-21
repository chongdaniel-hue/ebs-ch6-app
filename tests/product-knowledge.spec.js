const {test,expect}=require("@playwright/test");
const {resetServer,apiPost,login,shot,expectNoSidewaysScroll,expectNoAmpersand,watchErrors}=require("./helpers");
const T="2026-10-20T02:00:00.000Z";
async function openKnowledge(page,request){
  await resetServer(request,["3E1"]);
  await apiPost(request,{action:"save",record:{v:1,cls:"3E1",reg:5,updatedAt:T,baseClearedAt:"",agreed:T,done:{1:T},submitted:{},reached:{"s2.t0":4},first:{},second:{},answers:{},ui:{}}});
  await login(page,"3E1",5);
  await expect(page.locator(".welcome-card")).toBeVisible();
  await page.goto("/#level2");
  await expect(page.locator(".product-knowledge-card")).toHaveCount(5);
}

test("each product card opens its matching generated picture, closes accessibly and preserves progress",async({page,request},testInfo)=>{
  const errors=watchErrors(page);
  await openKnowledge(page,request);
  const before=await page.evaluate(()=>JSON.stringify(rec));
  await shot(page,testInfo,"product-knowledge-cards");
  const ids=["features","price","care","warranty","selling-point"];
  for(const id of ids){
    const card=page.locator(`[data-product-example="${id}"]`);
    const title=await card.locator(".ic-body").evaluate(el=>el.childNodes[0].textContent);
    if(id==="care"){await card.focus();await card.press("Enter");} else await card.click();
    const dialog=page.locator("#productExampleModal");
    await expect(dialog.getByRole("dialog")).toBeVisible();
    await expect(dialog.locator("h2")).toHaveText(title);
    const image=dialog.locator("img");
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute("src",`assets/img/product-knowledge-${id}.png`);
    await expect.poll(()=>image.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
    await expect(image).toHaveAttribute("alt",/Nexora staff member/);
    await expect(dialog.locator(".say")).not.toBeEmpty();
    await expect(dialog.getByRole("button",{name:"Close",exact:true})).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button",{name:"Close",exact:true})).toBeFocused();
    await expectNoAmpersand(page);
    await expectNoSidewaysScroll(page);
    const overflow=await dialog.locator(".modal").evaluate(el=>el.scrollWidth-el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await shot(page,testInfo,"product-example-"+id);
    if(id==="care") await page.keyboard.press("Escape");
    else await dialog.getByRole("button",{name:"Close",exact:true}).click();
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
    expect(await page.evaluate(()=>JSON.stringify(rec))).toBe(before);
  }
  expect(errors).toEqual([]);
});

test("a failed example image keeps its accessible description and dialogue",async({page,request})=>{
  await openKnowledge(page,request);
  await page.route("**/assets/img/product-knowledge-care.png",route=>route.fulfill({status:404,body:"Missing test image"}));
  await page.locator('[data-product-example="care"]').click();
  const dialog=page.locator("#productExampleModal");
  await expect(dialog.getByRole("img")).toHaveAttribute("aria-label",/soft dry cloth/);
  await expect(dialog.locator(".say")).toHaveText("Use a protective case and wipe the screen with a soft, dry cloth.");
  await dialog.getByRole("button",{name:"Close",exact:true}).click();
  await expect(dialog).toHaveCount(0);
});
