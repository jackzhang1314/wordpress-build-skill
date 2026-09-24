import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {
  checkAcfBinding,
  checkComponentDuplication,
  checkRoutes,
  checkZeroMedia,
  checkWordPressClasses,
  checkUiComponentContracts,
} from '../../harness/lib/quality.mjs';
import {captureScreenshots, planScreenshotJobs} from '../../harness/lib/screenshots.mjs';

function makeProject(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'starter-gates-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(full.slice(0, full.lastIndexOf('/')), {recursive: true});
    writeFileSync(full, content);
  }
  const project = {paths: {theme: 'theme', plugin: 'plugin', content: 'content'}, pluginMain: 'starter-model.php', livePages: []};
  return {root, project, cleanup: () => rmSync(root, {recursive: true, force: true})};
}

test('component-duplication flags inline section markup in templates but not in parts', () => {
  const env = makeProject({
    'theme/front-page.php': '<?php // page ?><div class="section-heading"><div></div></div>',
    'theme/inc/components.php': '<?php // owner ?><div class="section-heading"><div></div></div>',
    'theme/parts/card.php': '<?php // owner ?><div class="section-heading"><div></div></div>',
    'theme/single-starter_product.php': '<?php // page ?><table class="spec-table"></table>',
    'plugin/starter-model.php': '<?php // model',
  });
  try {
    const report = checkComponentDuplication(env.root, env.project);
    assert.equal(report.pass, false);
    assert.deepEqual(report.checks.map(item => item.file).sort(), ['theme/front-page.php', 'theme/single-starter_product.php']);
  } finally {
    env.cleanup();
  }
});

test('zero-media fails on image_key, non-empty media map, binary assets and img dir', () => {
  const env = makeProject({
    'content/site-data.json': '{"products":[{"image_key":"hero"}]}',
    'content/media-map.json': '{"hero": 12}',
    'theme/style.css': '/* starter */',
    'theme/assets/img/hero.jpg': 'binary',
    'plugin/starter-model.php': '<?php // model',
  });
  try {
    const report = checkZeroMedia(env.root, env.project);
    assert.equal(report.pass, false);
    const issues = report.checks.map(item => item.issue).sort();
    assert.ok(issues.includes('image_key reference'));
    assert.ok(issues.includes('non-empty media map'));
    assert.ok(issues.includes('binary image asset'));
    assert.ok(issues.includes('image asset directory'));
  } finally {
    env.cleanup();
  }
});

test('zero-media passes for a placeholder-only starter', () => {
  const env = makeProject({
    'content/site-data.json': '{"terms":[],"pages":[]}',
    'theme/style.css': '/* starter */',
    'theme/functions.php': '<?php // no media writes',
    'plugin/starter-model.php': '<?php // model',
  });
  try {
    assert.equal(checkZeroMedia(env.root, env.project).pass, true);
  } finally {
    env.cleanup();
  }
});

test('acf-binding requires every theme-read field to be registered', () => {
  const env = makeProject({
    'theme/front-page.php': "<?php $a = field_text('cta_title'); $b = field_rows('factory_stats');",
    'plugin/starter-model.php': "<?php 'name' => 'cta_title'",
  });
  try {
    const report = checkAcfBinding(env.root, env.project);
    assert.equal(report.pass, false);
    assert.deepEqual(report.checks, [{field: 'factory_stats', issue: 'used in theme but not registered'}]);

    writeFileSync(join(env.root, 'plugin/starter-model.php'), "<?php 'name' => 'cta_title'\n'name' => 'factory_stats'");
    assert.equal(checkAcfBinding(env.root, env.project).pass, true);
  } finally {
    env.cleanup();
  }
});

test('routes gate enforces count, uniqueness and slash format', () => {
  const env = makeProject({'theme/index.php': '<?php'});
  try {
    env.project.livePages = Array.from({length: 23}, (_, index) => `/route-${index}/`);
    assert.equal(checkRoutes(env.root, env.project).pass, true);

    env.project.livePages = env.project.livePages.slice(0, 22);
    const short = checkRoutes(env.root, env.project);
    assert.equal(short.pass, false);
    assert.equal(short.checks.find(item => item.name === 'count').detail, '22/23');

    env.project.livePages = ['/', '/', '/products/'];
    const dupes = checkRoutes(env.root, env.project);
    assert.equal(dupes.checks.find(item => item.name === 'unique').pass, false);
  } finally {
    env.cleanup();
  }
});

test('wordpress-classes gate requires leading backslashes in namespaced PHP', () => {
  const env = makeProject({
    'theme/inc/components.php': '<?php\nnamespace Starter\\Theme;\nnew WP_Query([]);',
    'theme/functions.php': '<?php\nnamespace Starter\\Theme;\n$x = new \\WP_Query([]);',
    'plugin/starter-model.php': '<?php\nnamespace Starter\\Model;\n$x instanceof WP_Post;',
  });
  try {
    const report = checkWordPressClasses(env.root, env.project);
    assert.equal(report.pass, false);
    assert.deepEqual(report.checks.map(item => [item.file, item.class]).sort(), [
      ['plugin/starter-model.php', 'WP_Post'],
      ['theme/inc/components.php', 'WP_Query'],
    ]);
  } finally {
    env.cleanup();
  }
});

test('screenshot planner produces width-first jobs with safe slugs', () => {
  const jobs = planScreenshotJobs(['/', '/products/ufo-highbay-150w/'], [390, 1440], '/out');
  assert.deepEqual(jobs.map(job => job.out), [
    '/out/0390--home.png',
    '/out/1440--home.png',
    '/out/0390--products-ufo-highbay-150w.png',
    '/out/1440--products-ufo-highbay-150w.png',
  ]);
});

test('ui component contracts require hierarchical nav and horizontal breadcrumbs', () => {
  const env = makeProject({
    'theme/functions.php': `<?php echo '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>';`,
    'theme/parts/site-header.php': `<?php wp_nav_menu(['depth' => 2]); ?>
<button aria-controls="primary-nav"></button><nav id="primary-nav"></nav>`,
    'theme/style.css': `.breadcrumbs ol{display:flex;list-style:none}
.site-header nav ul ul{position:absolute}
.site-header nav li:hover>ul{display:block}
.site-header nav li:focus-within>ul{display:block}`,
    'plugin/starter-model.php': '<?php',
  });
  try {
    const report = checkUiComponentContracts(env.root, env.project);
    assert.equal(report.pass, true);
  } finally {
    env.cleanup();
  }
});

test('captureScreenshots validates bytes and skips only without a runner or chrome', async () => {
  const skipped = await captureScreenshots({base: 'https://x.test', chromeBin: '', routes: ['/'], widths: [390], outDir: join(tmpdir(), 'shots-none')});
  assert.equal(skipped.skipped, true);

  const root = mkdtempSync(join(tmpdir(), 'shots-'));
  try {
    const result = await captureScreenshots({
      base: 'https://x.test',
      routes: ['/', '/products/'],
      widths: [390],
      outDir: root,
      runner: async job => writeFileSync(job.out, 'x'.repeat(job.route === '/' ? 9000 : 10)),
    });
    assert.equal(result.skipped, false);
    assert.deepEqual(result.shots.map(shot => shot.pass), [true, false]);
    assert.equal(result.pass, false);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
