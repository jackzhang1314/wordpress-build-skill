import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initProject} from '../../harness/init.mjs';
import {loadProject} from '../../harness/lib/config.mjs';

test('init scaffolds a generic classic theme and valid config', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'harness-init-'));
  try {
    const root = initProject({name: 'demo-site', projectsRoot: parent, git: false});
    const project = loadProject(root);
    assert.equal(project.theme, 'demo-site-theme');
    assert.equal(project.plugin, 'demo-site-model');
    assert.equal(project.pluginMain, 'demo-site-model.php');
    assert.equal(existsSync(join(root, 'theme/functions.php')), true);
    assert.equal(existsSync(join(root, 'plugin/demo-site-model.php')), true);
    assert.equal(existsSync(join(root, 'plugin/site-model.php')), false);
    assert.equal(existsSync(join(root, 'theme/single-site_product.php')), false);
    assert.equal(existsSync(join(root, 'theme/theme.json')), false);
    assert.match(await import('node:fs').then(fs => fs.readFileSync(join(root, 'project.json'), 'utf8')), /demo-site_product/);
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
