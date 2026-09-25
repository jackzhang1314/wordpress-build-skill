import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {adoptExternalSite, auditExternalSite} from '../../harness/lib/external.mjs';
import {assignTemplate} from '../../harness/lib/maintenance.mjs';

test('adopt creates a protected remote-only project and records the live implementation', async () => {
  const projectsRoot = await mkdtemp(join(tmpdir(), 'harness-adopt-'));
  try {
    const setup = async (root, project, args, options) => {
      assert.equal(args.includes('--account-key'), true);
      assert.equal(typeof options.exec, 'function');
      project.ssh = {
        host: '203.0.113.10', port: '65002', user: 'u123',
        keyPath: join(root, 'key'), wpPath: '/home/u123/domains/site.test/public_html',
      };
      await writeFile(join(root, 'project.json'), JSON.stringify(project, null, 2));
      return {pass: true};
    };
    const exec = (command, args = []) => {
      if (command === 'git') return '';
      const text = args.join(' ');
      if (text.includes('siteurl')) return 'https://site.test';
      if (text.includes('blogname')) return 'Existing Factory';
      if (text.includes('core version')) return '7.1.2';
      if (text.includes('theme list')) return 'customer-theme';
      if (text.includes('plugin list')) return JSON.stringify([{name: 'contact-form'}, {name: 'seo'}]);
      if (text.includes('timezone_string')) return 'Asia/Shanghai';
      return '';
    };
    const result = await adoptExternalSite({
      name: 'existing-factory', projectsRoot, domain: 'site.test', order: 42, git: true,
    }, {setup, exec, discover: () => ({username: 'u123', order_id: 42})});
    assert.equal(result.pass, true);
    assert.equal(result.remote.activeTheme, 'customer-theme');
    const project = JSON.parse(await readFile(join(result.root, 'project.json'), 'utf8'));
    assert.equal(project.mode, 'external');
    assert.equal(project.theme, 'customer-theme');
    assert.equal(project.remote.plugins.join(','), 'contact-form,seo');
  } finally {
    await rm(projectsRoot, {recursive: true, force: true});
  }
});

test('external site audit checks WP-CLI, inventory and homepage without local source gates', async () => {
  const ssh = {
    wp(args) {
      const text = args.join(' ');
      if (text.includes('core version')) return '7.1.2\n';
      if (text.includes('theme list')) return 'legacy-theme\n';
      if (text.includes('plugin list')) return JSON.stringify([{name: 'legacy-form'}]);
      throw new Error(`unexpected ${text}`);
    },
  };
  const report = await auditExternalSite({ssh, base: 'https://site.test'}, {
    fetchImpl: async () => ({ok: true, status: 200}),
  });
  assert.equal(report.pass, true);
  assert.equal(report.activeTheme, 'legacy-theme');
});

test('external projects can assign an existing remote page template after remote validation', async () => {
  const commands = [];
  const ssh = {
    run(command) {
      commands.push(['run', command]);
      if (command.includes('template.php')) return '';
      return '';
    },
    wp(args) {
      const text = args.join(' ');
      commands.push(['wp', text]);
      if (text.includes('eval-file')) return '{"id":9,"template":"page-templates/customer.php"}';
      if (text.includes('post meta get')) return 'page-templates/customer.php';
      return '';
    },
  };
  const root = await mkdtemp(join(tmpdir(), 'harness-template-'));
  try {
    const result = await assignTemplate({root, project: {mode: 'external', paths: {theme: 'theme'}}, ssh}, [
      'about', '--template', 'page-templates/customer.php',
    ]);
    assert.equal(result.id, 9);
    assert.ok(commands.some(([, text]) => text.includes('remote-template-not-found') || text.includes('eval-file')));
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
