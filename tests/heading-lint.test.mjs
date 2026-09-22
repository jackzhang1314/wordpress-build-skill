import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {lintHeadings} from '../examples/b2b-block-starter/scripts/heading-lint.mjs';
async function theme(root,files){
 for(const [path,data] of Object.entries(files)){
  await mkdir(join(root,path,'..'),{recursive:true});
  await writeFile(join(root,path),data);
 }
}
test('heading lint composes parts/patterns and flags level skips',async()=>{
 const root=await mkdtemp(join(tmpdir(),'headings-'));
 try{
  await theme(root,{
   'templates/index.html':'<!-- wp:template-part {"slug":"header"} /--><!-- wp:query-title {"type":"archive"} /--><!-- wp:pattern {"slug":"demo/list"} /-->',
   'parts/header.html':'<!-- wp:paragraph --><p>site header</p><!-- /wp:paragraph -->',
   'patterns/list.php':'<?php /** * Slug: demo/list */ ?><!-- wp:post-title {"level":3,"isLink":true} /-->',
  });
  const report=await lintHeadings(root);
  assert.equal(report.templates,1);
  assert.equal(report.violations.length,1);
  assert.equal(report.violations[0].level,3);
  assert.equal(report.violations[0].previousLevel,1);
  assert.match(report.violations[0].source,/pattern:demo\/list/);
  assert.equal(report.releaseApproval,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('query loop at default h2 after h1 passes; same-level and decreases pass',async()=>{
 const root=await mkdtemp(join(tmpdir(),'headings-ok-'));
 try{
  await theme(root,{
   'templates/archive.html':'<!-- wp:query-title {"type":"archive"} /--><!-- wp:post-title /--><!-- wp:heading {"level":2} --><h2>section</h2><!-- /wp:heading --><!-- wp:post-title {"level":2} /-->',
   'templates/page.html':'<!-- wp:heading {"level":1} --><h1>title</h1><!-- /wp:heading --><!-- wp:heading {"level":2} --><h2>s</h2><!-- /wp:heading --><!-- wp:heading {"level":2} --><h2>t</h2><!-- /wp:heading -->',
  });
  const report=await lintHeadings(root);
  assert.deepEqual(report.violations,[]);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('unresolvable pattern reference is an error, not a pass',async()=>{
 const root=await mkdtemp(join(tmpdir(),'headings-miss-'));
 try{
  await theme(root,{'templates/index.html':'<!-- wp:pattern {"slug":"demo/missing"} /-->'});
  await assert.rejects(()=>lintHeadings(root),/Pattern not found: demo\/missing/);
 }finally{await rm(root,{recursive:true,force:true});}
});
