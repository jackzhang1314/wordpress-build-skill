// Static heading-hierarchy lint for block themes.
// Composes templates with their parts and patterns in document order, walks the
// heading blocks, and flags any increase of more than one level (WCAG/axe
// heading-order). Core block default levels follow WordPress block sources:
// heading 2, post-title 2 (TT5 query loops rely on the h2 default),
// query-title 1, site-title 1.
import {readFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const DEFAULT_LEVELS={'core/heading':2,'core/post-title':2,'core/query-title':1,'core/site-title':1};
const HEADING_BLOCKS=new Set(Object.keys(DEFAULT_LEVELS));
const stripPhp=markup=>markup.replace(/<\?php[\s\S]*?\?>/g,'');
const parseBlocks=markup=>{
 const blocks=[];
 for(const match of markup.matchAll(/<!--\s*wp:([a-z0-9-]+(?:\/[a-z0-9-]+)*)\s*([\s\S]*?)-->/g)){
  const name=match[1].includes('/')?match[1]:'core/'+match[1];
  let attrs={};
  const brace=match[2]?.match(/\{[\s\S]*\}/);
  if(brace){try{attrs=JSON.parse(brace[0]);}catch{attrs={};}}
  blocks.push({name,attrs});
 }
 return blocks;
};
async function findPatternFile(patternsDir,slug){
 const local=slug.includes('/')?slug.split('/').slice(1).join('/'):slug;
 let entries;
 try{entries=await readdir(patternsDir);}catch{return null;}
 for(const entry of entries){
  const text=await readFile(join(patternsDir,entry),'utf8');
  const declared=/^(?:[ \t]*)\*\s*Slug:\s*(.+)$/m.exec(text)?.[1]?.trim();
  if(declared===slug||entry.replace(/\.(php|html)$/,'')===local)return {file:join(patternsDir,entry),text};
 }
 return null;
}
async function compose(markup,ctx,depth,sequence,source){
 if(depth>8)throw new Error('pattern/part nesting too deep: '+source);
 for(const block of parseBlocks(markup)){
  if(HEADING_BLOCKS.has(block.name)){
   const level=typeof block.attrs.level==='number'?block.attrs.level:DEFAULT_LEVELS[block.name];
   sequence.push({level,block:block.name,source});
  }else if(block.name==='core/template-part'&&block.attrs.slug){
   const file=join(ctx.theme,'parts',block.attrs.slug+'.html');
   await compose(stripPhp(await readFile(file,'utf8')),ctx,depth+1,sequence,source+' > part:'+block.attrs.slug);
  }else if(block.name==='core/pattern'&&block.attrs.slug){
   const found=await findPatternFile(ctx.patternsDir,block.attrs.slug);
   if(!found)throw new Error('Pattern not found: '+block.attrs.slug);
   await compose(stripPhp(found.text),ctx,depth+1,sequence,source+' > pattern:'+block.attrs.slug);
  }
 }
}
export async function lintHeadings(themeDir){
 const ctx={theme:resolve(themeDir),patternsDir:join(resolve(themeDir),'patterns')};
 const templatesDir=join(ctx.theme,'templates');
 const templateFiles=(await readdir(templatesDir)).filter(name=>name.endsWith('.html')).sort();
 const violations=[];
 for(const name of templateFiles){
  const sequence=[];
  await compose(stripPhp(await readFile(join(templatesDir,name),'utf8')),ctx,0,sequence,'templates/'+name);
  let previous=0;
  for(const [index,heading] of sequence.entries()){
   if(previous&&heading.level>previous+1){
    violations.push({template:'templates/'+name,at:index,block:heading.block,level:heading.level,previousLevel:previous,source:heading.source});
   }
   previous=heading.level;
  }
 }
 return {theme:ctx.theme,templates:templateFiles.length,violations,releaseApproval:false};
}
const main=async()=>{
 const themeDir=process.argv[2]??'examples/b2b-block-starter/theme';
 const report=await lintHeadings(themeDir);
 console.log(JSON.stringify(report,null,2));
 if(report.violations.length)process.exitCode=1;
};
if(process.argv[1]&&import.meta.url===(await import('node:url')).pathToFileURL(process.argv[1]).href)await main();
