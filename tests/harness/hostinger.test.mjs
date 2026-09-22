import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {provisionHostinger, updateProvisionedProject} from '../../harness/lib/hostinger.mjs';

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

test('provision is idempotent when website and WordPress already exist', async () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-provision-'));
  const path = join(root, 'project.json');
  writeFileSync(path, JSON.stringify({title: 'Demo', domain: '', theme: 'demo-theme', plugin: 'demo-model', hostinger: {user: '', order: 42}}));
  try {
    const result = await provisionHostinger(root, JSON.parse(readFileSync(path, 'utf8')), ['--domain', 'demo-123.hostingersite.com'], {
      execFile: fakeHostinger('demo-123.hostingersite.com', 42),
      intervalMs: 1,
    });
    assert.equal(result.domain, 'demo-123.hostingersite.com');
    assert.equal(result.credentialsPath, '');
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(saved.domain, 'demo-123.hostingersite.com');
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
