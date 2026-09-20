/** Developer-only isolated extension page; never a production entry point. */
import {z} from 'zod';
import {saveWordpress,testWordpress} from '../src/agent/connections/wordpress';
import {wpReadDesignProfile,wpCompilePage} from '../src/agent/connections/wordpress-design';
import {wpWriteContent,type WpContext} from '../src/agent/connections/wordpress-workflows';
import {wpBlocksSchema} from '../src/agent/connections/wordpress-blocks';
import {FileStore} from '../src/agent/files/store';
import {FileRuntime} from '../src/agent/files/runtime';
import {loadKey} from '../src/agent/storage';
import pages from '../wordpress-site/tests/four-pages.json';
const credential=z.object({site:z.literal('https://wp-agent.test'),username:z.string(),password:z.string()});
async function runWordpressAcceptance(raw:unknown){
 const config=credential.parse(raw);
 if(await chrome.storage.local.get('wp-e2e-started').then(v=>v['wp-e2e-started']))throw new Error('This isolated run has already started; inspect receipts before another run.');
 await chrome.storage.local.set({'wp-e2e-started':true});
 await saveWordpress(config.site,config.username,config.password);await testWordpress();
 const task='wordpress-e2e-0908',store=new FileStore('wordpress-e2e-files'),ctx:WpContext={files:new FileRuntime(store,task),state:{},signal:new AbortController().signal,assertActive:()=>{},persist:async()=>{await chrome.storage.local.set({'wp-e2e-state':ctx.state});}};
 const results=[];
 try{
  const profile=await wpReadDesignProfile(ctx,{contentTypes:['page']});
  await store.change(task,'company-fixture.md',0,()=> '# 示例企业资料（仅验收）\n\n企业：Example Trade Fixture。产品：示例阀门FIXTURE-1，示例材质Stainless steel。邮箱sales@example.com，仅验证链接，不发邮件。所有内容仅用于测试，不代表真实企业或认证。');
  for(const page of pages){
   const blocks=wpBlocksSchema.parse(page.blocks);await wpCompilePage({title:page.title,blocks},ctx);
   const result=await wpWriteContent({type:'page',title:page.title,slug:'browser-'+page.key,status:'draft',blocks},ctx);
   const receipt=z.object({id:z.number(),url:z.string(),status:z.literal('draft'),contentMatches:z.literal(true),titleMatches:z.literal(true),statusMatches:z.literal(true)}).parse(result.receipt);
   results.push({key:page.key,...receipt});
  }
  const report={checkedAt:new Date().toISOString(),site:config.site,transport:'Production HTTPS fetch and real WordPress Application Password; local DNS and certificate trust are isolated to this test browser.',modelRun:false,hasModelKey:Boolean(await loadKey()),profile,pages:results};
  await chrome.storage.local.set({'wp-e2e-result':report});document.querySelector('pre')!.textContent=JSON.stringify(report,null,2);return report;
 }finally{await store.close();}
}
Object.assign(window,{runWordpressAcceptance});
