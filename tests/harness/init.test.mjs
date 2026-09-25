import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initFromStarter, initProject} from '../../harness/init.mjs';
import {loadProject} from '../../harness/lib/config.mjs';

test('init scaffolds a generic classic theme and valid config', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'harness-init-'));
  try {
    const root = initProject({name: 'demo-site', projectsRoot: parent, git: false});
    const project = loadProject(root);
    assert.equal(project.theme, 'demo-site-theme');
    assert.equal(project.plugin, 'demo-site-model');
    assert.equal(project.pluginMain, 'demo-site-model.php');
    assert.deepEqual(project.requiredPlugins, ['advanced-custom-fields', 'seo-by-rank-math', 'fluentform', 'classic-editor']);
    assert.equal(existsSync(join(root, 'theme/functions.php')), true);
    assert.equal(existsSync(join(root, 'plugin/demo-site-model.php')), true);
    assert.equal(existsSync(join(root, 'plugin/site-model.php')), false);
    assert.equal(existsSync(join(root, 'theme/single-site_product.php')), false);
    assert.equal(existsSync(join(root, 'theme/theme.json')), false);
    assert.match(await import('node:fs').then(fs => fs.readFileSync(join(root, 'project.json'), 'utf8')), /demo-site_product/);
    assert.match(await import('node:fs').then(fs => fs.readFileSync(join(root, '.gitignore'), 'utf8')), /\.content-state\.json/);
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});

test('init rejects non-kebab-case names before writes', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'harness-init-bad-'));
  try {
    assert.throws(() => initProject({name: 'Bad Name', projectsRoot: parent, git: false}), /kebab-case/);
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});

test('init --from-starter copies the B2B starter into a safe live project', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'harness-starter-init-'));
  try {
    const root = initFromStarter({name: 'factory-site', projectsRoot: parent, git: false});
    const project = loadProject(root);
    assert.equal(project.title, 'factory-site');
    assert.equal(project.slug, 'factory-site');
    assert.equal(project.domain, '');
    assert.equal(project.theme, 'b2b-starter-theme');
    assert.equal(project.plugin, 'starter-model');
    assert.equal(project.seed.enabled, true);
    assert.equal(project.ssh, undefined);
    assert.equal(existsSync(join(root, 'project.json')), true);
    assert.equal(existsSync(join(root, 'theme/templates/products/standard.php')), true);
    assert.equal(existsSync(join(root, 'plugin/starter-model.php')), true);
    assert.equal(existsSync(join(root, 'config/editor-block-patterns.json')), true);
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});
