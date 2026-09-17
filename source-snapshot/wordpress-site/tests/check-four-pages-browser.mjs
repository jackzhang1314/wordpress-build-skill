// Run after logging an isolated agent-browser session into the fixture site.
import {readFile,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
const [directory,session]=process.argv.slice(2);if(!directory||!session)throw new Error('Provide fixture directory and authenticated isolated browser session.');
const out=resolve(directory),report=JSON.parse(await readFile(resolve(out,'four-pages-result.json'),'utf8'));
const run=async(...args)=>{const {stdout}=await promisify(execFile)('agent-browser',['--session',session,'--json',...args],{maxBuffer:1024*1024});const result=JSON.parse(stdout);if(!result.success)throw new Error(JSON.stringify(result));return result.data;};
const checks=[];
for(const [key,page]of Object.entries(report.pages)){
 await run('open',page.edit);
 await run('wait','--fn','!!window.wp?.data?.select("core/block-editor")?.getBlocks().length');
 const editor=(await run('eval','({status:wp.data.select("core/editor").getCurrentPostAttribute("status"),blocks:wp.data.select("core/block-editor").getBlocks().flatMap(function walk(b){return [{name:b.name,isValid:b.isValid},...b.innerBlocks.flatMap(walk)]})})')).result;
 if(editor.status!=='draft'||!editor.blocks.length||editor.blocks.some(b=>!b.isValid))throw new Error(`${key}: invalid editor state`);
 const views=[];
 for(const width of [1440,390]){
  await run('set','viewport',String(width),'900');await run('open',page.preview);
  await run('wait','--fn','!!document.querySelector("main h1")');
  const view=(await run('eval','({title:document.querySelector("main h1")?.textContent,headings:[...document.querySelectorAll("main h1")].length,width:innerWidth,scroll:document.documentElement.scrollWidth,links:[...document.querySelectorAll("main a.wp-block-button__link")].map(a=>a.href),text:document.querySelector("main")?.innerText})')).result;
  const expected=Object.values(report.pages).filter(p=>p.id!==page.id).map(p=>p.url);
  if(view.headings!==1||view.scroll>view.width||expected.some(url=>!view.links.includes(url)))throw new Error(`${key}: layout or links failed: ${JSON.stringify(view)}`);
  await run('screenshot',resolve(out,`${key}-${width}.png`),'--full');views.push(view);
 }
 checks.push({key,id:page.id,editor,views});
 await writeFile(resolve(out,'browser-result.json'),JSON.stringify({passed:checks.length===Object.keys(report.pages).length,scope:'Isolated fixture, real Gutenberg editor and draft previews; not a model or extension-auth end-to-end test.',checks},null,2));
}
console.log(JSON.stringify({pages:checks.length,editorBlocks:checks.reduce((n,c)=>n+c.editor.blocks.length,0),viewports:checks.reduce((n,c)=>n+c.views.length,0)}));
