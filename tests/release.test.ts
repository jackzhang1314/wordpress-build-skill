import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { releaseSchema, releasePageFingerprint, verifyReleaseFiles } from '../src/release.js';
import { type Page } from '../src/pages.js';

test('release fingerprint tolerates publication metadata but detects content and template edits', () => {
  const page: Page = {id:1,type:'page',status:'draft',slug:'home',link:'https://example.com/home/',modified_gmt:'a',title:{raw:'Home'},content:{raw:'Reviewed'},template:'',parent:0,featured_media:0};
  assert.equal(releasePageFingerprint(page), releasePageFingerprint({...page,status:'publish',modified_gmt:'b',link:'https://example.com/'}));
  assert.notEqual(releasePageFingerprint(page), releasePageFingerprint({...page,content:{raw:'Unreviewed'}}));
  assert.notEqual(releasePageFingerprint(page), releasePageFingerprint({...page,template:'other'}));
});
test('release rejects failed checks and evidence files changed after review', async () => {
  const dir = await mkdtemp(join(tmpdir(),'wp-release-'));
  const bytes = 'reviewed screenshot fixture';
  await writeFile(join(dir,'proof'),bytes);
  const status = {status:'pass',evidence:'Reviewed in isolated fixture'};
  const evidence = {identity:'a'.repeat(64),planHash:'b'.repeat(64),reviewedAt:new Date().toISOString(),environment:{wordpress:'test',php:'test',theme:'test'},checks:{navigation:status,primaryLinks:status,forms:status,editing:status,responsive:status,visual:status,recovery:status},files:[{path:'proof',sha256:createHash('sha256').update(bytes).digest('hex')}],pages:[{id:1,fingerprint:'c'.repeat(64)}]};
  assert.equal(releaseSchema.safeParse({...evidence,checks:{...evidence.checks,navigation:{...status,status:'fail'}}}).success,false);
  const file=join(dir,'release.json'); await writeFile(file,JSON.stringify(evidence));
  await verifyReleaseFiles(file);
  await writeFile(join(dir,'proof'),'modified');
  await assert.rejects(verifyReleaseFiles(file),/changed/);
});
