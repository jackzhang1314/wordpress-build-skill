// Developer-only acceptance, against the isolated four-pages fixture site.
import {readFile,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const [directory,session]=process.argv.slice(2);if(!directory||!session)throw new Error('Provide isolated fixture directory and authenticated session.');
const out=resolve(directory),fixture=JSON.parse(await readFile(resolve(out,'four-pages-result.json'),'utf8'));
const run=async(...args)=>{const {stdout}=await promisify(execFile)('agent-browser',['--session',session,'--json',...args],{maxBuffer:2*1024*1024});const r=JSON.parse(stdout);if(!r.success)throw new Error(JSON.stringify(r));return r.data;};
const api=async(path,data)=>{const options={path,...(data?{method:'POST',data}:{})};return (await run('eval',`wp.apiFetch(${JSON.stringify(options)})`)).result;};
await run('open',fixture.pages.home.edit);await run('wait','--fn','!!window.wp?.apiFetch');
const site=(await run('eval','location.origin')).result;if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(site))throw new Error('Only isolated loopback sites.');
await build({stdin:{contents:"export {replaceNavigation} from './src/agent/connections/wordpress-navigation';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile:resolve(out,'navigation.cjs')});
const {replaceNavigation}=await import(pathToFileURL(resolve(out,'navigation.cjs')).href);
const parts=await api('/wp/v2/template-parts?context=edit'),header=parts.find(p=>p.slug==='header'&&p.theme===fixture.theme);
if(!header)throw new Error('Missing fixture header.');
const source=header.content.raw,markup=source.match(/<!-- wp:navigation(?: (\{[^\r\n]*?\}))? \/-->/)?.[0];
if(!markup)throw new Error('Fresh default fixture navigation required; no blind overwrite.');
const links=[];
for(const key of ['home','product','about','contact']){
 const existing=await api(`/wp/v2/pages?context=edit&slug=nav-fixture-${key}&status=any`);
 const page=existing[0]??await api('/wp/v2/pages',{title:`Navigation ${key} fixture`,slug:`nav-fixture-${key}`,status:'publish',content:`<!-- wp:paragraph --><p>Isolated navigation target: ${key}</p><!-- /wp:paragraph -->`});
 if(page.status!=='publish')throw new Error('Target is not published.');links.push({label:key,pageId:page.id,url:page.link});
}
const patch=replaceNavigation(source,markup,links),before=await api(`/wp/v2/template-parts/${header.id}?context=edit`);
if(before.content.raw!==source)throw new Error('Header changed before write.');
await api(`/wp/v2/template-parts/${header.id}`,{content:patch.content});
const after=await api(`/wp/v2/template-parts/${header.id}?context=edit`);
if(after.content.raw!==patch.content)throw new Error('Header readback mismatch.');
const valid=(await run('eval',`wp.blocks.parse(${JSON.stringify(after.content.raw)}).flatMap(function walk(b){return [{name:b.name,isValid:b.isValid},...b.innerBlocks.flatMap(walk)]})`)).result;
if(!valid.length||valid.some(b=>!b.isValid))throw new Error('Gutenberg rejects header blocks.');
const checks=[];
for(const width of [1440,390]){
 await run('set','viewport',String(width),'900');await run('open',links[0].url);
 const info=(await run('eval','({width:innerWidth,scroll:document.documentElement.scrollWidth,links:[...document.querySelectorAll("header nav a")].map(a=>a.href),hasTitle:!!document.querySelector("header .wp-block-site-title")})')).result;
 if(info.scroll>info.width||!info.hasTitle||links.some(l=>!info.links.includes(l.url)))throw new Error('Navigation layout/links mismatch.');
 await run('screenshot',resolve(out,`navigation-${width}.png`),'--full');checks.push(info);
}
await writeFile(resolve(out,'navigation-result.json'),JSON.stringify({passed:true,site,templatePart:header.id,before:source,after:after.content.raw,links,blocks:valid,checks,mobileInteraction:'pending',scope:'Real isolated WordPress with production fragment transformer; not extension authentication or real model end-to-end.'},null,2));
console.log(JSON.stringify({blocks:valid.length,checks:checks.length,templatePart:header.id}));
