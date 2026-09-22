import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('templates assigned to content pages must render the editable page body',async()=>{
 for(const slug of ['page','company','enquiry','front-page','single','single-hd_solution','product-standard','product-editorial']){
  const template=await readFile(`examples/b2b-block-starter/theme/templates/${slug}.html`,'utf8');
  assert.match(template,/<!-- wp:post-content(?:\s|\/)/,slug+' discards saved editor content');
 }
});
