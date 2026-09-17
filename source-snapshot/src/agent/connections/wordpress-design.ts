import {assessWpContent,wpAssessmentSchema} from './wordpress-assessment';
import {z} from 'zod';
import {wordpressConnection,WordpressError} from './wordpress';
import {wpToolBlocksSchema,walkWpBlocks} from './wordpress-blocks';
import {resolveBlocks,type WpContext} from './wordpress-workflows';
import {saveSeoEvidence} from './seo-advanced';
const theme=z.object({stylesheet:z.string(),is_block_theme:z.boolean().optional(),name:z.unknown().optional(),theme_supports:z.unknown().optional()});
/** Missing permissions are unknown capabilities, never evidence that a feature is absent. */
export async function wpReadDesignProfile(ctx:WpContext,raw:z.input<typeof wpAssessmentSchema>={}){
 const input=wpAssessmentSchema.parse(raw);
 const c=await wordpressConnection();
 const read=async(path:string,method:'GET'|'OPTIONS'='GET')=>{try{return {status:'available' as const,data:await c.api(path,ctx.signal,method)};}catch(error){if(!(error instanceof WordpressError))throw error;return {status:'unknown' as const,httpStatus:error.status};}};
 const [themes,blocks,pages]=await Promise.all([read('/wp/v2/themes?status=active'),read('/wp/v2/block-types/core?context=edit'),read('/wp/v2/pages','OPTIONS')]);
 const active=themes.status==='available'?z.array(theme).parse(themes.data).find(t=>t.stylesheet):undefined;
 // A nested/custom stylesheet name is explicitly not probed by the current path adapter.
 const styles=active&&/^[a-zA-Z0-9_-]+$/.test(active.stylesheet)?await read(`/wp/v2/global-styles/themes/${active.stylesheet}`):{status:'unknown' as const};
 const cms=await assessWpContent((path,method)=>path==='/wp/v2/pages'&&method==='OPTIONS'?Promise.resolve(pages):read(path,method),input.contentTypes);
 const result={site:c.site,checkedAt:new Date().toISOString(),activeTheme:active,themes,blocks,pages,cms:cms.raw,adaptation:cms.summary,themeStyles:styles,coverage:'主题提供的样式；不包含用户全局样式覆盖，也不证明编辑器上下文允许所有注册区块。权限不足标记unknown；现有主题不会被切换。'};
 const registered=blocks.status==='available'?z.array(z.object({name:z.string()})).parse(blocks.data).map(b=>b.name):undefined;
 return {site:c.site,checkedAt:result.checkedAt,activeTheme:active?{stylesheet:active.stylesheet,is_block_theme:active.is_block_theme,name:active.name}:undefined,
  themes:themes.status==='unknown'?themes:{status:themes.status},blocks:{status:blocks.status,names:registered},pages:{status:pages.status},themeStyles:{status:styles.status},coverage:result.coverage,adaptation:cms.summary,
  evidence:await saveSeoEvidence(ctx.files,'wordpress-design-profile',result,ctx.assertActive)};
}
export const wpCompilePageSchema=z.object({title:z.string().min(1).max(200),blocks:wpToolBlocksSchema});
export async function wpCompilePage(raw:z.input<typeof wpCompilePageSchema>,ctx:WpContext){
 const v=wpCompilePageSchema.parse(raw),c=await wordpressConnection();
 const content=await resolveBlocks(v.blocks,ctx.signal);
 const profile=await wpReadDesignProfile(ctx);
 const names:Record<string,string>={section:'group',columns:'columns',faq:'details',form:'shortcode',catalog:'query'};
 const required=new Set<string>();
 for(const node of walkWpBlocks(v.blocks)){required.add(`core/${names[node.type]??node.type}`);if(node.type==='catalog')for(const name of ['post-template','post-title','post-excerpt','query-pagination','query-pagination-previous','query-pagination-numbers','query-pagination-next'])required.add(`core/${name}`);if(node.type==='columns')required.add('core/column');if(node.type==='button')required.add('core/buttons');if(node.type==='faq')required.add('core/paragraph');}
 const registered=profile.blocks.names;
 const missing=registered?[...required].filter(name=>!registered.includes(name)):[];
 if(missing.length)throw new Error(`站点未注册必要区块：${missing.join('、')}`);
 const result={site:c.site,title:v.title,blocks:v.blocks,content,requiredBlocks:[...required],registrationChecked:registered!==undefined,frontendVerified:false,designEvidence:profile.evidence,note:'编译计划不写站点。用同一blocks调用wpWriteContent；保存草稿后必须打开真实预览检查。'};
 return {title:v.title,requiredBlocks:[...required],registrationChecked:registered!==undefined,frontendVerified:false,evidence:await saveSeoEvidence(ctx.files,'wordpress-page-plan',result,ctx.assertActive)};
}
