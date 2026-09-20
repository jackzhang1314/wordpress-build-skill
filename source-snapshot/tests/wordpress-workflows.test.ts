import 'fake-indexeddb/auto';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {saveWordpress} from '../src/agent/connections/wordpress';
import {wordpressMutation,wpRead,wpWriteContent,wpImportProducts,wpUploadMedia,wpReadAbility,wpWriteAbility,type WpContext} from '../src/agent/connections/wordpress-workflows';
import {serializeWpBlocks,wpBlocksSchema} from '../src/agent/connections/wordpress-blocks';
import {FileStore} from '../src/agent/files/store';
import {FileRuntime} from '../src/agent/files/runtime';
import {readFileUploads,importFiles} from '../src/agent/files/import';
import {fileBytes} from '../src/agent/files/bytes';
import fourPages from '../wordpress-site/tests/four-pages.json';
import {z} from 'zod';
import {replaceNavigation,wpPlanNavigation,wpApplyNavigation} from '../src/agent/connections/wordpress-navigation';
let store:FileStore,ctx:WpContext;
const json=(data:unknown)=>new Response(JSON.stringify(data));
const types={page:{rest_base:'pages',rest_namespace:'wp/v2'},post:{rest_base:'posts'},product:{rest_base:'products'}};
const article=(body:Record<string,unknown>={})=>({id:21,link:'https://site.example/?p=21',status:'draft',modified_gmt:'2026-09-08T00:00:00',title:{raw:body.title??'Product'},content:{raw:body.content??''},acf:body.acf});
beforeEach(async()=>{const values:Record<string,unknown>={};vi.stubGlobal('chrome',{storage:{local:{setAccessLevel:async()=>{},get:async()=>structuredClone(values),set:async(v:Record<string,unknown>)=>Object.assign(values,structuredClone(v))}}});await saveWordpress('https://site.example','editor','test-password');store=new FileStore(crypto.randomUUID());ctx={files:new FileRuntime(store,'wp'),state:{},signal:new AbortController().signal,persist:vi.fn(async()=>{}),assertActive:()=>{}};});
afterEach(async()=>{await store.close();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('内容回执直接提供真实正文与修改时间，长文截断不冒充完整且保留完整证据',async()=>{
 let body='<!-- wp:paragraph --><p>Fixture</p><!-- /wp:paragraph -->';
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>json(u.includes('/types?')?types:article({content:body}))));
 const short=await wpRead({operation:'content',id:21},ctx);
 expect(short).toMatchObject({content:{id:21,status:'draft',modifiedGmt:'2026-09-08T00:00:00',raw:body,rawComplete:true,totalCharacters:body.length}});
 body='a'.repeat(6001);const long=await wpRead({operation:'content',id:21},ctx);
 expect(long).toMatchObject({content:{raw:'a'.repeat(6000),rawComplete:false,totalCharacters:6001}});
 const saved=await store.read('wp',long.evidence.path,long.evidence.version);
 expect(JSON.parse(saved.content).result.content.raw).toBe(body);
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>json(u.includes('/types?')?types:{...article(),content:{rendered:'Protected'}})));
 expect(await wpRead({operation:'content',id:21},ctx)).toMatchObject({content:{rawComplete:false}});
});
it('导航局部替换保留前后字节与布局属性，拒绝重复、复杂和锁定片段',()=>{
 const markup='<!-- wp:navigation {"ref":22,"layout":{"type":"flex","justifyContent":"right"}} /-->',outside='<div>Existing logo</div>';
 const result=replaceNavigation(outside+markup+'<p>Footer</p>',markup,[{pageId:3,label:'A < B',url:'https://site.example/p'}]);
 expect(result.detachedRef).toBe(22);expect(result.content.startsWith(outside)).toBe(true);expect(result.content.endsWith('<p>Footer</p>')).toBe(true);expect(result.content).toContain('"justifyContent":"right"');expect(result.content).not.toContain('"ref"');expect(result.content).not.toContain('A < B');
 expect(()=>replaceNavigation(markup+markup,markup,[])).toThrow('唯一');
 const complex='<!-- wp:navigation --><!-- wp:search /--><!-- /wp:navigation -->';expect(()=>replaceNavigation(complex,complex,[])).toThrow('未适配');
 const locked='<!-- wp:navigation {"lock":{"remove":true}} /-->';expect(()=>replaceNavigation(locked,locked,[])).toThrow('锁');
 const paired='<!-- wp:navigation {"overlayMenu":"mobile"} --><!-- wp:navigation-link {"label":"Old","url":"https://site.example/old"} /--><!-- /wp:navigation -->';expect(replaceNavigation(paired,paired,[{pageId:3,label:'New',url:'https://site.example/new'}]).content).toContain('"overlayMenu":"mobile"');
});
it('导航计划绑定固定文件，写前版本检查，回读失败后恢复且不重复POST',async()=>{
 const markup='<!-- wp:navigation /-->';let content='<div>'+markup+'</div>',failReadback=false,writes=0;
 const mock=vi.fn(async(u:string,o?:RequestInit)=>{
  if(u.includes('/themes?'))return json([{stylesheet:'theme',is_block_theme:true}]);
  if(u.includes('/pages/'))return json({id:3,type:'page',status:'publish',link:'https://site.example/product'});
  if(o?.method==='POST'){writes++;content=(JSON.parse(String(o.body)) as {content:string}).content;failReadback=true;return json({id:'theme//header'});}
  if(failReadback){failReadback=false;return new Response('{}',{status:503});}
  return json({id:'theme//header',theme:'theme',status:'publish',content:{raw:content}});
 });vi.stubGlobal('fetch',mock);
 const planned=await wpPlanNavigation({templatePart:'theme//header',navigationMarkup:markup,links:[{pageId:3,label:'Product'}]},ctx);
 content+='changed';await expect(wpApplyNavigation({plan:planned.plan},ctx)).rejects.toThrow('已变化');expect(writes).toBe(0);content=content.replace('changed','');
 await expect(wpApplyNavigation({plan:planned.plan},ctx)).rejects.toThrow('503');ctx.state=structuredClone(ctx.state);
 expect(await wpApplyNavigation({plan:planned.plan},ctx)).toMatchObject({receipt:{contentMatches:true,themeMatches:true}});expect(writes).toBe(1);
 expect(await wpApplyNavigation({plan:planned.plan},ctx)).toMatchObject({cached:true});expect(writes).toBe(1);
 const original=await store.read('wp',planned.plan.path,planned.plan.version);
 const tampered=await store.change('wp','tampered.json',0,()=>original.content.replace('Product','Different'),()=>{});
 await expect(wpApplyNavigation({plan:tampered},ctx)).rejects.toThrow('先生成');
});
it('导航拒绝草稿页面、未预览计划和越界模板路径',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>u.includes('/themes?')?json([{stylesheet:'theme',is_block_theme:true}]):u.includes('/pages/')?json({id:3,type:'page',status:'draft',link:'https://site.example/p'}):json({id:'theme//header',theme:'theme',status:'publish',content:{raw:'<!-- wp:navigation /-->'}})));
 await expect(wpPlanNavigation({templatePart:'theme//header',navigationMarkup:'<!-- wp:navigation /-->',links:[{pageId:3,label:'Draft'}]},ctx)).rejects.toThrow();
 await expect(wpPlanNavigation({templatePart:'theme//../settings',navigationMarkup:'<!-- wp:navigation /-->',links:[{pageId:3,label:'Bad'}]},ctx)).rejects.toThrow();
 expect(vi.mocked(fetch).mock.calls.every(([,o])=>o?.method==='GET')).toBe(true);
});
it('引用共享菜单时先读取原内容，菜单发生变化则拒绝脱离引用',async()=>{
 const markup='<!-- wp:navigation {"ref":22} /-->';let oldMenu='<!-- wp:page-list /-->';
 const mock=vi.fn(async(u:string)=>u.includes('/themes?')?json([{stylesheet:'theme',is_block_theme:true}]):u.includes('/pages/')?json({id:3,type:'page',status:'publish',link:'https://site.example/p'}):u.includes('/navigation/22')?json({id:22,content:{raw:oldMenu}}):json({id:'theme//header',theme:'theme',status:'publish',content:{raw:markup}}));vi.stubGlobal('fetch',mock);
 const plan=await wpPlanNavigation({templatePart:'theme//header',navigationMarkup:markup,links:[{pageId:3,label:'Product'}]},ctx);
 expect(plan).toMatchObject({detachedRef:22,removedNavigation:oldMenu,removedNavigationComplete:true});
 oldMenu='<!-- wp:navigation-link {"label":"Changed"} /-->';
 await expect(wpApplyNavigation({plan:plan.plan},ctx)).rejects.toThrow('共享菜单内容已变化');
 expect(vi.mocked(fetch).mock.calls.every(([,o])=>o?.method==='GET')).toBe(true);
});
it('四页依次保存草稿、用真实回执补链，恢复后不重复创建',async()=>{
 const {wpCompilePage}=await import('../src/agent/connections/wordpress-design');
 const saved=new Map<number,Record<string,unknown>>();let nextId=100;
 const mock=vi.fn(async(u:string,o?:RequestInit)=>{
  if(u.includes('/types'))return json(types);
  const match=new URL(u).pathname.match(/\/pages(?:\/(\d+))?$/);
  if(!match||o?.method==='OPTIONS')return new Response('{}',{status:403});
  if(o?.method==='POST'){
   const id=match[1]?Number(match[1]):nextId++;
   const body=JSON.parse(String(o.body)) as Record<string,unknown>;
   const data={...article(body),id,link:`https://site.example/?page_id=${id}`};saved.set(id,data);return json(data);
  }
  return json(saved.get(Number(match[1])));
 });vi.stubGlobal('fetch',mock);
 const receipts=[];
 for(const page of fourPages){
  const blocks=wpBlocksSchema.parse(page.blocks);
  await wpCompilePage({title:page.title,blocks},ctx);
  const input={type:'page' as const,title:page.title,slug:page.key,blocks,status:'draft' as const};
  const result=await wpWriteContent(input,ctx);expect(result.receipt).toMatchObject({status:'draft',contentMatches:true,frontendVerified:false});
  receipts.push({input,receipt:z.object({id:z.number(),url:z.string(),modified:z.string()}).parse(result.receipt)});
 }
 ctx.state=structuredClone(ctx.state);
 for(const item of receipts)expect(await wpWriteContent(item.input,ctx)).toMatchObject({cached:true});
 expect(saved.size).toBe(4);
 for(const item of receipts){
  const blocks=wpBlocksSchema.parse([...item.input.blocks,...receipts.filter(other=>other!==item).map(other=>({type:'button',text:other.input.title,url:other.receipt.url}))]);
  const updated=await wpWriteContent({...item.input,id:item.receipt.id,expectedModified:item.receipt.modified,blocks},ctx);
  expect(updated.receipt).toMatchObject({id:item.receipt.id,status:'draft',contentMatches:true});
 }
 expect(saved.size).toBe(4);expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(8);
});
it('写后回读失败保留响应并恢复，结果未知从持久化副本恢复后也不重发',async()=>{
 const send=vi.fn(async()=>({id:21})),verify=vi.fn().mockRejectedValueOnce(new Error('readback')).mockResolvedValue({id:21});
 await expect(wordpressMutation(ctx,'site',{kind:'test'},send,verify)).rejects.toThrow('readback');ctx.state=structuredClone(ctx.state);
 expect(await wordpressMutation(ctx,'site',{kind:'test'},send,verify)).toMatchObject({receipt:{id:21}});expect(send).toHaveBeenCalledTimes(1);
 const lost=vi.fn(async()=>{throw new Error('lost');});await expect(wordpressMutation(ctx,'site',{kind:'lost'},lost,verify)).rejects.toThrow('lost');ctx.state=structuredClone(ctx.state);
 await expect(wordpressMutation(ctx,'site',{kind:'lost'},lost,verify)).rejects.toThrow('未知');expect(lost).toHaveBeenCalledTimes(1);
});
it('本地前置校验或版本冲突不创建未知提交；恢复后同操作可再次验证',async()=>{
 const prepare=vi.fn().mockRejectedValueOnce(new Error('conflict')).mockResolvedValue(undefined),send=vi.fn(async()=>({id:21}));
 await expect(wordpressMutation(ctx,'site',{},send,async x=>x,prepare)).rejects.toThrow('conflict');expect(Object.keys(ctx.state.wpOperations??{})).toHaveLength(0);
 await wordpressMutation(ctx,'site',{},send,async x=>x,prepare);expect(send).toHaveBeenCalledTimes(1);
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>json(u.includes('/types')?types:article())));
 await expect(wpWriteContent({id:21,expectedModified:'old',title:'Product',blocks:[{type:'paragraph',text:'Facts'}]},ctx)).rejects.toThrow('已变化');
 expect(vi.mocked(fetch).mock.calls.every(([,options])=>options?.method==='GET')).toBe(true);
});
it('区块文本转义，禁止脚本链接/HTML类型和未核验图片；保存原生页面并核对回读',async()=>{
 expect(()=>wpBlocksSchema.parse([{type:'button',text:'Go',url:'javascript:alert(1)'}])).toThrow();
 expect(()=>wpBlocksSchema.parse([{type:'html',html:'<script/>'}])).toThrow();
 expect(()=>serializeWpBlocks([{type:'image',mediaId:2,alt:''}],new Map())).toThrow('核验');
 const blocks=wpBlocksSchema.parse([{type:'section',children:[{type:'heading',text:'<script>Bad</script>'},{type:'paragraph',text:'Facts & specs'}]}]);
 const html=serializeWpBlocks(blocks,new Map());expect(html).toContain('<!-- wp:group -->');expect(html).not.toContain('<script>');
 let body:Record<string,unknown>={};const mock=vi.fn(async(u:string,o?:RequestInit)=>{if(u.includes('/types'))return json(types);if(o?.method==='POST')body=JSON.parse(String(o.body)) as Record<string,unknown>;return json(article(body));});vi.stubGlobal('fetch',mock);
 expect(await wpWriteContent({title:'Product',blocks},ctx)).toMatchObject({receipt:{contentMatches:true,titleMatches:true,statusMatches:true,frontendVerified:false}});
 expect(await wpWriteContent({title:'Product',blocks},ctx)).toMatchObject({cached:true});expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
});
it('图片原始字节导入与multipart上传一致；重复调用复用媒体回执',async()=>{
 const bytes=new Uint8Array([137,80,78,71,13,10,26,10,1,2,3]);
 const uploads=await readFileUploads([new File([bytes],'part.png')]),saved=await importFiles(store,'wp',uploads);const f=saved.files[0]!;
 expect(fileBytes(await store.read('wp',f.path,f.version))).toEqual(bytes);
 const mock=vi.fn(async(_u:string,o?:RequestInit)=>{if(o?.method==='POST'){expect(o.body).toBeInstanceOf(FormData);const media=(o.body as FormData).get('file');if(!(media instanceof Blob))throw new Error('not a file');expect(new Uint8Array(await media.arrayBuffer())).toEqual(bytes);expect(new Headers(o.headers).has('Content-Type')).toBe(false);}return json({id:3,source_url:'https://site.example/part.png',media_type:'image',alt_text:'Part'});});vi.stubGlobal('fetch',mock);
 expect(await wpUploadMedia({file:f,title:'Part',alt:'Part'},ctx)).toMatchObject({receipt:{id:3,altMatches:true}});expect(await wpUploadMedia({file:f,title:'Part',alt:'Part'},ctx)).toMatchObject({cached:true});expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
 await expect(importFiles(store,'bad',[{name:'fake.png',content:btoa('text'),encoding:'base64'}])).rejects.toThrow('文件头');expect(await store.list('bad')).toEqual([]);
});
it('ACF全表先校验、预览绑定固定批次，成功导入与重试只创建一次',async()=>{
 const source=(await importFiles(store,'wp',[{name:'products.csv',content:'sku,title,size\nA,Valve,10\nB,Pump,20',encoding:'utf-8'}])).files[0]!;
 let body:Record<string,unknown>={};const mock=vi.fn(async(u:string,o?:RequestInit)=>{if(u.includes('/types'))return json(types);if(o?.method==='OPTIONS')return json({schema:{properties:{acf:{type:'object',properties:{size:{type:'number'}},additionalProperties:false}}}});if(u.includes('slug='))return json([]);if(o?.method==='POST')body=JSON.parse(String(o.body)) as Record<string,unknown>;return json(article(body));});vi.stubGlobal('fetch',mock);
 const input={source,type:'product',keyColumn:0,titleColumn:1,fields:[{column:2,field:'size',format:'number' as const}],limit:1};
 await expect(wpImportProducts(input,ctx,true)).rejects.toThrow('预览');expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);
 expect(await wpImportProducts(input,ctx,false)).toMatchObject({rows:1,totalRows:2,nextOffset:1});expect(await wpImportProducts(input,ctx,true)).toMatchObject({processed:1,stopped:false,nextOffset:1});await wpImportProducts(input,ctx,true);expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
 await expect(wpImportProducts({...input,offset:1},ctx,true)).rejects.toThrow('预览');
 await expect(wpImportProducts({...input,fields:[{column:2,field:'typo'}]},ctx,false)).rejects.toThrow('未公开');
 const bad=(await importFiles(store,'wp',[{name:'bad.csv',content:'sku,title,size\nA,Valve,10\nA,Pump,20',encoding:'utf-8'}])).files[0]!;
 await expect(wpImportProducts({...input,source:bad},ctx,false)).rejects.toThrow('重复');expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
});
it('插件调用只读GET/写POST分离，校验实时schema并回读真实表单',async()=>{
 const mock=vi.fn(async(u:string,o?:RequestInit)=>{const name=new URL(u).pathname.split('/abilities/')[1]!;if(!name.includes('/run'))return json({name,input_schema:{type:'object',properties:name==='wpforms/create-form'?{title:{type:'string'}}:{form_id:{type:'integer'},include_fields:{type:'boolean'}},required:name==='wpforms/create-form'?['title']:['form_id'],additionalProperties:false}});if(o?.method==='POST'){expect(JSON.parse(String(o.body))).toEqual({input:{title:'Inquiry'}});return json({form_id:12});}expect(new URL(u).searchParams.get('input[form_id]')).toBe('12');return json({id:12,title:'Inquiry',fields:[]});});vi.stubGlobal('fetch',mock);
 await expect(wpReadAbility({name:'wpforms/get-form',input:{form_id:'wrong'}},ctx)).rejects.toThrow('schema');
 expect(await wpWriteAbility({name:'wpforms/create-form',input:{title:'Inquiry'}},ctx)).toMatchObject({receipt:{readbackPerformed:true,response:{form_id:12}}});expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
});
it('主题读取权限不足保留unknown；只读编译检查深层媒体并保存完整计划',async()=>{
 const {wpCompilePage,wpReadDesignProfile}=await import('../src/agent/connections/wordpress-design');
 const mock=vi.fn(async(u:string)=>u.includes('/media/')?json({id:3,source_url:'https://site.example/a.png',media_type:'image'}):new Response('{}',{status:403}));vi.stubGlobal('fetch',mock);
 expect(await wpReadDesignProfile(ctx)).toMatchObject({themes:{status:'unknown',httpStatus:403},blocks:{status:'unknown'}});
 const result=await wpCompilePage({title:'Product',blocks:[{type:'columns',columns:[{children:[{type:'section',children:[{type:'image',mediaId:3,alt:'Part'}]}]},{children:[{type:'paragraph',text:'Facts'}]}]}]},ctx);
 expect(result).toMatchObject({registrationChecked:false,frontendVerified:false});expect(result.requiredBlocks).toContain('core/column');
 expect(mock.mock.calls.some(([u])=>u.includes('/media/3'))).toBe(true);expect(vi.mocked(fetch).mock.calls.every(([,o])=>o?.method==='GET'||o?.method==='OPTIONS')).toBe(true);
 const file=await store.read('wp',result.evidence.path,result.evidence.version);expect(file.content).toContain('wp:columns');expect(file.content).not.toContain('test-password');
});
it('选择模板须实时枚举且回读一致；错误模板不发写请求',async()=>{
 let body:Record<string,unknown>={};const mock=vi.fn(async(u:string,o?:RequestInit)=>{
  if(u.includes('/types'))return json(types);
  if(o?.method==='OPTIONS')return json({schema:{properties:{template:{type:'string',enum:['','landing']}}}});
  if(o?.method==='POST')body=JSON.parse(String(o.body)) as Record<string,unknown>;
  return json({...article(body),template:body.template});
 });vi.stubGlobal('fetch',mock);
 const input={title:'Product',template:'made-up',blocks:[{type:'paragraph' as const,text:'Facts'}]};
 await expect(wpWriteContent(input,ctx)).rejects.toThrow('模板');expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);
 expect(await wpWriteContent({...input,template:'landing'},ctx)).toMatchObject({receipt:{templateMatches:true}});
});
it('禁止失衡列宽、不规则表格、CSS注入和过深树，所有内置组合可以编译',async()=>{
 const {default:patterns}=await import('../src/agent/skills/builtin/wordpress/patterns.json');
 for(const nodes of Object.values(patterns))expect(serializeWpBlocks(wpBlocksSchema.parse(nodes),new Map())).toContain('<!-- wp:');
 expect(()=>wpBlocksSchema.parse([{type:'columns',columns:[{width:40,children:[{type:'paragraph',text:'A'}]},{width:40,children:[{type:'paragraph',text:'B'}]}]}])).toThrow('100');
 expect(()=>wpBlocksSchema.parse([{type:'table',rows:[['A'],['B','C']]}])).toThrow('列数');
 expect(()=>wpBlocksSchema.parse([{type:'section',style:{background:'url(https://evil.test)'},children:[{type:'paragraph',text:'A'}]}])).toThrow();
 let node:unknown={type:'paragraph',text:'A'};for(let i=0;i<4;i++)node={type:'section',children:[node]};expect(()=>wpBlocksSchema.parse([node])).toThrow();
});
it('站点缺少所需区块拒绝编译，读取失败不能伪装成功',async()=>{
 const {wpCompilePage,wpReadDesignProfile}=await import('../src/agent/connections/wordpress-design');
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>u.includes('block-types')?json([{name:'core/paragraph'}]):new Response('{}',{status:403})));
 await expect(wpCompilePage({title:'FAQ',blocks:[{type:'faq',question:'Why?',answer:'Facts'}]},ctx)).rejects.toThrow('core/details');
 vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('network');}));await expect(wpReadDesignProfile(ctx)).rejects.toThrow('请求中断');
});
it('紧凑工具schema保留完整运行时校验且不再展开大树',async()=>{
 const {z}=await import('zod');const {wpToolBlocksSchema}=await import('../src/agent/connections/wordpress-blocks');
 expect(JSON.stringify(z.toJSONSchema(wpToolBlocksSchema,{io:'input'})).length).toBeLessThan(1000);
 expect(()=>wpToolBlocksSchema.parse([{type:'button',text:'Bad',url:'javascript:alert(1)'}])).toThrow();
 expect(()=>wpToolBlocksSchema.parse([{type:'section',style:{padding:999},children:[{type:'paragraph',text:'A'}]}])).toThrow();
});
it('站点配置校验版本、写后回读与复用回执；旧版本不POST',async()=>{
 const {wpConfigureSite}=await import('../src/agent/connections/wordpress-site');
 const state={siteTitle:'Before',description:'',homePage:0,postsPage:0,showOnFront:'posts',theme:'old-theme',brandColor:'#165D47'};
 let revision='a'.repeat(64);const mock=vi.fn(async(_u:string,o?:RequestInit)=>{if(o?.method==='POST'){const body=JSON.parse(String(o.body)) as {siteTitle:string};state.siteTitle=body.siteTitle;revision='b'.repeat(64);}return json({version:'0.1.0',modelVersion:1,revision,state,acfAvailable:false,themeInstalled:true,canConfigure:true,models:{}});});vi.stubGlobal('fetch',mock);
 await expect(wpConfigureSite({expectedRevision:'c'.repeat(64),siteTitle:'After'},ctx)).rejects.toThrow('变化');expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);
 const input={expectedRevision:'a'.repeat(64),siteTitle:'After'};
 expect(await wpConfigureSite(input,ctx)).toMatchObject({receipt:{settingsMatch:true,frontendVerified:false}});
 expect(await wpConfigureSite(input,ctx)).toMatchObject({cached:true});expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
 expect(state.theme).toBe('old-theme');
});
it('CPT业务字段按实际schema校验并核对回读',async()=>{
 let body:Record<string,unknown>={};const mock=vi.fn(async(u:string,o?:RequestInit)=>{
  if(u.includes('/types'))return json({...types,oct_product:{rest_base:'oct_product'}});
  if(o?.method==='OPTIONS')return json({schema:{properties:{meta:{properties:{oct_model:{type:'string',maxLength:20}}}}}});
  if(o?.method==='POST')body=JSON.parse(String(o.body)) as Record<string,unknown>;
  return json({...article(body),meta:body.meta});
 });vi.stubGlobal('fetch',mock);
 const input={type:'oct_product' as const,title:'Valve',blocks:[{type:'paragraph',text:'Facts'}],meta:{oct_model:'MV-1'}};
 expect(await wpWriteContent(input,ctx)).toMatchObject({receipt:{metaMatches:true}});
 await expect(wpWriteContent({...input,meta:{oct_unknown:'Bad'}},ctx)).rejects.toThrow('未在站点schema登记');
 expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
});

it('同一页面多个动态目录使用独立查询ID',()=>{const html=serializeWpBlocks(wpBlocksSchema.parse([{type:'catalog',postType:'oct_product'},{type:'catalog',postType:'oct_case'}]),new Map());expect(html).toContain('"queryId":1');expect(html).toContain('"queryId":2');});
it('设计档案的大schema只进证据文件，工具返回保持简短',async()=>{
 const {wpReadDesignProfile}=await import('../src/agent/connections/wordpress-design');
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>u.includes('block-types')?json([{name:'core/paragraph',attributes:{large:'x'.repeat(30000)}}]):new Response('{}',{status:403})));
 const result=await wpReadDesignProfile(ctx);expect(result.blocks.names).toEqual(['core/paragraph']);expect(JSON.stringify(result).length).toBeLessThan(3000);
 expect((await store.read('wp',result.evidence.path,result.evidence.version)).content).toContain('x'.repeat(30000));
});
it('站点配置不接受主题激活和自有主题品牌字段',async()=>{
 const {wpConfigureSiteSchema}=await import('../src/agent/connections/wordpress-site');
 expect(()=>wpConfigureSiteSchema.parse({expectedRevision:'a'.repeat(64),activateTheme:true})).toThrow();
 expect(()=>wpConfigureSiteSchema.parse({expectedRevision:'a'.repeat(64),brandColor:'#123456'})).toThrow();
});
it('原生设置无需配套插件，核对已发布首页、字段、版本和回读',async()=>{
 const {readNativeWordpressSite,wpConfigureSite}=await import('../src/agent/connections/wordpress-site');
 const state={title:'Before',description:'',show_on_front:'posts',page_on_front:0,page_for_posts:0};
 let status='draft';
 const mock=vi.fn(async(u:string,o?:RequestInit)=>{
  if(u.includes('/users/me'))return json({capabilities:{manage_options:true}});
  if(u.includes('/pages/'))return json({id:7,type:'page',status});
  if(o?.method==='OPTIONS')return json({schema:{properties:Object.fromEntries(Object.keys(state).map(k=>[k,{}]))}});
  if(o?.method==='POST'){const body=JSON.parse(String(o.body)) as Record<string,unknown>;expect(Object.keys(body).sort()).toEqual(['page_on_front','show_on_front','title']);Object.assign(state,body);}
  return json(state);
 });vi.stubGlobal('fetch',mock);
 const before=await readNativeWordpressSite(ctx.signal),input={source:'native' as const,expectedRevision:before.revision,homePage:7,siteTitle:'After'};
 await expect(wpConfigureSite({...input,expectedRevision:'a'.repeat(64)},ctx)).rejects.toThrow('已变化');
 await expect(wpConfigureSite(input,ctx)).rejects.toThrow('已发布');
 expect(mock.mock.calls.some(([,o])=>o?.method==='POST')).toBe(false);
 status='publish';expect(await wpConfigureSite(input,ctx)).toMatchObject({receipt:{source:'native',settingsMatch:true,state:{homePage:7,showOnFront:'page'},frontendVerified:false}});
 expect(await wpConfigureSite(input,ctx)).toMatchObject({cached:true});
 expect(mock.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
 expect(mock.mock.calls.some(([u])=>u.includes('octopus'))).toBe(false);
 const after=await readNativeWordpressSite(ctx.signal);
 await expect(wpConfigureSite({source:'native',expectedRevision:after.revision,postsPage:7},ctx)).rejects.toThrow('不能相同');
});
it('原生设置只读字段不POST，账号明确无权限也不POST',async()=>{
 const {readNativeWordpressSite,wpConfigureSite}=await import('../src/agent/connections/wordpress-site');
 let allowed=true;
 const mock=vi.fn(async(u:string,o?:RequestInit)=>u.includes('/users/me')?json({capabilities:{manage_options:allowed}}):o?.method==='OPTIONS'?json({schema:{properties:{title:{readonly:true}}}}):json({title:'Before',description:'',show_on_front:'posts',page_on_front:0,page_for_posts:0}));vi.stubGlobal('fetch',mock);
 const before=await readNativeWordpressSite(ctx.signal),input={source:'native' as const,expectedRevision:before.revision,siteTitle:'After'};
 await expect(wpConfigureSite(input,ctx)).rejects.toThrow('未开放');allowed=false;
 await expect(wpConfigureSite(input,ctx)).rejects.toThrow('没有站点配置权限');
 expect(mock.mock.calls.some(([,o])=>o?.method==='POST')).toBe(false);
});
it('导航和模板发现只用固定GET分页并保存证据',async()=>{
 const {wpRead}=await import('../src/agent/connections/wordpress-workflows');
 const mock=vi.fn(async()=>json([{id:'theme//footer',content:{raw:'Existing theme content'}},{id:'theme//header',content:{raw:'Existing theme content'}}]));vi.stubGlobal('fetch',mock);
 for(const operation of ['navigation','templates','templateParts'] as const){const result=await wpRead({operation,page:2,limit:1},ctx);expect(result.summary).toMatchObject(operation==='navigation'?{count:2,page:2}:{count:1,page:2,nextPage:null,total:2});expect((await store.read('wp',result.evidence.path,result.evidence.version)).content).toContain('Existing theme content');}
 expect(mock.mock.calls).toHaveLength(3);for(const [url,options]of vi.mocked(fetch).mock.calls){expect(options?.method).toBe('GET');if(String(url).includes('/navigation?'))expect(String(url)).toContain('page=2');else expect(String(url)).not.toContain('per_page');}
});
