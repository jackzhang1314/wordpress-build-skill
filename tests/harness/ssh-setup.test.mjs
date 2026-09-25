import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {readFileSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
  deriveSshDefaults, discoverHostingerWebsite, ensureSshKey, setupProjectSsh, writeProjectSsh,
} from '../../harness/lib/ssh-setup.mjs';

test('hostinger website discovery selects exact domain and exposes only SSH fields', () => {
  const website = discoverHostingerWebsite('site.test', {
    exec: () => JSON.stringify({data: [
      {domain: 'parent.test', username: 'parent-user', order_id: 1},
      {domain: 'site.test', username: 'site-user', order_id: 2},
    ]}),
  });
  assert.deepEqual(website, {domain: 'site.test', user: 'site-user', orderId: 2});
});

test('ssh defaults combine DNS and Hostinger website data without overwriting explicit settings', async () => {
  const defaults = await deriveSshDefaults(
    {domain: 'site.test', ssh: {user: 'explicit-user', port: '65003'}, hostinger: {order: 9}},
    {lookup: async () => [{address: '203.0.113.10'}], discover: () => ({domain: 'site.test', user: 'hostinger-user', orderId: 2})},
  );
  assert.deepEqual(defaults, {host: '203.0.113.10', user: 'explicit-user', port: '65003', orderId: 9});
});

test('writeProjectSsh changes only SSH configuration fields', () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-project-'));
  writeFileSync(join(root, 'project.json'), JSON.stringify({title: 'Site', slug: 'site', custom: 'keep'}, null, 2));
  const project = {domain: 'site.test', slug: 'site', title: 'Site', custom: 'keep'};
  const updated = writeProjectSsh(root, project, {
    host: '203.0.113.10', port: '65002', user: 'site-user', keyPath: '/keys/id_ed25519', wpPath: '/home/site-user/domains/site.test/public_html',
  });
  assert.equal(updated.custom, 'keep');
  assert.equal(updated.ssh.host, '203.0.113.10');
  assert.equal(updated.hostinger.user, 'site-user');
});

test('ssh setup reuses an existing key, persists settings, and verifies SSH/WP-CLI', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-ssh-ready-'));
  try {
    await writeFile(join(root, 'project.json'), JSON.stringify({title: 'Site', slug: 'site', domain: 'site.test', brand: 'keep'}, null, 2));
    const key = join(root, 'id_ed25519');
    await writeFile(key, 'private-test', {mode: 0o600});
    await writeFile(`${key}.pub`, 'ssh-ed25519 AAA public');
    const commands = [];
    const report = await setupProjectSsh(root, JSON.parse(await readFile(join(root, 'project.json'), 'utf8')), ['--ssh-key', key], {
      exec: (name, args) => {
        commands.push([name, args]);
        if (name === 'ssh-keygen') throw new Error('must reuse existing key');
        if (args?.join(' ').includes('core version')) return '6.8';
        return '6.8';
      },
      lookup: async () => [{address: '203.0.113.10'}],
      discover: () => ({domain: 'site.test', user: 'site-user', orderId: 2}),
      logger: () => {},
    });
    assert.equal(report.pass, true);
    assert.equal(report.connected, true);
    assert.equal(report.wpVersion, '6.8');
    assert.equal(report.ssh.host, '203.0.113.10');
    assert.equal(report.ssh.user, 'site-user');
    const saved = JSON.parse(await readFile(join(root, 'project.json'), 'utf8'));
    assert.equal(saved.brand, 'keep');
    assert.equal(saved.ssh.keyPath, key);
    assert.ok(commands.some(([name, args]) => name === 'ssh' && args.join(' ').includes('echo ok')));
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('ssh setup returns key onboarding instructions when the server rejects it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-ssh-action-'));
  try {
    await writeFile(join(root, 'project.json'), JSON.stringify({title: 'Site', slug: 'site', domain: 'site.test'}, null, 2));
    const key = join(root, 'id_ed25519');
    await writeFile(key, 'private-test', {mode: 0o600});
    await writeFile(`${key}.pub`, 'ssh-ed25519 AAA public');
    const logs = [];
    const report = await setupProjectSsh(root, JSON.parse(await readFile(join(root, 'project.json'), 'utf8')), ['--ssh-key', key], {
      exec: (name) => {
        if (name === 'ssh') throw new Error('Permission denied (publickey)');
        return name === 'wp' ? '6.8' : '';
      },
      lookup: async () => [{address: '203.0.113.10'}],
      discover: () => ({domain: 'site.test', user: 'site-user'}),
      logger: item => logs.push(item),
    });
    assert.equal(report.pass, false);
    assert.equal(report.connected, false);
    assert.match(report.url, /hpanel\.hostinger\.com/);
    assert.ok(logs.some(item => item.includes('ACTION REQUIRED')));
    assert.ok(logs.some(item => item.includes('ssh-ed25519 AAA public')));
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('ensureSshKey rotates a managed key without deleting its backup', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-key-'));
  try {
    const key = join(root, 'id_ed25519');
    await writeFile(key, 'old-private');
    await writeFile(`${key}.pub`, 'old-public');
    const result = ensureSshKey({slug: 'site'}, key, {
      exec: undefined,
      rotateKey: true,
    });
    assert.match(result.publicKey, /^ssh-ed25519 /);
    assert.equal(readFileSync(key, 'utf8') === 'old-private', false);
    const backups = readdirSync(root).filter(name => name.startsWith('id_ed25519.') && name.endsWith('.bak'));
    assert.equal(backups.length > 0, true);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
