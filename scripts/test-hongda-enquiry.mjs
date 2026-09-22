import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const lab=JSON.parse(await readFile(process.env.WP_LAB_POINTER??'.lab/hongda-latest.json','utf8'));
const c=JSON.parse(await readFile(join(lab.artifacts,'connection.json'),'utf8'));
const site=JSON.parse(await readFile(join(lab.artifacts,'site.json'),'utf8'));
assert.ok(['http://127.0.0.1:9464','http://127.0.0.1:9466','http://127.0.0.1:9468'].includes(c.site),'This mutating test is local-only');
const headers={Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64')};
async function receipts(){let r;for(let attempt=0;attempt<3;attempt++){try{r=await fetch(c.site+'/wp-json/hongda-lab/v1/receipts',{headers,redirect:'error'});break;}catch(error){if(attempt===2)throw error;}}assert.ok(r.ok);return r.json();}
async function mailCount(){if(process.env.WP_MAILPIT_URL){const response=await fetch(process.env.WP_MAILPIT_URL+'/api/v1/messages');assert.ok(response.ok);return (await response.json()).total;}try{return (await readFile(join(lab.artifacts,'mail.jsonl'),'utf8')).trim().split('\n').filter(Boolean).length;}catch(e){if(e.code==='ENOENT')return 0;throw e;}}
const before=await receipts(),mailBefore=await mailCount();
const output=process.env.WP_ACCEPTANCE_DIR??'docs/acceptance/0920-hongda-iteration2';await mkdir(output,{recursive:true});
const cli=process.env.PLAYWRIGHT_CLI??join(homedir(),'.codex/skills/playwright/scripts/playwright_cli.sh');
const session='hongda-enquiry-'+Date.now();
function browser(command,...args){return execFileSync(cli,['--session',session,'--raw',command,...args],{encoding:'utf8',timeout:100000,stdio:['ignore','pipe','pipe']});}
const config={url:c.site+'/contact-us/?product_id='+site.products.yhd08,productId:String(site.products.yhd08),screenshot:output+'/enquiry.png'};
// This function is serialized into Playwright CLI's sandbox. Use browser context
// for page globals, and isolate the required/invalid/success form states.
async function exercise(page,config){
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(config.url);
 await page.getByRole('button',{name:'Send inquiry',exact:true}).click();
 await page.getByText('This field is required',{exact:true}).first().waitFor();
 const required=await page.getByText('This field is required',{exact:true}).count();
 async function fill(){
  await page.goto(config.url);
  await page.locator('input[name=name]').fill('Local repeatable acceptance');
  await page.locator('input[name=email]').fill('acceptance@example.test');
  await page.locator('input[name=country]').fill('Germany');
  await page.locator('textarea[name=description]').fill('Local acceptance only: equipment selection and delivery enquiry.');
 }
 await fill();
 const contextHidden=await page.locator('input[name=product_id]').getAttribute('type');
 const contextValue=await page.locator('input[name=product_id]').inputValue();
 await page.locator('input[name=product_id]').evaluate(el=>{el.value='999999';});
 const rejected=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('admin-ajax.php'));
 await page.getByRole('button',{name:'Send inquiry',exact:true}).click();
 const invalid=await rejected,invalidBody=await invalid.json();
 await fill();
 const accepted=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('admin-ajax.php'));
 await page.getByRole('button',{name:'Send inquiry',exact:true}).click();
 const response=await accepted,result=await response.json();
 await page.getByText('Your demo enquiry has been recorded locally. No external email was sent.').waitFor();
 await page.screenshot({path:config.screenshot});
 return {required,contextHidden,contextValue,rejectedStatus:invalid.status(),invalidProductRejected:Boolean(invalidBody.errors?.product_id),status:response.status(),success:result.success,entryId:result.data?.insert_id};
}
let result;
try{browser('open',c.site);const raw=browser('run-code',`async(page)=>(${exercise.toString()})(page,${JSON.stringify(config)})`);result=JSON.parse(raw);}
finally{browser('close');}
await writeFile(output+'/enquiry-browser-latest.json',JSON.stringify(result,null,2));
const after=await receipts(),added=after.filter(row=>!before.some(old=>old.id===row.id));
const mailAfter=await mailCount();
assert.equal(result.required,4);assert.equal(result.contextHidden,'hidden');assert.equal(result.contextValue,config.productId);assert.ok(result.invalidProductRejected);assert.equal(result.status,200);assert.equal(result.success,true);assert.equal(added.length,1);assert.equal(added[0].id,Number(result.entryId));assert.equal(String(added[0].productId),config.productId);assert.equal(mailAfter-mailBefore,1);
const evidence={testedAt:new Date().toISOString(),...result,entriesAdded:added.length,notificationsAdded:mailAfter-mailBefore,mailTransport:process.env.WP_MAILPIT_URL?'smtp-to-mailpit':'wp-mail-intercept',externalDelivery:'not-tested',scope:'local-preview-only'};
await writeFile(output+'/enquiry.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
