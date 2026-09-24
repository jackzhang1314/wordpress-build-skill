import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const starterRoot = fileURLToPath(new URL('../examples/classic-b2b-starter', import.meta.url));

function walk(relative = '') {
  const root = join(starterRoot, relative);
  return readdirSync(root).flatMap(entry => {
    const path = join(root, entry);
    const relativePath = relative ? `${relative}/${entry}` : entry;
    return statSync(path).isDirectory() ? walk(relativePath) : [relativePath];
  });
}

test('starter has the component architecture contract files', () => {
  for (const file of [
    'REBUILD.md',
    'project.example.json',
    'docs/ARCHITECTURE-COMPONENTS.md',
    'theme/inc/components.php',
    'theme/parts/site-header.php',
    'theme/parts/site-footer.php',
    'theme/parts/hero.php',
    'theme/parts/card.php',
  ]) {
    assert.ok(existsSync(join(starterRoot, file)), `missing ${file}`);
  }
});

test('starter naming is neutral and project-specific names do not return', () => {
  const forbidden = /cleanroom|Cleanroom|harness-cleanroom|novalux|NOVALUX|field_nova/;
  for (const file of walk().filter(file => /\.(php|css|js|json|md|html)$/.test(file))) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    assert.doesNotMatch(text, forbidden, `${file} contains forbidden project-specific naming`);
  }
});

test('starter media map starts blank and seed data does not request uploaded media', () => {
  const map = JSON.parse(readFileSync(join(starterRoot, 'content/media-map.json'), 'utf8'));
  assert.deepEqual(map, {});
  const data = readFileSync(join(starterRoot, 'content/site-data.json'), 'utf8');
  assert.doesNotMatch(data, /"image_key"\s*:/);
  assert.doesNotMatch(data, /"image_alt"\s*:/);
});

test('templates compose through components instead of repeating section shells', () => {
  const componentFiles = [
    '404.php',
    'archive.php',
    'archive-starter_guide.php',
    'archive-starter_industry.php',
    'archive-starter_product.php',
    'front-page.php',
    'index.php',
    'page-about.php',
    'page.php',
    'search.php',
    'single-starter_guide.php',
    'single-starter_industry.php',
    'single-starter_product.php',
    'taxonomy-product_collection.php',
  ];
  for (const file of componentFiles) {
    const text = readFileSync(join(starterRoot, 'theme', file), 'utf8');
    const usesComponent = /component_page_head|component_section_heading|component_card_grid|component_cta_band|component_related_products|component_spec_table|component_feature_grid|component_link_cards|get_template_part\('parts\//.test(text);
    assert.ok(usesComponent, `${file} must compose a component or template part`);
  }
  for (const file of componentFiles) {
    const text = readFileSync(join(starterRoot, 'theme', file), 'utf8');
    assert.ok(!/<section class="cta-band">\s*<div class="section-heading">/.test(text), `${file} repeats the CTA component markup`);
    assert.ok(!/<header class="page-head">\s*<\?php Starter\\Theme\\breadcrumbs/.test(text), `${file} repeats the page-head component markup`);
  }
});

test('starter project contract uses required plugin baseline and placeholder deployment values', () => {
  const project = JSON.parse(readFileSync(join(starterRoot, 'project.example.json'), 'utf8'));
  assert.equal(project.theme, 'b2b-starter-theme');
  assert.equal(project.plugin, 'starter-model');
  assert.deepEqual(project.requiredPlugins, [
    'advanced-custom-fields',
    'seo-by-rank-math',
    'fluentform',
    'classic-editor',
  ]);
  assert.equal(project.media.sources.length, 0);
  assert.equal(project.ssh.host, 'REPLACE_SSH_HOST');
  assert.equal(project.ssh.keyPath, 'REPLACE_SSH_KEY_PATH');
});

test('every consumed ACF field has an admin-editable field definition', () => {
  const plugin = readFileSync(join(starterRoot, 'plugin/starter-model.php'), 'utf8');
  const themeFiles = walk('theme').filter(file => file.endsWith('.php'));
  const registered = new Set([...plugin.matchAll(/'name'\s*=>\s*'([a-z0-9_]+)'/g)].map(match => match[1]));
  const consumed = new Set();
  for (const file of themeFiles) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    for (const match of text.matchAll(/field_(?:text|rows|lines|option)\(\s*'([a-z0-9_]+)'/g)) {
      consumed.add(match[1]);
    }
  }
  const missing = [...consumed].filter(name => !registered.has(name));
  assert.deepEqual(missing, []);
  for (const name of [
    'product_archive_description',
    'industry_archive_description',
    'guide_archive_description',
    'news_archive_description',
    'not_found_description',
    'contact_intro',
    'contact_checklist',
    'form_title',
    'form_note',
  ]) {
    assert.ok(registered.has(name), `missing editable ACF field ${name}`);
  }
});

test('seed content embeds through the stable starter shortcode', () => {
  for (const file of ['content/site-data.json', 'content/patches/contact.html']) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    assert.ok(!text.includes('[fluentform'), `${file} must not hardcode a Fluent Forms ID`);
  }
  const plugin = readFileSync(join(starterRoot, 'plugin/starter-model.php'), 'utf8');
  assert.match(plugin, /add_shortcode\('starter_rfq_form'/);
  assert.match(plugin, /function ensure_rfq_form\(\): int/);
  assert.match(plugin, /form_fields\['submitButton'\]/);
  assert.doesNotMatch(plugin, /shortcode_atts\(\['id' => '3'\]/);
});
