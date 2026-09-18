// Adapted from source-snapshot/src/agent/connections/wordpress-blocks.ts.
// 2026-09-08: Codex page references; unresolved references rejected at serialization.
import {z} from 'zod';
const text=z.string().min(1).max(12000);
export const wpLink=z.string().max(2000).refine(value=>{if(/^page:[a-z][a-z0-9-]*$/.test(value))return true;try{const url=new URL(value);return !url.username&&!url.password&&/^(https?:|mailto:|tel:)$/.test(url.protocol);}catch{return /^#[A-Za-z0-9_-]+$/.test(value);}},'链接仅支持HTTP(S)、邮件、电话、页内锚点或page:key。');
const leaf=z.discriminatedUnion('type',[
 z.object({type:z.literal('heading'),text,level:z.number().int().min(2).max(6).default(2)}),
 z.object({type:z.literal('paragraph'),text}),
 z.object({type:z.literal('meta'),key:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),fallback:text}),
 z.object({type:z.literal('image'),mediaId:z.number().int().positive(),alt:z.string().max(500).default('')}),
 z.object({type:z.literal('button'),text:text.max(200),url:wpLink}),
 z.object({type:z.literal('form'),formId:z.number().int().positive()}),
 z.object({type:z.literal('table'),rows:z.array(z.array(text).min(1).max(12)).min(1).max(40)}),
 z.object({type:z.literal('faq'),question:text,answer:text}),
 z.object({type:z.literal('catalog'),postType:z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/),perPage:z.number().int().min(1).max(24).default(9)}),
]);
const sectionStyle=z.object({
 background:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
 color:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
 padding:z.number().int().min(0).max(160).optional(),
 radius:z.number().int().min(0).max(80).optional(),
}).strict();
type WpLeaf=z.infer<typeof leaf>;
export type WpNode=WpLeaf|{type:'section';children:WpNode[];style?:z.infer<typeof sectionStyle>}|{type:'columns';columns:{width?:number;children:WpNode[]}[]};
// Finite schema: no recursive JSON Schema references required by model providers.
function nodeSchema(depth:number):z.ZodType<WpNode>{
 if(depth===0)return leaf;
 const children=z.array(nodeSchema(depth-1)).min(1).max(30);
 return z.union([leaf,z.object({type:z.literal('section'),children,style:sectionStyle.optional()}),z.object({type:z.literal('columns'),columns:z.array(z.object({width:z.number().int().min(10).max(90).optional(),children})).min(2).max(4)})]);
}
export function* walkWpBlocks(nodes:readonly WpNode[]):Generator<WpNode>{for(const node of nodes){yield node;if(node.type==='section')yield* walkWpBlocks(node.children);if(node.type==='columns')for(const column of node.columns)yield* walkWpBlocks(column.children);}}
export const wpBlocksSchema=z.array(nodeSchema(3)).min(1).max(100).superRefine((nodes,ctx)=>{
 if([...walkWpBlocks(nodes)].length>300)ctx.addIssue({code:'custom',message:'页面最多300个区块节点。'});
 for(const node of walkWpBlocks(nodes)){
  if(node.type==='columns'&&node.columns.some(c=>c.width!==undefined)&&(!node.columns.every(c=>c.width!==undefined)||node.columns.reduce((sum,c)=>sum+(c.width??0),0)!==100))ctx.addIssue({code:'custom',message:'自定义列宽必须全部指定，合计100%。'});
  if(node.type==='table'&&node.rows.some(row=>row.length!==node.rows[0]?.length))ctx.addIssue({code:'custom',message:'表格每行列数必须一致。'});
 }
});
export type WpBlocks=WpNode[];
export const escapeHtml=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const attrs=(v:object)=>JSON.stringify(v).replaceAll('--','\\u002d\\u002d').replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
function block(name:string,attributes:object|undefined,body:string){return `<!-- wp:${name}${attributes?' '+attrs(attributes):''} -->\n${body}\n<!-- /wp:${name} -->`;}
/** A bounded core-block vocabulary. No raw HTML/code blocks or third-party layout metadata. */
export function serializeWpBlocks(raw:WpBlocks,media:ReadonlyMap<number,string>):string{
 const nodes=wpBlocksSchema.parse(raw);let queryId=0;
 const render=(node:WpBlocks[number]):string=>{
  switch(node.type){
   case 'heading':return block('heading',node.level===2?undefined:{level:node.level},`<h${node.level} class="wp-block-heading">${escapeHtml(node.text)}</h${node.level}>`);
   case 'paragraph':return block('paragraph',undefined,`<p>${escapeHtml(node.text).replaceAll('\n','<br>')}</p>`);
   case 'meta':return block('paragraph',{metadata:{bindings:{content:{source:'core/post-meta',args:{key:node.key}}}}},`<p>${escapeHtml(node.fallback)}</p>`);
   case 'image':{const url=media.get(node.mediaId);if(!url)throw new Error(`请先核验媒体 ${node.mediaId}`);return block('image',{id:node.mediaId,sizeSlug:'full',linkDestination:'none'},`<figure class="wp-block-image size-full"><img src="${escapeHtml(url)}" alt="${escapeHtml(node.alt)}" class="wp-image-${node.mediaId}"/></figure>`);}
   case 'button':if(node.url.startsWith('page:'))throw new Error('Resolve page references before serialization.');return block('buttons',undefined,`<div class="wp-block-buttons">${block('button',undefined,`<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${escapeHtml(node.url)}">${escapeHtml(node.text)}</a></div>`)}</div>`);
   case 'form':return block('shortcode',undefined,`[wpforms id="${node.formId}"]`);
   case 'catalog':return block('query',{queryId:++queryId,query:{perPage:node.perPage,pages:0,offset:0,postType:node.postType,order:'desc',orderBy:'date',author:'',search:'',exclude:[],sticky:'',inherit:false}},`<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-featured-image {"isLink":true} /-->
<!-- wp:post-title {"isLink":true,"level":2} /-->
<!-- wp:post-excerpt /-->
<!-- /wp:post-template -->
<!-- wp:query-pagination -->
<!-- wp:query-pagination-previous /-->
<!-- wp:query-pagination-numbers /-->
<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination --></div>`);
   case 'table':return block('table',undefined,`<figure class="wp-block-table"><table class="has-fixed-layout"><tbody>${node.rows.map(row=>`<tr>${row.map(cell=>`<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>`);
   case 'faq':return block('details',undefined,`<details class="wp-block-details"><summary>${escapeHtml(node.question)}</summary>${block('paragraph',undefined,`<p>${escapeHtml(node.answer).replaceAll('\n','<br>')}</p>`)}</details>`);
   case 'columns':return block('columns',undefined,`<div class="wp-block-columns">${node.columns.map(column=>block('column',column.width===undefined?undefined:{width:`${column.width}%`},`<div class="wp-block-column"${column.width===undefined?'':` style="flex-basis:${column.width}%"`}>${column.children.map(render).join('\n\n')}</div>`)).join('\n\n')}</div>`);
   case 'section':{
    const s=node.style,style:Record<string,unknown>={},css:string[]=[],classes=['wp-block-group'];
    if(s?.radius!==undefined){style.border={radius:`${s.radius}px`};css.push(`border-radius:${s.radius}px`);}
    if(s?.color||s?.background){style.color={...(s.color?{text:s.color}:{}),...(s.background?{background:s.background}:{})};if(s.color){classes.push('has-text-color');css.push(`color:${s.color}`);}if(s.background){classes.push('has-background');css.push(`background-color:${s.background}`);}}
    if(s?.padding!==undefined){style.spacing={padding:Object.fromEntries(['top','right','bottom','left'].map(side=>[side,`${s.padding}px`]))};for(const side of ['top','right','bottom','left'])css.push(`padding-${side}:${s.padding}px`);}
    return block('group',Object.keys(style).length?{style}:undefined,`<div class="${classes.join(' ')}"${css.length?` style="${css.join(';')}"`:''}>${node.children.map(render).join('\n\n')}</div>`);
   }
  }
 };
 const result=nodes.map(render).join('\n\n');if(result.length>120000)throw new Error('区块页面过大，请拆分页面。');return result;
}

/** Compact transport schema; full validation still runs before any remote operation. */
export const wpToolBlocksSchema=z.array(z.record(z.string(),z.unknown())).min(1).max(100).describe('原生区块JSON；具体结构见建页Skill的assets/patterns.json。支持heading/paragraph/image/button/form/section/columns/table/faq/catalog。').transform((value,ctx)=>{const parsed=wpBlocksSchema.safeParse(value);if(parsed.success)return parsed.data;for(const issue of parsed.error.issues)ctx.issues.push({code:'custom',input:value,path:issue.path,message:issue.message});return z.NEVER;});
