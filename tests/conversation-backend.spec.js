const {test,expect}=require('@playwright/test');
const {createAppsScript}=require('../server/apps-script-mock');
const fs=require('fs'),os=require('os'),path=require('path');
// The app no longer calls validateConversationLink (any text containing "gemini" is accepted);
// this checks the action that is still in Code.gs.
test('server allowlist, identity checks, HTTP failures and cache do not expose records or follow redirects',()=>{
 const fetched=[];const script=createAppsScript({dataDir:fs.mkdtempSync(path.join(os.tmpdir(),'ebs-links-')),teacherCode:'Mock Teacher',urlFetch:(url,opts)=>{fetched.push({url,opts});if(url.endsWith('Missing1234'))return {status:404};if(url.endsWith('Redirect123'))return {status:302};if(url.endsWith('Unavailable'))return {status:503};if(url.endsWith('Deleted1234'))return {status:200,text:'Gemini: this chat no longer exists'};return {status:200,text:'<title>Gemini shared conversation</title>'};}});
 const post=b=>JSON.parse(script.doPost(JSON.stringify(b)));
 post({action:'addClass',name:'CHECK',code:'Mock Teacher'});post({action:'save',name:'Example Student',record:{cls:'CHECK',reg:1,baseClearedAt:'',profile:{name:{v:'Example Student',t:new Date().toISOString()}}}});
 const check=(url,name='Example Student')=>post({action:'validateConversationLink',class:'CHECK',reg:1,name,url});
 for(const bad of ['','junk','http://gemini.google.com/share/abc123','https://evil.test/share/abc123','https://gemini.google.com.evil.test/share/abc123','https://gemini.google.com/app/abc123','https://gemini.google.com/share/abc%2F123','https://gemini.google.com@evil.test/share/abc123'])expect(check(bad).error).toBe('invalid_link');
 expect(fetched).toHaveLength(0);expect(check('https://gemini.google.com/share/AbCd1234','Wrong Student').error).toBe('name_mismatch');expect(fetched).toHaveLength(0);
 const success=check('https://gemini.google.com/share/AbCd1234?usp=sharing');expect(success.ok).toBe(true);expect(success).not.toHaveProperty('record');expect(fetched[0].url).toBe('https://gemini.google.com/share/AbCd1234');expect(fetched[0].opts.followRedirects).toBe(false);
 expect(check('https://g.co/gemini/share/AbCd1234').ok).toBe(true);expect(fetched).toHaveLength(1);
 expect(check('https://gemini.google.com/share/Missing1234').error).toBe('invalid_link');expect(check('https://gemini.google.com/share/Deleted1234').error).toBe('invalid_link');
 expect(check('https://gemini.google.com/share/Redirect123').error).toBe('link_check_unavailable');expect(check('https://gemini.google.com/share/Unavailable').error).toBe('link_check_unavailable');
});
