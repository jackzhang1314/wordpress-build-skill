import test from 'node:test';
import assert from 'node:assert/strict';
import {restOverridesToPaths} from '../scripts/hostinger/remote-preflight.mjs';
test('REST override items map to paths only for published custom rows',()=>{
 const items=[
  {type:'wp_template',id:'b2b-equipment//page',source:'theme',origin:null,status:'publish'},
  {type:'wp_template',id:'b2b-equipment//product-standard',source:'custom',origin:'theme',status:'publish'},
  {type:'wp_template',id:'b2b-equipment//harness-draft',source:'custom',origin:null,status:'draft'},
  {type:'wp_template_part',id:'b2b-equipment//header',source:'custom',origin:'theme',status:'publish'},
  {type:'wp_global_styles',id:'b2b-equipment',source:'custom',status:'publish'},
 ];
 assert.deepEqual(restOverridesToPaths(items),['parts/header.html','templates/product-standard.html','theme.json']);
 for(const bad of [[{type:'wp_template',id:'no-slash',source:'custom',status:'publish'}]])assert.throws(()=>restOverridesToPaths(bad));
});
