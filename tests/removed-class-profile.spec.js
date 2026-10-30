const {test,expect}=require('@playwright/test');
const {resetServer,apiPost,login,CODE}=require('./helpers');
async function setup(page,request){
 await resetServer(request,['OLD','Class 3A']);await login(page,'OLD',1);await page.getByRole('button',{name:"I'm ready",exact:true}).click();await expect(page.locator('.route')).toBeVisible();
 await apiPost(request,{action:'setClassVisibility',code:CODE(),name:'Class 3A',visible:true});await apiPost(request,{action:'removeClass',code:CODE(),name:'OLD'});
}
test('removed class clears the cached profile on reload and opens current class registration',async({page,request})=>{
 await setup(page,request);await page.reload();await expect(page.locator('#startBtn')).toBeVisible();await expect(page.locator('#classInput')).toHaveValue('Class 3A');await expect(page.locator('#nameInput')).toHaveValue('');await expect(page.locator('#regInput')).toHaveValue('');
 expect(await page.evaluate(()=>({active:localStorage.getItem('ch6_active'),record:localStorage.getItem('ch6_rec_OLD#1')}))).toEqual({active:null,record:null});
});
test('save rejected for removed class releases identity without recreating old work',async({page,request})=>{
 await setup(page,request);await page.evaluate(()=>{const key=activeKey();handleSaveReply(key,rec,{ok:false,error:'no_class'});});await expect(page.locator('#startBtn')).toBeVisible();await expect(page.locator('#classInput')).toHaveValue('Class 3A');expect(await page.evaluate(()=>student)).toBeNull();
});
