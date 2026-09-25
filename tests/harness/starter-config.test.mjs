import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {loadProject} from '../../harness/lib/config.mjs';

const starterRoot = fileURLToPath(new URL('../../examples/classic-b2b-starter', import.meta.url));

test('starter example config is directly readable for local gates but marked non-deployable', () => {
  const project = loadProject(starterRoot);
  assert.equal(project._isExample, true);
  assert.equal(project.livePages.length, 24);
  assert.equal(project.ssh.host, 'REPLACE_SSH_HOST');
  assert.match(project.ssh.keyPath, /~\/\.ssh\/hostinger-REPLACE_SSH_USER_ed25519$/);
});
