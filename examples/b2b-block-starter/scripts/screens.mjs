import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import assert from 'node:assert/strict';
const cli=process.env.PLAYWRIGHT_CLI??join(homedir(),'.codex/skills/playwright/scripts/playwright_cli.sh');
const result=JSON.parse(execFileSync(cli,['--session','b2b-starter','--raw','run-code',`async(page)=>{const results=[];for(const width of [1440,390]){await page.setViewportSize({width,height:1000});for(const [name,path] of [['home','/'],['category','/equipment/family/mini-excavator/'],['product','/equipment/model/yhd08/'],['contact','/contact-us/']]){await page.goto('http://127.0.0.1:9490'+path);await page.screenshot({path:'docs/acceptance/b2b-redesign/'+name+'-'+width+'.png',fullPage:true});const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),h1:document.querySelectorAll('main h1').length}));results.push({name,width,...metrics});}if(width===390){await page.goto('http://127.0.0.1:9490/');await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.getByRole('button',{name:'Close menu',exact:true}).waitFor();await page.getByRole('navigation').getByRole('link',{name:'All equipment',exact:true}).click();results.push({mobileNavigation:page.url().includes('/equipment/')});}}return results;}`],{encoding:'utf8',timeout:120000}));
await writeFile('docs/acceptance/b2b-redesign/screens.json',JSON.stringify(result,null,2));
assert.ok(result.every(r=>!r.overflow&&!r.brokenImages?.length&&(r.h1===undefined||r.h1===1)));assert.ok(result.some(r=>r.mobileNavigation));console.log(JSON.stringify(result));
