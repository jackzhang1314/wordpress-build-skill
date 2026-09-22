import test from 'node:test';
import assert from 'node:assert/strict';
import {chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generatePassword, rotateCredentials, showCredentials} from '../../harness/lib/credentials.mjs';

function makeSite(options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'harness-cred-'));
  const path = join(root, '.wordpress-builder/hostinger-demo.test');
  mkdirSync(path, {recursive: true});
  writeFileSync(join(path, 'wordpress.json'), JSON.stringify({login: 'codexadmin', password: options.oldPassword ?? 'old-secret-123', email: 'admin@demo.test'}));
  chmodSync(join(path, 'wordpress.json'), 0o600);
  const files = {};
  const ssh = {
    run: (command, opts = {}) => {
      const match = command.match(/^cat > (\S+)$/);
      if (match) files[match[1]] = String(opts.input ?? '');
      return '';
    },
    wp: args => {
      if (args[0] === 'user' && args[1] === 'get') return options.userId ?? '7';
      if (args[0] === 'eval-file') {
        const payload = JSON.parse(files[args[2]]);
        options.rotated = payload;
        return JSON.stringify({id: 7});
      }
      throw new Error(`unexpected wp call: ${args.join(' ')}`);
    },
  };
  return {
    root, files, ssh, options,
    cleanup: () => rmSync(root, {recursive: true, force: true}),
    site: {root, project: {domain: 'demo.test'}, ssh},
    filePath: join(path, 'wordpress.json'),
  };
}

test('passwords are crypto-random and unique per call', () => {
  const a = generatePassword();
  const b = generatePassword();
  assert.match(a, /^[A-Za-z0-9_-]{20,}$/);
  assert.notEqual(a, b);
});

test('credentials show reports the handover payload', async () => {
  const env = makeSite();
  try {
    const result = await showCredentials(env.site, []);
    assert.equal(result.login, 'codexadmin');
    assert.equal(result.password, 'old-secret-123');
    assert.equal(result.loginUrl, 'https://demo.test/wp-admin');
  } finally {
    env.cleanup();
  }
});

test('credentials rotate sets a fresh password and keeps the file private', async () => {
  const env = makeSite();
  try {
    const result = await rotateCredentials(env.site, []);
    assert.equal(env.options.rotated.login, 'codexadmin');
    assert.match(env.options.rotated.password, /^[A-Za-z0-9_-]{20,}$/);
    assert.equal(result.password, env.options.rotated.password);
    const saved = JSON.parse(readFileSync(env.filePath, 'utf8'));
    assert.equal(saved.password, result.password);
    assert.equal(statSync(env.filePath).mode & 0o777, 0o600);
  } finally {
    env.cleanup();
  }
});
