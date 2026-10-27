const {test,expect}=require("@playwright/test");
const {resetServer,apiPost,login,shot,expectNoSidewaysScroll,expectNoAmpersand,watchErrors}=require("./helpers");
const T="2026-10-20T02:00:00.000Z";
async function openKnowledge(page,request){
  await resetServer(request,["3E1"]);
  await apiPost(request,{action:"save",record:{v:1,cls:"3E1",reg:5,updatedAt:T,baseClearedAt:"",agreed:T,done:{1:T},submitted:{},reached:{"s2.t0":4},first:{},second:{},answers:{},ui:{}}});
  await login(page,"3E1",5);
  await expect(page.locator(".welcome-card")).toBeVisible();
  await page.goto("/#level2");
  await page.evaluate(()=>{setUi("s2.card",4);renderLevel(2);});
  await expect(page.locator(".pk-example")).toHaveCount(5);
}

// Card 5: the five aspects (textbook wording), each with its cropped picture and the
// staff member's line as real page text, so Read aloud can read it.
const LINES={
  features:["Product features and specifications (e.g. screen size, battery life)","\"The Nexora Spark has a large screen for reading and an all-day battery.\""],
  price:["Price and available options","\"The Nexora Core is $799. You can upgrade to 256GB for $80 more, or 512GB for $160 more.\""],
  care:["How to use or care for the product","\"You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition.\""],
  warranty:["Warranty and after-sales support","\"Every Nexora phone has a 1-year warranty for manufacturing defects. Keep your receipt, and bring the phone to our Nexora Care Bar if anything goes wrong.\""],
  "selling-point":["Unique selling points of the product (why your product is better than competitors' products)","\"Compared with many phones at this price, the Nexora Spark's all-day battery lasts longer, so it suits you if you use your phone often.\""]
};

test("good product knowledge shows each aspect with its picture and the staff member's line as page text",async({page,request},testInfo)=>{
  const errors=watchErrors(page);
  await openKnowledge(page,request);
  await expect(page.locator("#lessonCard")).toContainText("Staff need good product knowledge to answer questions accurately, not guess. This includes:");
  await expect(page.locator(".pk-why")).toHaveText("Customers trust staff who know their products, so they buy with confidence and come back again.");
  const before=await page.evaluate(()=>JSON.stringify(rec));
  for(const [id,[title,line]] of Object.entries(LINES)){
    const card=page.locator(`[data-product-example="${id}"]`);
    await expect(card.locator(".pk-title")).toHaveText(title);
    await expect(card.locator(".pk-say")).toHaveText("The staff member says: "+line);
    const image=card.locator("img");
    await expect(image).toHaveAttribute("src",`assets/img/product-knowledge-${id}.jpg`);
    await expect.poll(()=>image.evaluate(el=>el.complete && el.naturalWidth===900)).toBe(true);
    await expect(image).toHaveAttribute("alt",/Nexora staff member/);
    // Never stretched: drawn no wider than the file, keeping its shape.
    const box=await image.evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
    expect(box.w).toBeLessThanOrEqual(900);
    expect(Math.abs(box.w/box.h-900/570)).toBeLessThan(0.02);
  }
  // Tap to enlarge keeps the alt text and closes with Esc.
  const first=page.locator('[data-product-example="care"] .zoom-btn');
  await first.click();
  await expect(page.locator(".zoom-img")).toHaveAttribute("alt",/soft, dry cloth/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".zoom-backdrop")).toHaveCount(0);
  await expect(first).toBeFocused();
  expect(await page.evaluate(()=>JSON.stringify(rec))).toBe(before);
  await expectNoAmpersand(page);
  await expectNoSidewaysScroll(page);
  await shot(page,testInfo,"product-knowledge-cards");
  expect(errors).toEqual([]);
});

test("a failed example image shows its placeholder and the line stays readable",async({page,request})=>{
  await page.route("**/assets/img/product-knowledge-care.jpg",route=>route.fulfill({status:404,body:"Missing test image"}));
  await openKnowledge(page,request);
  const card=page.locator('[data-product-example="care"]');
  await expect(card.getByRole("img")).toHaveAttribute("aria-label",/soft, dry cloth/);
  await expect(card.locator(".pk-say")).toContainText("You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition.");
  await card.locator(".zoom-btn").click();
  await expect(page.locator(".zoom-backdrop")).toHaveCount(0);
});
