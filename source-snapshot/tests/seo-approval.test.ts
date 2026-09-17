import 'fake-indexeddb/auto';
import {afterEach,expect,it,vi} from 'vitest';
import {MockLanguageModelV4} from 'ai/test';
import {AgentRunner} from '../src/agent/runtime';
import {defaults,newConversation,type Conversation} from '../src/agent/model';
import {FileRuntime} from '../src/agent/files/runtime';
import {FileStore} from '../src/agent/files/store';
const cases:[string,object][]=[
 ['wpApplyNavigation',{plan:{path:'navigation.json',version:1}}],
 ['wpConfigureSite',{expectedRevision:'a'.repeat(64),siteTitle:'New site'}],
 ['wpWriteContent',{title:'Product',blocks:[{type:'paragraph',text:'Facts'}]}],
 ['wpUploadMedia',{file:{path:'photo.png',version:1},title:'Product'}],
 ['wpWriteAbility',{name:'wpforms/create-form',input:{title:'Inquiry'}}],
 ['wpImportProducts',{source:{path:'products.csv',version:1},type:'product',keyColumn:0,titleColumn:1,fields:[{column:2,field:'size'}]}],
 ['dataForSeoResearch',{operation:'backlinkSummary',target:'example.com'}],
 ['startSeoAudit',{target:'example.com',maxPages:10}],
 ['sendSeoEmail',{to:'reader@example.com',subject:'Source reference',body:'Specific proposed message'}],
 ['writeSeoPost',{title:'Article',content:'<p>Facts</p>',status:'publish'}],
 ['createSeoMonitor',{name:'Baseline',query:{operation:'domain',target:'example.com',locationCode:2840,languageCode:'en'},intervalMinutes:1440,maxRuns:2}],
];
afterEach(()=>vi.unstubAllGlobals());
it.each(cases)('自动模式中的 %s 仍须用户审批，拒绝后不访问外部服务',async(name,input)=>{
 const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
 const fs=new FileStore(crypto.randomUUID()),conversation=newConversation();conversation.state='running';conversation.messages.push({id:'assistant',role:'assistant',createdAt:Date.now(),parts:[]});
 const calls=[{name:'selectTools',input:{groups:[name.startsWith('wp')?'wordpress':'seo','files','skills']}},{name,input}];
 let step=0;const model=new MockLanguageModelV4({doStream:async()=>({stream:new ReadableStream({start(c){c.enqueue({type:'stream-start',warnings:[]});const call=calls[step++];if(call)c.enqueue({type:'tool-call',toolCallId:`seo-call-${step}`,toolName:call.name,input:JSON.stringify(call.input)});else{c.enqueue({type:'text-start',id:'text'});c.enqueue({type:'text-delta',id:'text',delta:'已取消此次操作。'});c.enqueue({type:'text-end',id:'text'});}c.enqueue({type:'finish',finishReason:{unified:call?'tool-calls':'stop',raw:call?'tool_calls':'stop'},usage:{inputTokens:{total:1,noCache:1,cacheRead:0,cacheWrite:0},outputTokens:{total:1,text:1,reasoning:0}}});c.close();}})})});
 const updates:Conversation[]=[];const runner=new AgentRunner({stored:{conversation,modelMessages:[{role:'user',content:'执行所选 SEO 操作'}]},settings:{...defaults,mode:'auto'},model,signal:new AbortController(),save:async()=>{},publish:v=>updates.push(v),notes:async()=>'',files:new FileRuntime(fs,conversation.id)});
 try{const running=runner.run();await vi.waitFor(()=>expect(runner.conversation.state).toBe('awaiting-approval'));const part=conversation.messages.flatMap(m=>m.parts).find(p=>p.kind==='tool'&&p.state==='approval');if(!part||part.kind!=='tool')throw new Error('missing approval');expect(fetch).not.toHaveBeenCalled();runner.approve(part.id,false);await running;expect(fetch).not.toHaveBeenCalled();expect(part.state).toBe('denied');}finally{runner.stop();await fs.close();}
});
