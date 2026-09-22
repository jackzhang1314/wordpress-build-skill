import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtempSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkRoute, assertInside } from '../scripts/deploy-lab.mjs';

test('deployment smoke rejects HTTP failure and stalled routes', async () => {
  const server = createServer((req, res) => {
    if (req.url === '/stall') return;
    res.writeHead(req.url === '/ok' ? 200 : 500); res.end('fixture');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal(await checkRoute(base + '/ok'), 200);
    await assert.rejects(checkRoute(base + '/bad'), /HTTP 500/);
    await assert.rejects(checkRoute(base + '/stall', 50), /timed out/);
  } finally { server.closeAllConnections(); server.close(); }
});
test('single-file deployment rejects a symlink escaping the managed source', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'wp-deploy-'));
  const outside = mkdtempSync(path.join(tmpdir(), 'wp-outside-'));
  try {
    writeFileSync(path.join(root, 'valid.php'), '<?php');
    writeFileSync(path.join(outside, 'secret'), 'not deployable');
    symlinkSync(path.join(outside, 'secret'), path.join(root, 'escape.php'));
    assert.equal(assertInside(path.join(root, 'valid.php'), root), 'valid.php');
    assert.throws(() => assertInside(path.join(root, 'escape.php'), root), /escapes/);
  } finally { rmSync(root, {recursive:true}); rmSync(outside, {recursive:true}); }
});
