import {execFileSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import assert from 'node:assert/strict';
const cli=join(homedir(),'.codex/skills/playwright/scripts/playwright_cli.sh'),out='docs/acceptance/b2b-redesign';
await mkdir(out,{recursive:true});
const call=code=>JSON.parse(execFileSync(cli,['--session','b2b-design','--raw','run-code',code],{encoding:'utf8',timeout:180000,maxBuffer:2e6}));
execFileSync(cli,['--session','b2b-design','--raw','open','http://127.0.0.1:9490/'],{stdio:'pipe',timeout:90000});
const result=call(`async(page)=>{
 const base='http://127.0.0.1:9490',out='${out}',results=[];
 await page.goto(base+'/');
 const links=await page.locator('nav a').evaluateAll(els=>els.map(el=>({name:el.textContent.trim(),url:el.href})));
 const applications=await page.locator('.application-links a').first().getAttribute('href');
 const about=links.find(l=>l.name==='About').url,guides=links.find(l=>l.name==='Buying guides').url;
 await page.goto(guides);const article=await page.locator('.wp-block-post-title a').first().getAttribute('href');
 const routes=[['home','/'],['catalogue','/equipment/'],['category','/equipment/family/mini-excavator/'],['product','/equipment/model/yhd08/'],['product-standard','/equipment/model/yhd12/'],['applications','/industry/'],['application',applications],['about',about],['guides',guides],['article',article],['contact','/contact-us/']];
 for(const width of [1440,390,768]){
  await page.setViewportSize({width,height:1000});
  for(const [name,url]of routes){await page.goto(url.startsWith('http')?url:base+url);await page.evaluate(()=>document.fonts.ready);if(width!==768)await page.screenshot({path:out+'/'+name+'-'+width+'.png',fullPage:true});results.push({name,width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('main h1').length,forms:document.querySelectorAll('form.frm-fluent-form').length}))});}
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('button',{name:'Close menu',exact:true}).waitFor();await page.waitForFunction(()=>getComputedStyle(document.querySelector('.is-menu-open')).opacity==='1');await page.screenshot({path:out+'/mobile-navigation.png'});await page.getByRole('navigation').getByRole('link',{name:'All equipment',exact:true}).click();await page.waitForURL('**/equipment/');const mobileNavigation=true;
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');const trigger=page.locator('.header-quote a');await page.locator('input[name=name]').fill('Preserved input');await trigger.click();const dialog=page.getByRole('dialog',{name:'Request a quote',exact:true});await dialog.waitFor();const samePage=page.url()===base+'/';const focused=await page.locator('input[name=name]').evaluate(el=>document.activeElement===el);await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});const focusReturned=await trigger.evaluate(el=>document.activeElement===el);const preserved=await page.locator('.quote-form input[name=name]').inputValue();
 await page.goto(base+'/equipment/model/yhd08/');await page.locator('a[data-inquiry-product]').click();await dialog.waitFor();const context=await page.locator('input[name=product_id]').inputValue();await page.screenshot({path:out+'/product-enquiry.png'});await page.getByRole('button',{name:'Close enquiry form'}).click();await trigger.click();const resetContext=await page.locator('input[name=product_id]').inputValue();await page.getByRole('button',{name:'Close enquiry form'}).click();
 return {testedAt:new Date().toISOString(),links,results,mobileNavigation,samePage,focused,focusReturned,preserved,context,resetContext};}`);
await writeFile(out+'/design-check.json',JSON.stringify(result,null,2));
assert.ok(result.results.every(r=>!r.overflow&&!r.brokenImages.length&&r.h1===1&&r.forms===1),'route visual structure');
assert.ok(result.mobileNavigation&&result.samePage&&result.focused&&result.focusReturned);assert.equal(result.preserved,'Preserved input');assert.ok(Number(result.context)>0);assert.equal(result.resetContext,'');
console.log('33 responsive page checks; mobile navigation, popup context, focus and draft preservation passed.');
