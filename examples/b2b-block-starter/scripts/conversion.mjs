import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const lab=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));lab.artifacts=join(lab.run,'artifacts-primary');process.env.WP_MAILPIT_URL=lab.mail;
const c=JSON.parse(await readFile(join(lab.artifacts,'connection.json'),'utf8'));
const site=JSON.parse(await readFile(join(lab.artifacts,'site.json'),'utf8'));
assert.ok(['http://127.0.0.1:9490'].includes(c.site),'This mutating test is local-only');
const headers={Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64')};
async function receipts(){let r;for(let attempt=0;attempt<3;attempt++){try{r=await fetch(c.site+'/wp-json/hongda-lab/v1/receipts',{headers,redirect:'error'});break;}catch(error){if(attempt===2)throw error;}}assert.ok(r.ok);return r.json();}
async function mailCount(){if(process.env.WP_MAILPIT_URL){const response=await fetch(process.env.WP_MAILPIT_URL+'/api/v1/messages');assert.ok(response.ok);return (await response.json()).total;}try{return (await readFile(join(lab.artifacts,'mail.jsonl'),'utf8')).trim().split('\n').filter(Boolean).length;}catch(e){if(e.code==='ENOENT')return 0;throw e;}}
const before=await receipts(),mailBefore=await mailCount();
const output='docs/acceptance/b2b-redesign';await mkdir(output,{recursive:true});
const cli=process.env.PLAYWRIGHT_CLI??join(homedir(),'.codex/skills/playwright/scripts/playwright_cli.sh');
const session='hongda-enquiry-'+Date.now();
function browser(command,...args){return execFileSync(cli,['--session',session,'--raw',command,...args],{encoding:'utf8',timeout:100000,stdio:['ignore','pipe','pipe']});}
const config={url:c.site+'/contact-us/?product_id='+site.products.yhd08,productId:String(site.products.yhd08),screenshot:output+'/enquiry.png'};
// This function is serialized into Playwright CLI's sandbox. Use browser context
// for page globals, and isolate the required/invalid/success form states.
async function exercise(page,config){
 const checks=[];
 for(const path of ['/', '/equipment/model/yhd08/']){
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:9490'+path);
  if(path!=='/')await page.locator('a[data-inquiry-product]').click();
  await page.locator('input[name=name]').fill('Local conversion acceptance');
  await page.locator('input[name=email]').fill('conversion@example.test');
  await page.locator('input[name=country]').fill('Germany');
  await page.locator('textarea[name=description]').fill('Local only: verify inline and modal equipment enquiry submission.');
  const product=await page.locator('input[name=product_id]').inputValue();
  const accepted=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('admin-ajax.php'));
  await page.getByRole('button',{name:'Send enquiry',exact:true}).click();
  const response=await accepted,result=await response.json();
  await page.getByText('Your demo enquiry has been recorded locally. No external email was sent.').waitFor();
  checks.push({path,product,status:response.status(),success:result.success,entryId:result.data?.insert_id});
  await page.screenshot({path:config.screenshot.replace('enquiry.png',path==='/'?'inline-success.png':'popup-success.png')});
 }
 return checks;
}
let result;
try{browser('open',c.site);const raw=browser('run-code',`async(page)=>(${exercise.toString()})(page,${JSON.stringify(config)})`);result=JSON.parse(raw);}
finally{browser('close');}
await writeFile(output+'/conversion-browser.json',JSON.stringify(result,null,2));
const after=await receipts(),added=after.filter(row=>!before.some(old=>old.id===row.id));
const mailAfter=await mailCount();
assert.equal(result.length,2);assert.ok(result.every(r=>r.status===200&&r.success));assert.equal(result[0].product,'');assert.equal(result[1].product,config.productId);assert.equal(added.length,2);assert.equal(mailAfter-mailBefore,2);for(const r of result){const entry=added.find(e=>e.id===Number(r.entryId));assert.ok(entry);if(r.product)assert.equal(String(entry.productId),r.product);}

const evidence={testedAt:new Date().toISOString(),checks:result,entriesAdded:added.length,notificationsAdded:mailAfter-mailBefore,mailTransport:process.env.WP_MAILPIT_URL?'smtp-to-mailpit':'wp-mail-intercept',externalDelivery:'not-tested',scope:'local-preview-only'};
await writeFile(output+'/conversion.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
