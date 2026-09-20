import { expect, it } from 'vitest';
import { asSchema, tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { ToolSelection } from '../src/agent/harness/tool-selection';
import { ContextManager } from '../src/agent/context/manager';
import { newConversation } from '../src/agent/model';
const names=['snapshot','collectTable','exportCollectedTable','readTableFile','readFile','runJavaScript','selectTools'];
const tools=Object.fromEntries(names.map(name=>[name,tool({inputSchema:z.object({}),execute:async()=>({})})]));
it('没有网页的文件续写任务仍能调用确定性表格导出，避免被迫编写脚本',()=>{
 const active=new ToolSelection(false).active(tools);
 expect(active).toContain('exportCollectedTable');expect(active).toContain('readTableFile');expect(active).not.toContain('collectTable');expect(active).not.toContain('snapshot');
});
it('用户任务只需文件工具时保留导出，采集与网页操作仍隐藏',async()=>{
 const selection=new ToolSelection(true),choose=selection.tool(tools);
 await choose.execute!({groups:['files']},{toolCallId:'files',messages:[],context:{}});
 expect(selection.active(tools)).toEqual(['exportCollectedTable','readFile','readTableFile','runJavaScript','selectTools']);
});
const wordpressNames=['wpReadDesignProfile','wpCompilePage','wpRead','wpWriteContent','wpUploadMedia','wpReadAbility','wpWriteAbility','wpPreviewProducts','wpImportProducts','wpWorkflowStatus','wpReadSite','wpConfigureSite','wpPlanNavigation','wpApplyNavigation'];
it('SEO与地图连接器不常驻WordPress步骤，选择对应组后恢复且可组合',async()=>{
 const connectorNames=['dataForSeoQuery','sendSeoEmail','readSeoPost','startMapsSearch','collectMapsResults'];
 const registry:ToolSet={...tools,...Object.fromEntries([...wordpressNames,...connectorNames,'askUserQuestion','readContext'].map(name=>[name,tool({inputSchema:z.object({}),execute:async()=>({})})]))};
 const selection=new ToolSelection(true),choose=selection.tool(registry);
 await choose.execute!({groups:['wordpress','files','skills']},{toolCallId:'wp',messages:[],context:{}});
 expect(selection.active(registry).filter(name=>connectorNames.includes(name))).toEqual([]);
 expect(selection.active(registry)).toEqual(expect.arrayContaining([...wordpressNames,'readContext','askUserQuestion']));
 const parsed=await asSchema(choose.inputSchema).validate?.({groups:['seo','maps','files']});
 if(!parsed?.success)throw Error('Connector groups rejected');
 await choose.execute!(parsed.value,{toolCallId:'connectors',messages:[],context:{}});
 expect(selection.active(registry)).toEqual(expect.arrayContaining(connectorNames));
 expect(selection.active(registry).filter(name=>wordpressNames.includes(name))).toEqual([]);
});
it('WordPress工具按需启用，切回文件组可释放它们，核心恢复入口常驻',async()=>{
 const registry: ToolSet={...tools,...Object.fromEntries([...wordpressNames,'checkDeliveries','readContext','askUserQuestion'].map(name=>[name,tool({inputSchema:z.object({}),execute:async()=>({})})]))};
 const selection=new ToolSelection(true),choose=selection.tool(registry);
 expect(selection.active(registry).filter(name=>wordpressNames.includes(name))).toEqual([]);
 expect(choose.description).toContain('wordpress');
 // Use the exported tool's validator; this fails on the old group enum.
 const input=choose.inputSchema;
 const parsed=await asSchema(input).validate?.({groups:['wordpress','files']});
 expect(parsed?.success).toBe(true);
 if(!parsed?.success)throw new Error('WordPress group is not selectable');
 await choose.execute!(parsed.value,{toolCallId:'wp',messages:[],context:{}});
 expect(selection.active(registry)).toEqual(expect.arrayContaining([...wordpressNames,'readFile','checkDeliveries','readContext','askUserQuestion']));
 await choose.execute!({groups:['files']},{toolCallId:'files',messages:[],context:{}});
 expect(selection.active(registry).filter(name=>wordpressNames.includes(name))).toEqual([]);
 expect(selection.active(registry)).toEqual(expect.arrayContaining(['checkDeliveries','readContext','askUserQuestion']));
});
it('未选择的大型WordPress schema不会挤掉普通任务预算，选择后仍受原预算保护',async()=>{
 const large=tool({inputSchema:z.object({blocks:z.string().describe('字段'.repeat(18000))}),execute:async()=>({})});
 const registry: ToolSet={...tools,wpWriteContent:large};
 const selection=new ToolSelection(false),manager=new ContextManager({conversation:newConversation(),modelMessages:[]},async()=> '摘要');
 const messages=[{role:'user' as const,content:'解释一下这个结果'}],signal=new AbortController().signal;
 await expect(manager.prepare(messages,'说明',Object.fromEntries(selection.active(registry).map(name=>[name,registry[name]!])),signal)).resolves.toEqual(messages);
 await expect(manager.prepare(messages,'说明',registry,signal)).rejects.toThrow('无法留出任务工作空间');
});
