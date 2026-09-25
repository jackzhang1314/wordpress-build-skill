import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditProject, headingReport} from '../../harness/lib/quality.mjs';

test('heading report finds one skipped heading', () => {
  const report = headingReport('<h1>Title</h1><h3>Too deep</h3><h2>Back</h2>', 'test');
  assert.equal(report.h1, 1);
  assert.equal(report.skips, 1);
  assert.equal(report.violations[0].level, 3);
});

test('classic project audit detects missing plugin main and content JSON errors', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-audit-'));
  try {
    await mkdir(join(root, 'theme'), {recursive: true});
    await mkdir(join(root, 'plugin'), {recursive: true});
    await mkdir(join(root, 'content'), {recursive: true});
    await writeFile(join(root, 'theme/style.css'), '/*\nTheme Name: Demo\nVersion: 1.0\n*/\n');
    await writeFile(join(root, 'theme/functions.php'), '<?php\n');
    await writeFile(join(root, 'theme/index.php'), '<?php get_header(); ?><h1>Home</h1><?php get_footer();\n');
    await writeFile(join(root, 'plugin/wrong.php'), "<?php\ndefined('ABSPATH') || exit;\n");
    await writeFile(join(root, 'content/site-data.json'), '{bad');
    const project = {
      slug: 'demo', sourceProfile: 'starter', theme: 'demo-theme', plugin: 'demo-model', pluginMain: 'demo-model.php',
      requiredPlugins: [], disabledPlugins: [], contentMarkers: [], contentCounts: [],
      media: {sources: []}, seed: {enabled: true, script: 'scripts/seed.php', data: 'content/site-data.json'},
      paths: {theme: 'theme', plugin: 'plugin', content: 'content'},
    };
    const report = await auditProject(root, project, {phpBin: undefined});
    assert.equal(report.pass, false);
    const structure = report.gates.find(gate => gate.name === 'structure');
    assert.equal(structure.checks.find(check => check.name === 'plugin/main').pass, false);
    const content = report.gates.find(gate => gate.name === 'content-data');
    assert.equal(content.pass, false);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('content gate flags raw angle brackets that WordPress text helpers would swallow', async () => {
  const {mkdtemp, writeFile, rm} = await import('node:fs/promises');
  const {tmpdir} = await import('node:os');
  const {join} = await import('node:path');
  const root = await mkdtemp(join(tmpdir(), 'quality-content-'));
  try {
    await mkdirSafe(join(root, 'theme'));
    await mkdirSafe(join(root, 'plugin'));
    await mkdirSafe(join(root, 'content'));
    await writeFile(join(root, 'theme/style.css'), '/*\nTheme Name: Demo\nVersion: 1.0.0\n*/\n');
    await writeFile(join(root, 'theme/functions.php'), '<?php\n');
    await writeFile(join(root, 'theme/index.php'), '<?php get_header(); ?><h1>Home</h1><?php get_footer();');
    await writeFile(join(root, 'plugin/demo-model.php'), "<?php\ndefined('ABSPATH') || exit;\n");
    await writeFile(join(root, 'content/site-data.json'), JSON.stringify({
      terms: [], pages: {home: {content: '<p>ok</p>'}},
      products: [{excerpt: 'UGR<19 panel for offices'}],
    }));
    const project = {
      slug: 'demo', theme: 'demo-theme', plugin: 'demo-model', pluginMain: 'demo-model.php',
      requiredPlugins: [], disabledPlugins: [], contentMarkers: [], contentCounts: [],
      media: {sources: []}, seed: {enabled: true, script: 'scripts/seed.php', data: 'content/site-data.json'},
      paths: {theme: 'theme', plugin: 'plugin', content: 'content'},
    };
    const report = await auditProject(root, project, {phpBin: undefined});
    const content = report.gates.find(gate => gate.name === 'content-data');
    assert.equal(content.pass, false);
    assert.match(JSON.stringify(content.checks), /UGR<19/);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('custom source projects skip Starter route and template contracts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'quality-custom-'));
  try {
    await mkdir(join(root, 'theme'), {recursive: true});
    await mkdir(join(root, 'plugin'), {recursive: true});
    await mkdir(join(root, 'content'), {recursive: true});
    await writeFile(join(root, 'theme/style.css'), '/*\nTheme Name: Custom\nVersion: 1.0\n*/\n');
    await writeFile(join(root, 'theme/functions.php'), '<?php\n');
    await writeFile(join(root, 'theme/index.php'), '<?php get_header(); ?><h1>Home</h1><?php get_footer();');
    await writeFile(join(root, 'plugin/custom-model.php'), "<?php\ndefined('ABSPATH') || exit;\n");
    await writeFile(join(root, 'content/site-data.json'), JSON.stringify({terms: [], pages: []}));
    const project = {
      slug: 'custom', sourceProfile: 'custom', theme: 'custom-theme', plugin: 'custom-model',
      pluginMain: 'custom-model.php', livePages: ['/'], routeCount: 23,
      requiredPlugins: [], disabledPlugins: [], contentMarkers: [], contentCounts: [],
      media: {sources: []}, seed: {enabled: false, script: 'scripts/seed.php', data: 'content/site-data.json'},
      paths: {theme: 'theme', plugin: 'plugin', content: 'content'},
    };
    const report = await auditProject(root, project, {phpBin: undefined});
    assert.equal(report.pass, true);
    assert.equal(report.gates.some(gate => gate.name === 'page-template-contract'), false);
    assert.equal(report.gates.some(gate => gate.name === 'ui-component-contracts'), false);
    const routes = report.gates.find(gate => gate.name === 'routes');
    assert.equal(routes.checks.some(check => check.name === 'count'), false);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

async function mkdirSafe(path) {
  const {mkdir} = await import('node:fs/promises');
  await mkdir(path, {recursive: true});
}
