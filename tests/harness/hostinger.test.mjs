import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {listHostingerWebsites, provisionHostinger, updateProvisionedProject} from '../../harness/lib/hostinger.mjs';

function fakeHostinger(domain, order) {
  return (command, args) => {
    const joined = args.join(' ');
    if (joined.includes('websites list')) {
      return JSON.stringify({data: [{domain, username: 'u_test'}]});
    }
    if (joined.includes('installations list')) {
      return JSON.stringify([{domain, is_valid: true}]);
    }
    return {message: 'Request accepted', order};
  };
}

test('sites list normalizes Hostinger websites', () => {
  const execFile = (command, args) => {
    assert.equal(command, 'hostinger');
    assert.match(args.join(' '), /hosting websites list/);
    return JSON.stringify({data: [{
      domain: 'demo-123.hostingersite.com',
      username: 'u_test',
      order_id: 42,
      is_enabled: true,
      website_type: 'wordpress',
      root_directory: '/home/u_test/demo',
    }]});
  };
  const websites = listHostingerWebsites(execFile);
  assert.equal(websites.length, 1);
  assert.equal(websites[0].domain, 'demo-123.hostingersite.com');
});

test('provision is idempotent when website and WordPress already exist', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model', hostinger: {user: '', order: 42}, ssh: {host: 'ssh.example.test', port: '65002', user: 'u_test', keyPath: 'key', wpPath: '/tmp/old'}}));
  try {
    const result = await provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), ['--domain', 'demo-123.hostingersite.com'], {
      execFile: fakeHostinger('demo-123.hostingersite.com', 42),
      intervalMs: 1,
    });
    assert.equal(result.domain, 'demo-123.hostingersite.com');
    assert.equal(result.credentialsPath, '');
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(saved.domain, 'demo-123.hostingersite.com');
    assert.equal(saved.ssh.port, '65002');
    assert.equal(saved.hostinger.user, 'u_test');
    assert.equal(saved.ssh.wpPath, '/home/u_test/domains/demo-123.hostingersite.com/public_html');
    assert.match(readFileSync(path, 'utf8'), /u_test/);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('new WordPress credentials are written only to a private file', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-new-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model', hostinger: {user: '', order: 42}}));
  let submitted = false;
  const execFile = (command, args) => {
    const joined = args.join(' ');
    if (joined.includes('websites list')) return JSON.stringify({data: [{domain: 'new-123.hostingersite.com', username: 'u_new'}]});
    if (joined.includes('installations list')) return JSON.stringify(submitted ? [{domain: 'new-123.hostingersite.com', is_valid: true}] : []);
    if (joined.includes('installations install')) {
      submitted = JSON.parse(args[args.indexOf('--credentials') + 1]);
      return JSON.stringify({message: 'accepted'});
    }
    return JSON.stringify({message: 'accepted'});
  };
  try {
    const result = await provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), ['--domain', 'new-123.hostingersite.com'], {execFile, intervalMs: 1});
    assert.equal(existsSync(result.credentialsPath), true);
    const mode = statSync(result.credentialsPath).mode & 0o777;
    assert.equal(mode, 0o600);
    assert.equal(submitted.login, 'codexadmin');
    assert.match(submitted.password, /^[A-Za-z0-9_-]{20,}$/);
    assert.doesNotMatch(readFileSync(path, 'utf8'), new RegExp(submitted.password));
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('new-site provisioning can derive the Hostinger user without pre-seeding hostinger config', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-new-account-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model'}));
  const execFile = (command, args) => {
    const joined = args.join(' ');
    if (joined.includes('websites list')) return JSON.stringify({data: [{domain: 'new-account.hostingersite.com', username: 'u_new_account'}]});
    if (joined.includes('installations list')) return JSON.stringify([{domain: 'new-account.hostingersite.com', is_valid: true}]);
    return JSON.stringify({message: 'accepted'});
  };
  try {
    const result = await provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), [
      '--domain', 'new-account.hostingersite.com',
      '--order', '42',
    ], {execFile, intervalMs: 1});
    assert.equal(result.hostingerUser, 'u_new_account');
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(saved.hostinger.order, 42);
    assert.equal(saved.hostinger.user, 'u_new_account');
    assert.equal(saved.ssh.wpPath, '/home/u_new_account/domains/new-account.hostingersite.com/public_html');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('new-site credentials use safe defaults when hostinger config is absent', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-absent-config-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model'}));
  let submitted = false;
  const execFile = (command, args) => {
    const joined = args.join(' ');
    if (joined.includes('websites list')) return JSON.stringify({data: [{domain: 'absent.hostingersite.com', username: 'u_absent'}]});
    if (joined.includes('installations list')) return JSON.stringify(submitted ? [{domain: 'absent.hostingersite.com', is_valid: true}] : []);
    if (joined.includes('installations install')) submitted = true;
    return JSON.stringify({message: 'accepted'});
  };
  try {
    const result = await provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), [
      '--domain', 'absent.hostingersite.com',
      '--order', '42',
    ], {execFile, intervalMs: 1});
    assert.equal(result.hostingerUser, 'u_absent');
    assert.match(readFileSync(result.credentialsPath, 'utf8'), /"login": "codexadmin"/);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('generated subdomain is persisted before website creation so failed provisioning resumes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-domain-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model'}));
  const execFile = (command, args) => {
    const joined = args.join(' ');
    if (joined.includes('generate-free-subdomain')) return JSON.stringify({domain: 'resume-me-123.hostingersite.com'});
    if (joined.includes('websites create')) return JSON.stringify({message: 'accepted'});
    if (joined.includes('websites list')) return JSON.stringify({data: []});
    return JSON.stringify({message: 'accepted'});
  };
  try {
    await assert.rejects(
      provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), ['--order', '42'], {execFile, attempts: 1, intervalMs: 1}),
      /Timed out waiting/,
    );
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(saved.domain, 'resume-me-123.hostingersite.com');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('provisioned project config updates domain and private path safely', () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-config-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model'}));
  try {
    const saved = updateProvisionedProject(root, {
      domain: 'Demo-123.Hostingersite.com',
      hostingerUser: 'u_test',
      order: 42,
      sshHost: 'ssh.example.test',
      sshPort: '65002',
      sshUser: 'u_test',
      sshKeyPath: '.wordpress-builder/key',
    });
    assert.equal(saved.domain, 'demo-123.hostingersite.com');
    assert.equal(saved.ssh.wpPath, '/home/u_test/domains/demo-123.hostingersite.com/public_html');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
