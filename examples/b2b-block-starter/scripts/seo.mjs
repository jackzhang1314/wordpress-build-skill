import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));const base=p.urls.primary;
assert.equal(base,'http://127.0.0.1:9490');
const wp=code=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','primary','php','/tools/wp','--allow-root','eval',code],{encoding:'utf8',timeout:60000});
await mkdir('docs/acceptance/rankmath-free',{recursive:true});
const old=wp("echo get_option('blog_public');").trim();const result={testedAt:new Date().toISOString(),scope:'public-index settings simulation on loopback only',pages:[]};
function tags(html,name){return [...html.matchAll(new RegExp('<'+name+'\\b[^>]*>','gi'))].map(m=>m[0]);}
try{
 wp("update_option('blog_public','1');");
 for(const path of ['/','/equipment/','/equipment/page/2/','/equipment/model/yhd08/','/equipment/family/mini-excavator/','/industry/','/industry/construction/','/contact-us/','/equipment/?max_weight=1','/?s=excavator',new URL(wp('echo get_author_posts_url(1);').trim()).pathname]){
  const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();
  const canonical=tags(html,'link').filter(t=>/rel=["']canonical["']/.test(t));const robots=tags(html,'meta').filter(t=>/name=["']robots["']/.test(t));const description=tags(html,'meta').filter(t=>/name=["']description["']/.test(t));
  const utility=path.includes('?')||path.includes('/author/');assert.equal((html.match(/<title>/g)||[]).length,1);assert.equal(robots.length,1);assert.equal(/noindex/.test(robots[0]),utility,path+' index policy');assert.ok(canonical.length<=1);
  if(!utility){assert.equal(canonical.length,1,path+' canonical');assert.ok(canonical[0].includes(base+path),path+' self canonical');assert.equal(description.length,1,path+' description');}
  const schemas=[...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));
  assert.ok(html.includes('Search Engine Optimization by Rank Math'),'Rank Math metadata owner '+path);
  assert.ok(!html.includes('127.0.0.1:948')&&!html.includes('127.0.0.1:946'));
  if(path.includes('/model/')){assert.ok(/YHD08/.test(html));assert.ok(/specs/.test(html));assert.ok(tags(html,'img').some(t=>/srcset=/.test(t)&&/width=/.test(t)&&/height=/.test(t)));}
  result.pages.push({path,status:r.status,canonical,robots,description,schemaCount:schemas.length});
 }
 const robots=await(await fetch(base+'/robots.txt')).text();result.robotsTxt=robots;
 const advertised=[...robots.matchAll(/^Sitemap:\s*(\S+)/gmi)].map(m=>m[1]);const maps=advertised.length?advertised:[base+'/sitemap_index.xml'];
 result.sitemaps=[];
 for(const url of maps){const r=await fetch(url);const xml=await r.text();if(r.ok&&/<(?:urlset|sitemapindex)\b/.test(xml)){result.sitemaps.push({url,status:r.status,hasProducts:xml.includes('/equipment/model/'),hasCategories:xml.includes('/equipment/family/'),xml});}}
 assert.ok(result.sitemaps.length,'real sitemap found');
 const children=[];
 for(const index of result.sitemaps){if(index.xml.includes('<sitemapindex'))for(const match of index.xml.matchAll(/<loc>([^<]+)<\/loc>/g)){const url=match[1].replaceAll('&amp;','&');assert.equal(new URL(url).origin,base);const r=await fetch(url);assert.ok(r.ok);const xml=await r.text();children.push({url,hasProducts:xml.includes('/equipment/model/'),hasCategories:xml.includes('/equipment/family/'),xml});}}
 result.children=children;assert.ok(children.every(m=>!m.xml.includes('acceptance-draft')&&!m.xml.includes('/author/admin/')),'draft/trash excluded');assert.ok([...result.sitemaps,...children].some(m=>m.hasProducts));assert.ok([...result.sitemaps,...children].some(m=>m.hasCategories),'category URLs in sitemap');
 await writeFile('docs/acceptance/rankmath-free/seo.json',JSON.stringify(result,null,2));console.log(JSON.stringify({pages:result.pages.length,sitemaps:result.sitemaps.map(s=>({url:s.url,hasProducts:s.hasProducts,hasCategories:s.hasCategories}))}));
}finally{wp("update_option('blog_public',"+JSON.stringify(old)+");");assert.ok((await(await fetch(base)).text()).includes('noindex'));}
