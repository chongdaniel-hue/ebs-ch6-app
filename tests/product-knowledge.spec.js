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

// Card 5: the five aspects (textbook wording), each with its comic. The staff member's line is
// in the comic's speech bubble and its alt text; no separate line shows under the picture.
const LINES={
  features:["Product features and benefits (e.g. a large screen that makes reading easier)","The Nexora Spark has a large screen for reading and an all-day battery."],
  price:["Price and available options","The Nexora Core is $799. You can upgrade to 256GB for $80 more, or 512GB for $160 more."],
  care:["How to use or care for the product","You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition."],
  warranty:["Warranty and after-sales support","Every Nexora phone has a 1-year warranty for manufacturing defects. Keep your receipt, and bring the phone to our Nexora Care Bar if anything goes wrong."],
  "selling-point":["Unique selling points of the product (why your product is better than competitors' products)","Compared with many phones at this price, the Nexora Spark's all-day battery lasts longer, so it suits you if you use your phone often."]
};

test("good product knowledge shows each aspect with its comic, the line in the bubble and the alt text",async({page,request},testInfo)=>{
  const errors=watchErrors(page);
  await openKnowledge(page,request);
  await expect(page.locator("#lessonCard .definition")).toHaveText("Product knowledge refers to knowledge a service staff has of a product's features and benefits.");
  await expect(page.locator("#lessonCard")).toContainText("Staff need good product knowledge to answer questions accurately, not guess. This includes:");
  await expect(page.locator(".pk-why")).toHaveText("Customers trust staff who know their products, so they buy with confidence and come back again.");
  await expect(page.locator("#lessonCard")).not.toContainText("The staff member says");
  const before=await page.evaluate(()=>JSON.stringify(rec));
  for(const [id,[title,line]] of Object.entries(LINES)){
    const card=page.locator(`[data-product-example="${id}"]`);
    await expect(card.locator(".pk-title")).toHaveText(title);
    // The hidden copy is for Read aloud only: not seen, and not read twice by screen readers.
    expect(await card.locator(".pk-say").evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
    await expect(card.locator(".pk-say")).toHaveAttribute("aria-hidden","true");
    const image=card.locator("img");
    await expect(image).toHaveAttribute("src",`assets/img/product-knowledge-${id}-v2.jpg`);
    await expect.poll(()=>image.evaluate(el=>el.complete && el.naturalWidth===900 && el.naturalHeight===900)).toBe(true);
    await expect(image).toHaveAttribute("alt",`Comic: A Nexora staff member talks to a customer in the shop. He says, "${line}"`);
    // Never stretched or cropped: square, and no wider than the file.
    const box=await image.evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
    expect(box.w).toBeLessThanOrEqual(900);
    expect(Math.abs(box.w/box.h-1)).toBeLessThan(0.02);
  }
  // Comics side by side are the same size.
  const widths=await page.locator(".pk-img").evaluateAll(imgs=>imgs.map(i=>Math.round(i.getBoundingClientRect().width)));
  expect(new Set(widths.slice(0,4)).size).toBe(1);
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

test("Read aloud on the product-knowledge card reads each heading followed by its line",async({page,request})=>{
  await page.addInitScript(()=>{
    window.__spoken=[];
    const synth={speaking:false,pending:false,paused:false,speak(u){window.__spoken.push(u.text);},cancel(){},pause(){},resume(){},getVoices(){return [];},addEventListener(){},removeEventListener(){}};
    Object.defineProperty(window,"speechSynthesis",{value:synth,configurable:true});
    window.SpeechSynthesisUtterance=function(t){this.text=t;};
  });
  await openKnowledge(page,request);
  await page.locator("#lessonCard .listen-btn").click();
  // Compared without spaces: Read aloud splits "e.g." into short sentences.
  const squash=t=>t.replace(/\s+/g,"");
  const spoken=squash((await page.evaluate(()=>window.__spoken)).join(" "));
  let at=0;
  for(const [title,line] of Object.values(LINES)){
    const t=spoken.indexOf(squash(title),at);expect(t,title).toBeGreaterThanOrEqual(0);
    const l=spoken.indexOf(squash(line),t);expect(l,line).toBeGreaterThan(t);
    at=l;
  }
});

test("a failed comic shows its placeholder and the line becomes visible text",async({page,request})=>{
  await page.route("**/assets/img/product-knowledge-care-v2.jpg",route=>route.fulfill({status:404,body:"Missing test image"}));
  await openKnowledge(page,request);
  const card=page.locator('[data-product-example="care"]');
  await expect(card.getByRole("img")).toHaveAttribute("aria-label",/soft, dry cloth/);
  await expect(card.locator(".pk-say")).toBeVisible();
  await expect(card.locator(".pk-say")).toHaveText("\"You may use a protective case and wipe the screen with a soft, dry cloth to maintain its condition.\"");
  await card.locator(".zoom-btn").click();
  await expect(page.locator(".zoom-backdrop")).toHaveCount(0);
});
