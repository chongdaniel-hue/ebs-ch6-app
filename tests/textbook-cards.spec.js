// Version 0.9.0: Level 2 lines checked against the textbook (Chapter 6, pp. 118 to 143) and the
// syllabus (3.2.1, 3.2.2). Every line here is final student wording, copied exactly.
const {test,expect}=require('@playwright/test');
const {resetServer,login,watchErrors,expectNoSidewaysScroll,expectNoAmpersand,notesCard}=require('./helpers');

async function open(page,request){
  await resetServer(request,['3E1']);await login(page,'3E1',11);await page.locator('#briefing button').click();
  await page.evaluate(()=>{localStorage.setItem('ch6_unlock_all','true');saveLocal();});
  await page.goto('/#level2');
}
// c: the card's position in the 19-card notes of 0.10.0 (13 to 18 are now Level 3).
async function card(page,c){await notesCard(page,c);await expectNoSidewaysScroll(page);await expectNoAmpersand(page);}
const L='#lessonCard';

test('Part A: corrections to the existing Level 2 cards',async({page,request})=>{
  const errors=watchErrors(page);await open(page,request);
  // A4 Skills and qualities (p. 123): lead-in, textbook order, clear communication.
  await card(page,3);
  await expect(page.locator(`${L} h2 + p, ${L} .head-row + p`).first()).toHaveText('To deliver quality customer service, service staff need these skills and qualities:');
  await expect(page.locator(`${L} .ic-name`)).toHaveText(['Approachable','Customer-focused','Knowledgeable','Clear communication skills','Problem-solving skills','Able to close the customer experience positively']);
  await expect(page.locator(`${L} .icon-card`).nth(3).locator('.ic-desc')).toHaveText('Explaining things clearly and simply, and listening carefully');
  // A2 Product knowledge: definition at the top, first item renamed.
  await card(page,4);
  await expect(page.locator(`${L} .definition`)).toHaveText("Product knowledge refers to knowledge a service staff has of a product's features and benefits.");
  await expect(page.locator(`${L} .pk-title`).first()).toHaveText('Product features and benefits (e.g. a large screen that makes reading easier)');
  // A6 Four stages, row 1.
  await card(page,5);
  await expect(page.locator('.stage-row.stage-1 td')).toHaveText("Greet the customer and show you're happy to help.");
  // A3 After-sales support (p. 138).
  await card(page,14);
  await expect(page.locator(`${L} .definition`)).toHaveText('After-sales service refers to the help given to customers after they have bought a product.');
  await expect(page.locator(`${L} .grid-4 .icon-card`).nth(2)).toHaveText(/^\s*Hotline and online chat\s*Answer customers' enquiries and complaints in-store, by phone or through online chat\.\s*$/);
  await expect(page.locator(L)).not.toContainText('Multi-channel');
  // A5 Stage 4 (pp. 140 and 141).
  await card(page,15);
  await expect(page.locator(L)).toContainText("A customer's complaint provides an opportunity for a business to build customer loyalty. This is because if the complaint is handled well, the customer's bad experience can be turned into a good one.");
  await expect(page.locator(L)).toContainText('A business will lose its customers to competitors if it does not try to win a customer back.');
  await expect(page.locator(L)).not.toContainText('second chance');
  await expect(page.locator(L)).not.toContainText('Handled well, a service breakdown');
  // A1 Returns (p. 139).
  await card(page,18);
  await expect(page.locator(`${L} .icon-card`).first()).toHaveText(/Replacement\s*Replace it with a similar product\./);
  expect(errors).toEqual([]);
});

test('Part B1: Stage 2 in three numbered parts',async({page,request},info)=>{
  const errors=watchErrors(page);await open(page,request);
  // Part 1: needs and wants (p. 129).
  await card(page,9);
  await expect(page.locator('#lessonProgressText')).toHaveText("10 of 13 · Stage 2: Finding out customers' needs and wants");
  await expect(page.locator(`${L} .stage-label`)).toContainText('Stage 2');
  await expect(page.locator(`${L} h2`)).toHaveText('Presenting product information');
  await expect(page.locator(`${L} .stage-part`)).toHaveText("1Part 1: Finding out customers' needs and wants");
  await expect(page.locator(L)).toContainText('Once you have greeted the customer, find out what they need by asking the correct questions and listening carefully. Then it is easier to show them the correct product.');
  await expect(page.locator('.scenario-table thead th')).toHaveText(['Scenario','What the salesperson can do']);
  await expect(page.locator('.scenario-table tbody th .scenario-cell')).toHaveText(['The customers know exactly what they want.','The customers have nothing specific in mind to buy and are just browsing.','The customers only have a general idea of what they want.']);
  await expect(page.locator('.scenario-table tbody td').nth(0).locator('p')).toHaveText(['The salesperson can get the customers to try the product immediately.']);
  await expect(page.locator('.scenario-table tbody td').nth(1).locator('p')).toHaveText(['The salesperson may inform customers of new arrivals or special promotions to arouse their interest.']);
  await expect(page.locator('.scenario-table tbody td').nth(2).locator('p')).toHaveText(['Ask open-ended questions to encourage the customer to share more about their needs.','Listen carefully to what the customer says.',"Pay attention to the customer's body language by observing his or her response."]);
  await page.locator('.scenario-table').screenshot({path:`tests/screenshots/stage2-needs-${info.project.name}.png`});
  // Part 2: presenting the product (p. 130), then the suitability picture and paragraph.
  await card(page,10);
  await expect(page.locator(`${L} .stage-part`)).toHaveText('2Part 2: Presenting the product');
  await expect(page.locator(L)).toContainText('Techniques for effective product presentation:');
  await expect(page.locator(`${L} .chips .ic-body`)).toHaveText(['Hold the product carefully and with pride.','Tell customers about the unique features and benefits of the product.','Demonstrate how to use the product and, if possible, let the customers hold or use it.',"Listen to customers' queries and provide detailed answers.",'Use positive words such as "comfortable", "interesting" or "attractive" to describe the features of the product.',"If necessary, repeat the product's features and benefits several times, especially if they match the needs that the customers have expressed."]);
  await expect(page.locator(`${L} [data-img="SUITABILITY"]`)).toHaveCount(1);
  await expect(page.locator(L)).toContainText("Don't just list every good feature.");
  // Part 3: questions and objections (p. 135), with our Nexora examples.
  await card(page,11);
  await expect(page.locator(`${L} .stage-part`)).toHaveText("3Part 3: Handling customers' questions and objections");
  await expect(page.locator(L)).toContainText('When customers ask questions or raise objections, it is often a sign that they are interested in the product. Use this chance to persuade them to buy.');
  await expect(page.locator('.technique-title')).toHaveText(['1Turn a negative remark into a selling point.','2Use the "yes, but" response.','3Encourage customers to share their concerns.','4Correct misconceptions.']);
  await expect(page.locator('.technique-card > p')).toHaveText(['Point out to customers that what they see as a negative aspect of the product may also have positive functions.','Agree with the customers first and then point out an advantage that can adequately offset their concerns.','Ask customers to tell you about their concerns. As the customers elaborate, they may provide you with clues on how to address their concerns.','This method should be used when customers are misinformed. However, be sure to do this tactfully so as not to come across as rude.']);
  await expect(page.locator('.technique-say')).toHaveText(['Customer: "This phone is a bit heavy."','Staff: "It\'s heavier because it has a bigger battery, so it lasts the whole day."','Customer: "The Nexora Prime is expensive."','Staff: "Yes, it costs more, but its fast processor runs your games smoothly."','Staff: "What worries you most about switching to a new phone?"','Customer: "So the warranty covers everything, right?"','Staff: "Good question! The warranty covers manufacturing defects. Accidental damage, such as dropping the phone, isn\'t covered."']);
  expect(errors).toEqual([]);
});

test('Part B2 and B3: Stage 3 closing, then after-sales support and enquiries',async({page,request})=>{
  const errors=watchErrors(page);await open(page,request);
  await card(page,13);
  await expect(page.locator('#lessonProgressText')).toHaveText('1 of 7 · Stage 3: Closing the customer experience positively');
  await expect(page.locator(`${L} h2`)).toHaveText('Closing the customer experience positively');
  await expect(page.locator(L)).toContainText('The final goal of every salesperson is to complete a sale and close the customer experience positively.');
  await expect(page.locator(L)).toContainText('Signs that the customer had a positive experience:');
  await expect(page.locator(`${L} .chips .ic-body`)).toHaveText(['Makes remarks such as "This is exactly the item I am looking for."','Looks happy with the product and is not looking at other products.','Asks for other products that can complement the recently purchased product.']);
  await expect(page.locator('.closing-lead')).toHaveText('Show appreciation to customers when closing, even if they do not buy:');
  await expect(page.locator('.closing-when')).toHaveText(['After a sale:','If the customer does not buy:']);
  await expect(page.locator('.closing-line .say')).toHaveText(['"Thank you, I\'m sure the product will meet your needs. It has been a pleasure serving you."','"Certainly, thank you for your interest. Do come back if you decide to buy it another day."']);
  await card(page,14);
  await expect(page.locator('#lessonProgressText')).toHaveText('2 of 7 · Stage 3: After-sales support');
  await expect(page.locator('.enquiry-lead')).toHaveText("When handling customers' enquiries, salespeople should:");
  await expect(page.locator(`${L} .chips .ic-body`)).toHaveText(['Listen to the customers carefully.','Clarify with them by asking questions to get a better understanding.','Provide them with relevant and accurate information.']);
  expect(errors).toEqual([]);
});
