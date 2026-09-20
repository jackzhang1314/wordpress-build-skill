import {expect,it} from 'vitest';
import {assessWpContent,type WpProbe,type WpProbeReader} from '../src/agent/connections/wordpress-assessment';
const available=(data:unknown):WpProbe=>({status:'available',data});
const types={page:{rest_base:'pages',rest_namespace:'wp/v2',capabilities:{create_posts:'edit_pages',publish_posts:'publish_pages'}}};
function reader(capabilities:Record<string,boolean>|undefined,definitions:object=types,properties:object={content:{type:'object'},template:{enum:['','landing']}}):WpProbeReader{
 return async(path,method)=>path.includes('users/me')?available({capabilities}):path.includes('/types')?available(definitions):method==='OPTIONS'?available({schema:{properties}}):{status:'unknown',httpStatus:403};
}
it('账号与类型权限对照后才建议尝试草稿，不把OPTIONS存在当授权',async()=>{
 const yes=await assessWpContent(reader({edit_pages:true,publish_pages:false,upload_files:true}),['page']);
 expect(yes.summary.contentTypes[0]).toMatchObject({status:'ready_to_attempt_draft',createPermission:true,publishPermission:false,templates:['','landing']});expect(yes.summary.frontendStatus).toBe('needs_preview');
 expect((await assessWpContent(reader({edit_pages:false}),['page'])).summary.contentTypes[0]?.status).toBe('permission_required');
 expect((await assessWpContent(reader(undefined),['page'])).summary.contentTypes[0]?.status).toBe('needs_verification');
});
it('识别现有ACF导入能力；普通CPT没有写工具时不承诺创建',async()=>{
 const model={machine:{rest_base:'machines',capabilities:{create_posts:'edit_machines'}}};
 expect((await assessWpContent(reader({edit_machines:true},model,{acf:{properties:{size:{type:'string'}}}}),['machine'])).summary.contentTypes[0]).toMatchObject({status:'ready_to_attempt_draft',writeTool:'wpImportProducts'});
 expect((await assessWpContent(reader({edit_machines:true},model),['machine'])).summary.contentTypes[0]?.status).toBe('tool_not_supported');
 expect((await assessWpContent(reader({edit_machines:true},model,{acf:{readOnly:true,properties:{size:{type:'string'}}}}),['machine'])).summary.contentTypes[0]?.writeTool).toBeNull();
});
it('未适配namespace不探测写schema；扫描有上限，缺权限保留unknown',async()=>{
 const paths:string[]=[];const models=Object.fromEntries(Array.from({length:20},(_,i)=>['model'+i,{rest_base:'model'+i,rest_namespace:'vendor/v1'}]));
 const read:WpProbeReader=async(path,method)=>{paths.push(path);expect(method).not.toBe('POST');return path.includes('/types')?available(models):{status:'unknown',httpStatus:403};};
 const result=await assessWpContent(read);expect(result.summary.coverage.scanned).toHaveLength(8);expect(paths).toHaveLength(2);expect(result.summary.uploadPermission).toBeNull();expect(result.summary.contentTypes.find(t=>t.name==='model0')?.status).toBe('connector_not_supported');
});
it('内联字段摘要有界，完整schema保留在证据数据',async()=>{
 const properties=Object.fromEntries(Array.from({length:100},(_,i)=>['field'+i,{type:'string',description:'x'.repeat(1000)}]));
 const result=await assessWpContent(reader({edit_pages:true},types,{content:{},acf:{properties}}),['page']);
 expect(result.summary.contentTypes[0]?.acfFields).toHaveLength(12);expect(JSON.stringify(result.summary).length).toBeLessThan(5000);expect(JSON.stringify(result.raw)).toContain('field99');
});
