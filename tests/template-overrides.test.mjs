import test from 'node:test';
import assert from 'node:assert/strict';
import {validateChangedPaths} from '../examples/b2b-block-starter/scripts/release/overrides.mjs';
test('template preflight rejects traversal, non-template files and malformed inputs',()=>{
 for(const input of [null,{},['../theme.json'],['templates/../../wp-config.php'],['style.css'],['templates/a.html\n'],[2]])assert.throws(()=>validateChangedPaths(input));
 assert.deepEqual(validateChangedPaths(['theme.json','parts/header.html','templates/product-standard.html','theme.json']),['theme.json','parts/header.html','templates/product-standard.html']);
});
