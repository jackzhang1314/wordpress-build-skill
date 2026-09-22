import test from 'node:test';
import assert from 'node:assert/strict';
import {collectAssets,validAsset} from '../scripts/hostinger/check-assets.mjs';
test('deployment asset check follows local styles, scripts and srcset without crawling navigation or external origins',()=>{
 const urls=collectAssets(`<link href="/theme.css?v=1&amp;x=2"><script src='/site.js'></script><img src='/one.jpg' srcset='/one.jpg 400w, /two.webp 800w'><a href='/equipment/'>Products</a><img src='https://external.test/image.jpg'>`,'https://site.test/products/');
 assert.deepEqual(urls,['https://site.test/one.jpg','https://site.test/site.js','https://site.test/theme.css?v=1&x=2','https://site.test/two.webp']);
});
test('deployment rejects missing assets and HTML fallback disguised as HTTP 200',()=>{
 assert.equal(validAsset('https://site.test/theme.css',404,'text/html'),false);
 assert.equal(validAsset('https://site.test/theme.css',200,'text/html'),false);
 assert.equal(validAsset('https://site.test/theme.css',200,'text/css; charset=utf-8'),true);
 assert.equal(validAsset('https://site.test/site.js',200,'application/javascript'),true);
 assert.equal(validAsset('https://site.test/photo.jpg',200,'text/html'),false);
 assert.equal(validAsset('https://site.test/photo.jpg',200,'image/jpeg'),true);
});
