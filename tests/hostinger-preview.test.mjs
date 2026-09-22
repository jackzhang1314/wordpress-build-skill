import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPreview,checkPreview} from '../scripts/hostinger/check-preview.mjs';
const good={status:200,url:'https://site.test/',expectedUrl:'https://site.test/',html:'<title>HONGDA</title>',cacheControl:'no-store, no-cache, max-age=0',expectedMarker:'HONGDA'};
test('preview gate rejects the default WordPress page even with HTTP 200',()=>{
 assert.equal(assessPreview({...good,html:'WordPress AI Preview Hello world!'}).pass,false);
 assert.equal(assessPreview(good).pass,true);
});
test('preview gate rejects long-lived HTML and cache-busting or cross-origin redirects',()=>{
 for(const cacheControl of ['', 'public, max-age=604800','no-cache','x-no-store'])assert.equal(assessPreview({...good,cacheControl}).pass,false);
 for(const url of ['https://site.test/?deployment=1','https://other.test/','https://site.test/old/'])assert.equal(assessPreview({...good,url}).pass,false);
 assert.equal(assessPreview({...good,cacheControl:'NO-STORE, max-age=0'}).pass,true);
});
test('preview gate refuses query-string substitutes before fetching',async()=>{
 await assert.rejects(checkPreview('https://site.test/?deployment=1','HONGDA'),/without query/);
 await assert.rejects(checkPreview('https://site.test/','HONGDA',['/?deployment=1']),/without query/);
 await assert.rejects(checkPreview('https://site.test/',''),/marker/);
});
