import {wpAssessmentSchema} from './wordpress-assessment';
import {wpPlanNavigation,wpApplyNavigation,wpPlanNavigationSchema,wpApplyNavigationSchema} from './wordpress-navigation';
import {readWpSite,wpSiteSourceSchema,wpConfigureSite,wpConfigureSiteSchema} from './wordpress-site';
import {wpReadDesignProfile,wpCompilePage,wpCompilePageSchema} from './wordpress-design';
import {tool} from 'ai';
import {z} from 'zod';
import type {ToolHost} from '../tools';
import type {FileRuntime} from '../files/runtime';
import {wpReadSchema,wpRead,wpWriteContentSchema,wpWriteContent,wpMediaSchema,wpUploadMedia,wpAbilityReadSchema,wpReadAbility,wpAbilityWriteSchema,wpWriteAbility,wpImportSchema,wpImportProducts,type WordpressState,type WpContext} from './wordpress-workflows';
export const wordpressWriteTools=['wpWriteContent','wpUploadMedia','wpWriteAbility','wpImportProducts','wpConfigureSite','wpApplyNavigation'] as const;
export function wordpressTools(host:ToolHost,files:FileRuntime,state:WordpressState,persist:()=>Promise<void>){
 const ctx:WpContext={files,state,persist,signal:host.signal,assertActive:host.assertActive};
 const run=<T>(name:string,input:object,action:()=>Promise<T>,write=false)=>host.execute(name,input,async()=>{host.assertActive();return action();},write,false);
 return {
  wpPlanNavigation:tool({description:'预览当前区块主题模板部件中的简单导航替换。templatePart和navigationMarkup须来自wpRead templateParts证据，片段必须唯一；links使用已发布pageId与标签。保留其他原文，ref转为内联导航，影响所有引用该部件的页面。返回固定版本计划，先展示检查再应用。复杂子菜单/绑定不支持。',inputSchema:wpPlanNavigationSchema,execute:v=>run('wpPlanNavigation',v,()=>wpPlanNavigation(v,ctx))}),
  wpApplyNavigation:tool({description:'应用本任务已生成并检查的固定版本导航计划。写前重新核对主题、部件和已发布页面；未知写不重放，写后回读。只改选定导航片段，不更换主题；仍需浏览器确认实际引用页面和手机菜单。',inputSchema:wpApplyNavigationSchema,execute:v=>run('wpApplyNavigation',v,()=>wpApplyNavigation(v,ctx),true)}),
  wpReadSite:tool({description:'读取站点设置revision。普通站点显式source=native使用官方接口，无需插件；source=companion读取可选配套插件版本与模型，旧调用默认companion。两种revision不可混用。',inputSchema:wpSiteSourceSchema,execute:v=>run('wpReadSite',v,()=>readWpSite(ctx.signal,v.source))}),
  wpConfigureSite:tool({description:'配置标题、描述和已发布首页/文章页。source与读取revision一致，普通站点用native无需插件；native只有客户端写前变化检测，仍有并发窗口。写后回读，未知提交不重放。不切换主题。',inputSchema:wpConfigureSiteSchema,execute:v=>run('wpConfigureSite',v,()=>wpConfigureSite(v,ctx),true)}),
  wpReadDesignProfile:tool({description:'读取现有站点主题、原生区块、模板及账号权限，最多检查8种内容类型的正文/ACF/meta schema，返回可尝试草稿、缺权限或未适配的行动方案。完整数据在证据文件。复用用户主题；不要求配套插件，不把API可读当可写。',inputSchema:wpAssessmentSchema,execute:v=>run('wpReadDesignProfile',v,()=>wpReadDesignProfile(ctx,v))}),
  wpCompilePage:tool({description:'将原生区块方案编译为可核验的任务文件；核验深层图片、表单和站点注册区块，读取主题信息，不写站点。之后同一blocks写入草稿并浏览器预览。',inputSchema:wpCompilePageSchema,execute:v=>run('wpCompilePage',v,()=>wpCompilePage(v,ctx))}),
  wpRead:tool({description:'读取WordPress站点能力、内容、媒体、分类、ACF schema或Abilities声明。navigation分页读取导航；templates/templateParts读取模板集合后本地按ID分页，search仅筛选ID。结果保存在证据文件；读取不代表绑定或写入完成。',inputSchema:wpReadSchema,execute:v=>run('wpRead',v,()=>wpRead(v,ctx))}),
  wpWriteContent:tool({description:'创建/更新WordPress原生区块页面、文章或配套插件oct_product/oct_case。业务字段用meta并校验站点schema；产品分类productCategories、案例行业caseIndustries用真实ID。blocks支持heading/paragraph/image/button/section/form/columns/table/faq；section支持颜色、内边距与圆角；嵌套最多3层，列宽合计100%，template须站点schema声明；页面必须blocks，图片用站点媒体ID，form嵌入WPForms。默认草稿，发布须明确目标。返回回读一致性与证据，仍须浏览器验证呈现。',inputSchema:wpWriteContentSchema,execute:v=>run('wpWriteContent',v,()=>wpWriteContent(v,ctx),true)}),
  wpUploadMedia:tool({description:'把任务文件中固定版本的PNG/JPEG/WebP/GIF/PDF原始二进制上传至WordPress；填写标题、alt和caption，返回媒体ID供特色图/图片区块复用。上限10MB，同一任务相同字节与说明复用回执，未知结果不重传。',inputSchema:wpMediaSchema,execute:v=>run('wpUploadMedia',v,()=>wpUploadMedia(v,ctx),true)}),
  wpReadAbility:tool({description:'读取已适配WPForms或Rank Math能力，实时校验站点input_schema，保存完整结果。先wpRead ability看输入；只读工具不能运行写能力。',inputSchema:wpAbilityReadSchema,execute:v=>run('wpReadAbility',v,()=>wpReadAbility(v,ctx))}),
  wpWriteAbility:tool({description:'执行已适配且站点开放的WPForms/Rank Math写能力。输入依据实时schema，写后回读表单/设置并保存证据。表单写开关/商业权限需站点配置；修改站点级索引和链接设置需说明影响。不会执行PHP或任意能力。',inputSchema:wpAbilityWriteSchema,execute:v=>run('wpWriteAbility',v,()=>wpWriteAbility(v,ctx),true)}),
  wpPreviewProducts:tool({description:'验证固定CSV/TSV全部记录的ACF字段映射并保存当前批次预览，不创建产品。Excel先经文件导入转换为CSV；第1条是表头，列下标从0开始；产品键必须唯一。展示并核验计划后才能导入。',inputSchema:wpImportSchema,execute:v=>run('wpPreviewProducts',v,()=>wpImportProducts(v,ctx,false))}),
  wpImportProducts:tool({description:'按照已预览映射分批创建ACF产品草稿，每批最多20条；所有记录先验证，稳定键生成slug，存在同键时停止且不覆盖。特色图列填站点媒体ID，图片须先上传。返回逐行结果与恢复offset；页面展示需实际模板和浏览器检查。',inputSchema:wpImportSchema,execute:v=>run('wpImportProducts',v,()=>wpImportProducts(v,ctx,true),true)}),
  wpWorkflowStatus:tool({description:'列出本任务WordPress写入回执或待核实操作；不访问远端、不重发未知操作。',inputSchema:z.object({}),execute:v=>run('wpWorkflowStatus',v,async()=>({operations:Object.entries(state.wpOperations??{}).map(([id,o])=>({id,submittedAt:o.submittedAt,state:o.receipt?'verified':Object.hasOwn(o,'response')?'needs-readback':'unknown',receipt:o.receipt,response:o.receipt?undefined:o.response}))}))}),
 };
}
