import {z} from 'zod';
export type WpProbe={status:'available';data:unknown}|{status:'unknown';httpStatus:number};
export type WpProbeReader=(path:string,method?:'GET'|'OPTIONS')=>Promise<WpProbe>;
const record=z.record(z.string(),z.unknown());
const segment=z.string().regex(/^[a-z][a-z0-9_-]{0,79}$/);
const hidden=new Set(['attachment','wp_block','wp_template','wp_template_part','wp_navigation','wp_font_family','wp_font_face']);
const forbiddenBases=new Set(['users','settings','plugins','themes','media','blocks','templates','template-parts','navigation']);
export const wpAssessmentSchema=z.object({contentTypes:z.array(segment).min(1).max(8).optional()});
const obj=(v:unknown)=>{const parsed=record.safeParse(v);return parsed.success?parsed.data:undefined;};
function fields(v:unknown){const properties=obj(obj(v)?.properties);return properties?Object.entries(properties).filter(([name])=>name.length<=160).slice(0,12).map(([name,definition])=>({name,type:typeof obj(definition)?.type==='string'?String(obj(definition)?.type).slice(0,40):undefined,readOnly:obj(definition)?.readOnly===true})):undefined;}
/** Read-only eligibility signals, not proof of a successful mutation or frontend rendering. */
export async function assessWpContent(read:WpProbeReader,requested?:string[]){
 const [account,types]=await Promise.all([read('/wp/v2/users/me?context=edit&_fields=id,capabilities'),read('/wp/v2/types?context=edit')]);
 const caps=account.status==='available'?obj(obj(account.data)?.capabilities):undefined;
 const permission=(name:unknown):boolean|null=>typeof name==='string'&&typeof caps?.[name]==='boolean'?caps[name]:null;
 const all=types.status==='available'?obj(types.data):undefined;
 const names=[...new Set(requested??['page','post',...Object.keys(all??{}).filter(name=>segment.safeParse(name).success&&!hidden.has(name)&&!name.startsWith('wp_'))])].slice(0,8);
 const schemas:Record<string,WpProbe|{status:'not_requested'}>={};
 const contentTypes=await Promise.all(names.map(async name=>{
  const declaration=obj(all?.[name]);const base=segment.safeParse(declaration?.rest_base);
  const compatible=!!declaration&&base.success&&!forbiddenBases.has(base.data)&&(declaration.rest_namespace===undefined||declaration.rest_namespace==='wp/v2')&&!hidden.has(name);
  const declaredCaps=obj(declaration?.capabilities);
  const createPermission=permission(declaredCaps?.create_posts),publishPermission=permission(declaredCaps?.publish_posts);
  const schema:WpProbe|{status:'not_requested'}=compatible?await read(`/wp/v2/${base.data}`,'OPTIONS'):{status:'not_requested'};schemas[name]=schema;
  const properties=schema.status==='available'?obj(obj(obj(schema.data)?.schema)?.properties):undefined;
  const acf=fields(properties?.acf),meta=fields(properties?.meta);
  const hasWritableAcf=obj(properties?.acf)?.readOnly!==true&&Object.values(obj(obj(properties?.acf)?.properties)??{}).some(field=>obj(field)&&obj(field)?.readOnly!==true);
  const writeTool=['page','post','oct_product','oct_case'].includes(name)?'wpWriteContent':hasWritableAcf?'wpImportProducts':null;
  const template=obj(properties?.template)?.enum;
  const templates=Array.isArray(template)?template.filter((v):v is string=>typeof v==='string').slice(0,50):undefined;
  const status=!declaration?'unknown':!compatible?'connector_not_supported':createPermission===false?'permission_required':!writeTool?'tool_not_supported':createPermission===true&&(writeTool==='wpImportProducts'||obj(properties?.content)&&obj(properties?.content)?.readOnly!==true)?'ready_to_attempt_draft':'needs_verification';
  const nextStep=status==='ready_to_attempt_draft'?(writeTool==='wpImportProducts'?'读取字段证据并预览CSV映射，再分批创建草稿。':'复用现有模板编译页面，先创建草稿并回读。'):status==='permission_required'?'请站点管理员授予此内容类型的创建权限。':status==='tool_not_supported'?'保留现有模型；当前工具没有此类型的写入适配，先生成内容方案。':status==='connector_not_supported'?'该类型的命名空间或端点未适配，保留站点配置并报告缺口。':'继续核对账号权限和实际schema，不把未知项判断为可写。';
  return {name,label:typeof declaration?.name==='string'?declaration.name.slice(0,200):name,restBase:base.success?base.data:undefined,namespace:typeof declaration?.rest_namespace==='string'?declaration.rest_namespace.slice(0,100):undefined,createPermission,publishPermission,schemaStatus:schema.status,contentFieldExposed:properties?.content!==undefined,acfFields:acf,metaFields:meta,templates,templateSelection:templates?'declared_choices':'default_only',status,writeTool:compatible?writeTool:null,nextStep};
 }));
 return {raw:{account,types,schemas},summary:{accountStatus:account.status,typesStatus:types.status,uploadPermission:permission('upload_files'),contentTypes,
  coverage:{scanned:names,discovered:all?Object.keys(all).length:null,limit:8,fieldLimit:12,templateLimit:50},
  frontendStatus:'needs_preview' as const,notes:['权限值来自当前账号与类型声明；OPTIONS存在不证明可写，站点执行时仍可能拒绝。','字段公开不证明当前模板展示或动态绑定；保存草稿后必须检查真实页面。','没有模板枚举时当前写工具须省略template，沿用默认/已有模板；不能自行猜测模板标识。','普通建页不需要配套插件；复用用户现有主题和内容模型。']}};
}
