import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {backupProject, seedContent} from '../../harness/lib/ops.mjs';

test('seed contract passes staged media map and site data as explicit arguments', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-seed-'));
  mkdirSync(join(root, 'scripts'), {recursive: true});
  mkdirSync(join(root, 'content'), {recursive: true});
  writeFileSync(join(root, 'scripts/seed.php'), '<?php if (!defined("ABSPATH")) exit("CLI only");');
  writeFileSync(join(root, 'content/site-data.json'), '{}');
  writeFileSync(join(root, 'content/media-map.json'), '{}');
  const wpCalls = [];
  const runCommands = [];
  const ssh = {
    run: (command, options = {}) => {
      runCommands.push({command, hasInput: Boolean(options.input)});
      return Buffer.alloc(0);
    },
    wp: args => {
      wpCalls.push(args);
      return args[0] === 'eval-file' ? '{"result":"ok"}\n' : '';
    },
  };
  const project = {
    slug: 'demo',
    seed: {enabled: true, script: 'scripts/seed.php', data: 'content/site-data.json'},
  };
  try {
    await seedContent(root, project, ssh);
    const invocation = wpCalls.find(args => args[0] === 'eval-file');
    assert.match(invocation[1], /\/tmp\/demo-seed\/seed\.php$/);
    assert.match(invocation[2], /\/tmp\/demo-seed\/media-map\.json$/);
    assert.match(invocation[3], /\/tmp\/demo-seed\/site-data\.json$/);
    assert.ok(runCommands.some(item => item.hasInput));
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('backup retries a fresh installation whose plugin files change during tar', () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-backup-'));
  const buffer = Buffer.from('archive');
  const runCommands = [];
  const ssh = {
    run: command => {
      runCommands.push(command);
      if (command.includes('tar -cf -')) {
        if (runCommands.filter(item => item.includes('tar -cf -')).length === 1) {
          throw new Error('Command failed: tar: plugins: file changed as we read it');
        }
        return buffer;
      }
      return buffer;
    },
  };
  const project = {domain: 'demo.test', ssh: {wpPath: '/tmp/wp'}};
  try {
    const result = backupProject(root, project, ssh);
    assert.equal(result.manifest.files.size, buffer.length);
    assert.equal(runCommands.filter(item => item.includes('tar -cf -')).length, 2);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
