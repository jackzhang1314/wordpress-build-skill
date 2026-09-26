import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {inspectRemoteWordPress} from '../../harness/lib/external.mjs';
import {commandMap} from '../../harness/lib/command-map.mjs';

const skillsRoot = join(process.cwd(), '.agents/skills');
const expectedSkills = [
  'wordpress-builder',
  'wordpress-setup',
  'wordpress-content',
  'wordpress-design',
  'wordpress-delivery',
];

test('WordPress Builder suite contains the five router-owned skills', () => {
  const manifest = JSON.parse(readFileSync(join(skillsRoot, 'wordpress-builder/suite-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.skills.map(skill => skill.name), expectedSkills);
  for (const name of expectedSkills) {
    const skillPath = join(skillsRoot, name, 'SKILL.md');
    assert.equal(existsSync(skillPath), true);
    assert.match(readFileSync(skillPath, 'utf8'), /^---\nname: /);
  }
});

test('canonical WordPress Builder CLI entrypoint exists and is executable', () => {
  const entrypoint = join(process.cwd(), 'wordpress-builder.mjs');
  assert.equal(existsSync(entrypoint), true);
  assert.equal(statSync(entrypoint).mode & 0o111, 0o111);
  assert.match(readFileSync(entrypoint, 'utf8'), /harness\/cli\.mjs/);
});

test('skill suite references resolve and descriptions do not use harness naming', () => {
  for (const name of expectedSkills) {
    const skillPath = join(skillsRoot, name, 'SKILL.md');
    const source = readFileSync(skillPath, 'utf8');
    assert.doesNotMatch(source, /name:\s*[^\n]*harness/i);
    for (const [, target] of source.matchAll(/\]\(([^)#]+\.md)\)/g)) {
      const path = join(skillsRoot, name, target);
      assert.equal(existsSync(path) && statSync(path).isFile(), true, `missing ${target}`);
    }
  }
});

test('suite safety blocks source-only operations for external projects', () => {
  const manifest = JSON.parse(readFileSync(join(skillsRoot, 'wordpress-builder/suite-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.safety.externalBlockedCommands.sort(), ['configure-seo', 'content', 'deploy', 'media', 'setup']);
  const safety = readFileSync(join(skillsRoot, 'wordpress-builder/references/mode-safety.md'), 'utf8');
  assert.match(safety, /External/);
  assert.match(safety, /deploy/);
});

test('command map includes account discovery and mode-specific ownership', () => {
  const commands = commandMap.map(item => item.command);
  assert.ok(commands.includes('sites list'));
  assert.ok(commands.includes('project inspect'));
  assert.equal(commandMap.find(item => item.command === 'deploy')?.projectMode, 'source-only');
  assert.equal(commandMap.find(item => item.command === 'backup')?.projectMode, 'source-or-external');
});

test('remote project inspection detects classic shape and content inventory', async () => {
  const exec = (command, args = []) => {
    assert.equal(command, 'ssh');
    const text = args.at(-1) || '';
    if (text.includes('theme list')) return JSON.stringify([{name: 'legacy-theme', is_block_theme: false}]);
    if (text.includes('plugin list')) return JSON.stringify([{name: 'fluentform'}, {name: 'seo'}]);
    if (text.includes('menu list')) return JSON.stringify([{term_id: 5, name: 'Primary', slug: 'primary', locations: ['primary']}]);
    if (text.includes('wp_navigation')) return '0';
    if (text.includes('get_page_templates')) return JSON.stringify({'page-templates/about.php': 'About'});
    if (text.includes('post-type list')) return JSON.stringify([{name: 'page'}, {name: 'product'}]);
    if (text.includes('taxonomy list')) return JSON.stringify([{name: 'category'}]);
    if (text.includes('post_type=page')) return '7';
    if (text.includes('post_type=post')) return '12';
    if (text.includes('post_type=attachment')) return '31';
    if (text.includes('core version')) return '7.1.2';
    return '';
  };
  const inventory = await inspectRemoteWordPress({
    domain: 'site.test',
    ssh: {host: '203.0.113.10', port: '65002', user: 'u123', keyPath: '/keys/id', wpPath: '/home/u123/site'},
  }, {exec});
  assert.equal(inventory.themeType, 'classic');
  assert.equal(inventory.navigation, 'classic-menu');
  assert.equal(inventory.pageTemplates, 'classic');
  assert.deepEqual(inventory.classicPageTemplates, {'page-templates/about.php': 'About'});
  assert.equal(inventory.forms.fluentform, true);
  assert.equal(inventory.counts.media, 31);
});

test('remote project inspection records page-builder sites as an adapter, not an incompatibility', async () => {
  const exec = (command, args = []) => {
    assert.equal(command, 'ssh');
    const text = args.at(-1) || '';
    if (text.includes('theme list')) return JSON.stringify([{name: 'Hello Elementor', slug: 'hello-elementor', is_block_theme: false}]);
    if (text.includes('plugin list')) return JSON.stringify([{name: 'elementor'}, {name: 'advanced-custom-fields'}]);
    if (text.includes('menu list')) return JSON.stringify([]);
    if (text.includes('wp_navigation')) return '0';
    if (text.includes('get_page_templates')) return JSON.stringify({'page-templates/full-width.php': 'Full Width'});
    if (text.includes('post-type list')) return JSON.stringify([{name: 'page'}, {name: 'project'}]);
    if (text.includes('taxonomy list')) return JSON.stringify([{name: 'category'}]);
    if (text.includes('post_type=page')) return '4';
    if (text.includes('post_type=post')) return '2';
    if (text.includes('post_type=attachment')) return '18';
    if (text.includes('core version')) return '7.1.2';
    return '';
  };
  const inventory = await inspectRemoteWordPress({
    domain: 'elementor.test',
    ssh: {host: '203.0.113.10', port: '65002', user: 'u123', keyPath: '/keys/id', wpPath: '/home/u123/site'},
  }, {exec});
  assert.equal(inventory.renderingSystem, 'hybrid');
  assert.deepEqual(inventory.authoringSystems, ['classic-php', 'elementor']);
  assert.equal(inventory.pageBuilder, 'elementor');
});
