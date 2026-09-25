import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const starterRoot = join(repoRoot, 'examples/classic-b2b-starter');

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

test('page routing uses assigned WordPress page templates, not slug-bound files', () => {
  for (const file of ['theme/page-templates/about.php', 'theme/page-templates/contact.php', 'theme/page-templates/landing.php', 'theme/page-templates/full-width.php']) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    assert.match(text, /Template Name:/);
    assert.match(text, /Template Post Type:\s*page/);
  }
  assert.ok(!existsSync(join(starterRoot, 'theme/page-about.php')));
  assert.ok(!existsSync(join(starterRoot, 'theme/page-contact.php')));
});

test('page controllers separate data access from presentation', () => {
  for (const name of ['homepage_data', 'about_data', 'contact_data', 'product_data', 'product_category_data', 'industry_data']) {
    assert.match(readFileSync(join(starterRoot, 'theme/inc/page-data.php'), 'utf8'), new RegExp(`function ${name}\\(`));
  }
  const product = readFileSync(join(starterRoot, 'theme/single-starter_product.php'), 'utf8');
  assert.doesNotMatch(product, /get_posts|WP_Query|component_section_heading\(\['eyebrow' => 'Data', 'title' => 'Full specifications'\] \);/);
});

test('product schema is generic and seeded through admin-editable ACF fields', () => {
  const data = JSON.parse(readFileSync(join(starterRoot, 'content/site-data.json'), 'utf8'));
  for (const product of data.products) {
    for (const field of ['quick_specs', 'spec_table', 'product_faq']) {
      assert.ok(product.acf[field] !== undefined, `${product.slug} misses ${field}`);
    }
    for (const forbidden of ['wattage', 'efficacy', 'ip_rating']) {
      assert.ok(product.acf[forbidden] === undefined, `${product.slug} retains LED-specific core field ${forbidden}`);
    }
  }
  const plugin = readFileSync(join(starterRoot, 'plugin/starter-model.php'), 'utf8');
  for (const field of ['quick_specs', 'spec_table', 'product_faq', 'product_details_title', 'related_products']) {
    assert.match(plugin, new RegExp(`'${field}'`));
  }
});

test('industry and term fields are written by field name or qualified object id', () => {
  const seed = readFileSync(join(starterRoot, 'scripts/seed.php'), 'utf8');
  assert.match(seed, /update_field\('challenge'/);
  assert.match(seed, /update_field\('outcome'/);
  assert.doesNotMatch(seed, /update_field\('field_starter_industry_/);
});

test('term ACF seeding uses qualified ACF object ids to prevent post-meta pollution', () => {
  const seed = readFileSync(join(starterRoot, 'scripts/seed.php'), 'utf8');
  assert.match(seed, /update_field\(\$field_name, \(string\) \$field_value, 'product_collection_' \. \$term_id\)/);
  assert.match(seed, /starter_delete_legacy_post_meta/);
});

test('layout partials never repeat the main query loop owned by template renderers', () => {
  for (const file of [
    'theme/templates/products/standard.php',
    'theme/templates/products/technical.php',
    'theme/templates/products/project.php',
    'theme/templates/products/compact.php',
    'theme/templates/home/corporate.php',
    'theme/templates/home/product-led.php',
    'theme/templates/home/conversion.php',
    'theme/templates/home/industrial.php',
  ]) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    assert.doesNotMatch(text, /have_posts\s*\(/, `${file} must not own the main query loop`);
  }
});

test('selectable layouts own one accessible main shell', () => {
  for (const file of [
    'theme/templates/home/corporate.php',
    'theme/templates/home/product-led.php',
    'theme/templates/home/conversion.php',
    'theme/templates/home/industrial.php',
    'theme/templates/categories/standard.php',
    'theme/templates/categories/catalogue.php',
    'theme/templates/categories/conversion.php',
    'theme/templates/categories/editorial.php',
    'theme/templates/products/standard.php',
    'theme/templates/products/technical.php',
    'theme/templates/products/project.php',
    'theme/templates/products/compact.php',
  ]) {
    const text = readFileSync(join(starterRoot, file), 'utf8');
    assert.match(text, /<main id="main" class="shell">/, `${file} must open the main shell`);
    assert.match(text, /<\/main>/, `${file} must close the main shell`);
    assert.equal((text.match(/<main id="main"/g) || []).length, 1, `${file} must have exactly one main shell`);
  }
});

test('media placeholders are calibrated technical frames, not blank boxes', () => {
  const functions = readFileSync(join(starterRoot, 'theme/functions.php'), 'utf8');
  for (const required of ['media-grid', 'media-frame', 'media-cross', 'media-label', 'aria-label']) {
    assert.match(functions, new RegExp(required), `placeholder markup misses ${required}`);
  }
  const css = readFileSync(join(starterRoot, 'theme/style.css'), 'utf8');
  assert.match(css, /\.media-fallback\{[^}]*display:grid/);
  assert.match(css, /\.media-label\{[^}]*text-transform:uppercase/);
});

test('factory metrics preserve value-first data and home avoids duplicate proof strips', () => {
  const functions = readFileSync(join(starterRoot, 'theme/functions.php'), 'utf8');
  assert.match(functions, /function value_rows\(/);
  assert.match(functions, /'value' => \$parts\[0\], 'label' => \$parts\[1\]/);
  const data = readFileSync(join(starterRoot, 'theme/inc/page-data.php'), 'utf8');
  assert.match(data, /value_rows\(field_text\('factory_stats', 'option'\)\)/);
  const home = readFileSync(join(starterRoot, 'theme/templates/home/corporate.php'), 'utf8');
  assert.match(home, /component_stat_strip/);
  assert.doesNotMatch(home, /component_factory_strip/);
});

test('native editor patterns remain compatible with the classic editor', () => {
  const patterns = JSON.parse(readFileSync(join(starterRoot, 'config/editor-block-patterns.json'), 'utf8'));
  const allowed = new Set(['heading', 'paragraph', 'list', 'image', 'button', 'section', 'columns', 'column', 'table', 'faq', 'form', 'catalog', 'shortcode']);
  let count = 0;
  for (const [name, blocks] of Object.entries(patterns.patterns)) {
    assert.ok(Array.isArray(blocks), `${name} must contain native editor blocks`);
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (typeof node.type === 'string') {
        count++;
        assert.ok(allowed.has(node.type), `${name} uses unsupported module ${node.type}`);
      }
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') walk(value);
      }
    };
    walk(blocks);
  }
  assert.ok(count > 0);

  const plugin = readFileSync(join(starterRoot, 'plugin/starter-model.php'), 'utf8');
  assert.match(plugin, /\$object->template = \$/);
  assert.match(plugin, /\$object->template_lock = 'all'/);

  const loader = readFileSync(join(starterRoot, 'theme/inc/template-loader.php'), 'utf8');
  for (const key of ['product_templates', 'category_templates', 'home_templates']) {
    assert.match(loader, new RegExp(`function ${key}\\(`));
  }

  const caseStudy = readFileSync(join(starterRoot, 'theme/page-templates/case-study.php'), 'utf8');
  assert.match(caseStudy, /Template Editor Pattern: case-study-body/);
});

test('blog templates follow SEO-first editorial architecture', () => {
  for (const file of ['theme/home.php', 'theme/archive.php', 'theme/single.php', 'theme/inc/blog.php', 'theme/parts/blog-card.php']) {
    assert.ok(existsSync(join(starterRoot, file)), `missing ${file}`);
  }

  const single = readFileSync(join(starterRoot, 'theme/single.php'), 'utf8');
  for (const marker of [
    'Written by',
    'article-byline',
    'blog_reading_time',
    'blog_article_content',
    'article-toc',
    'article-body',
    'author-box',
    'component_related_blog_cards',
    'BlogPosting',
    'datePublished',
    'dateModified',
    'publisher',
  ]) {
    assert.match(single, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const archive = readFileSync(join(starterRoot, 'theme/home.php'), 'utf8');
  assert.match(archive, /component_blog_archive/);
  assert.match(archive, /the_posts_pagination/);
  assert.match(archive, /blog-filter/);

  const helpers = readFileSync(join(starterRoot, 'theme/inc/blog.php'), 'utf8');
  for (const marker of ['blog_reading_time', 'blog_modified_is_visible', 'blog_related_posts', 'sanitize_title']) {
    assert.match(helpers, new RegExp(marker));
  }

  const project = JSON.parse(readFileSync(join(starterRoot, 'project.example.json'), 'utf8'));
  assert.equal(project.routeCount, 24);
  assert.ok(project.livePages.includes('/news/'));
});

test('product category pages use a rich commercial landing-page architecture', () => {
  const template = readFileSync(join(starterRoot, 'theme/templates/categories/standard.php'), 'utf8');
  const dispatcher = readFileSync(join(starterRoot, 'theme/taxonomy-product_collection.php'), 'utf8');
  const controller = readFileSync(join(starterRoot, 'theme/inc/page-data.php'), 'utf8');
  for (const marker of [
    'component_category_hero',
    'component_anchor_nav',
    'id="products"',
    'id="selection-guide"',
    'id="specifications"',
    'id="applications"',
    'id="standards"',
    'id="resources"',
    'id="faq"',
    'component_related_category_tiles',
    'component_category_editorial',
    'application/ld+json',
  ]) {
    assert.match(template, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(dispatcher, /render_category_archive/);
  assert.match(dispatcher, /category_template_value/);
  assert.match(controller, /'product_collection_' \. \$term_id/);
  const loader = readFileSync(join(starterRoot, 'theme/inc/template-loader.php'), 'utf8');
  assert.match(loader, /'category_template'/);
  assert.match(loader, /'home_template'/);
  for (const field of [
    'category_overline',
    'category_intro',
    'category_hero_image',
    'category_key_facts',
    'category_selection_guide',
    'category_specifications',
    'category_use_cases',
    'category_standards',
    'category_process',
    'category_checklist',
    'category_resources',
    'category_faq',
    'category_long_description',
  ]) {
    assert.match(controller, new RegExp(`'${field}'`));
  }
});

test('product detail v2 keeps a simple hero and uses the main editor at the bottom', () => {
  const product = readFileSync(join(starterRoot, 'theme/templates/products/standard.php'), 'utf8');
  const heroEnd = product.indexOf('</section>', product.indexOf('component_product_gallery'));
  const hero = product.slice(product.indexOf('<section class="product-hero"'), heroEnd);
  const dispatcher = readFileSync(join(starterRoot, 'theme/single-starter_product.php'), 'utf8');
  assert.match(dispatcher, /render_product_single/);
  assert.match(dispatcher, /product_template_value/);
  assert.match(hero, /component_product_gallery/);
  assert.match(hero, /component_product_hero_summary/);
  assert.doesNotMatch(hero, /component_spec_table|MOQ|Lead time|Back to catalogue/);
  assert.match(product, /component_product_hero_summary/);
  assert.doesNotMatch(product, /component_document_list|Typical applications|Documents & downloads|Essential product data|At a glance|Buying & delivery|Customization/);

  const faqIndex = product.indexOf("title' => 'Product questions'");
  const detailsIndex = product.indexOf('component_rich_description');
  const relatedIndex = product.indexOf('component_related_products');
  assert.ok(faqIndex > -1 && detailsIndex > faqIndex, 'rich details must follow structured FAQ');
  assert.ok(relatedIndex > detailsIndex, 'related products must follow rich details');
  assert.match(product, /the_content\(\)/);
});

test('product gallery and rich text have bounded presentation contracts', () => {
  const components = readFileSync(join(starterRoot, 'theme/inc/components.php'), 'utf8');
  for (const name of ['component_product_gallery', 'component_product_hero_summary', 'component_rich_description']) {
    assert.match(components, new RegExp(`function ${name}\\(`));
  }
  const css = readFileSync(join(starterRoot, 'theme/style.css'), 'utf8');
  for (const rule of ['.product-hero', '.gallery-thumbs', '.rich-description table', '.rich-description iframe']) {
    assert.match(css, new RegExp(rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  const js = readFileSync(join(starterRoot, 'theme/assets/js/nav.js'), 'utf8');
  assert.match(js, /\.product-gallery\.has-many/);
});

test('ACF free gallery slots are registered without a PRO gallery dependency', () => {
  const plugin = readFileSync(join(starterRoot, 'plugin/starter-model.php'), 'utf8');
  for (let index = 1; index <= 5; index += 1) {
    assert.match(plugin, new RegExp(`'product_gallery_${index}'`));
  }
  assert.doesNotMatch(plugin, /'type'\s*=>\s*'gallery'/);
});

test('seed writes every editable product v2 field', () => {
  const seed = readFileSync(join(starterRoot, 'scripts/seed.php'), 'utf8');
  for (const field of ['product_faq', 'product_details_title']) {
    assert.match(seed, new RegExp(`'${field}'`));
  }
});

test('seed navigation is explicit and default deploy does not rebuild it', () => {
  const seed = readFileSync(join(starterRoot, 'scripts/seed.php'), 'utf8');
  assert.match(seed, /if \(starter_rebuild_nav_enabled\(\)\)/);
  const ops = readFileSync(join(repoRoot, 'harness/lib/ops.mjs'), 'utf8');
  assert.match(ops, /rebuildNav = true/);
  assert.match(ops, /navPolicy = rebuildNav/);
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
    'home.php',
    'index.php',
    'single.php',
    'archive-starter_guide.php',
    'archive-starter_industry.php',
    'archive-starter_product.php',
    'front-page.php',
    'index.php',
    'page-templates/about.php',
    'page.php',
    'search.php',
    'single-starter_guide.php',
    'single-starter_industry.php',
    'single-starter_product.php',
    'taxonomy-product_collection.php',
    'page-templates/contact.php',
    'templates/products/standard.php',
    'templates/products/technical.php',
    'templates/products/project.php',
    'templates/products/compact.php',
    'templates/categories/standard.php',
    'templates/categories/catalogue.php',
    'templates/categories/conversion.php',
    'templates/categories/editorial.php',
    'templates/home/corporate.php',
    'templates/home/product-led.php',
    'templates/home/conversion.php',
    'templates/home/industrial.php',
    'page-templates/product-catalogue.php',
    'page-templates/factory-capability.php',
    'page-templates/case-study.php',
    'page-templates/resource-center.php',
  ];
  for (const file of componentFiles) {
    const text = readFileSync(join(starterRoot, 'theme', file), 'utf8');
    const usesComponent = /component_page_head|component_section_heading|component_card_grid|component_blog_archive|component_cta_band|render_product_single|render_category_archive|render_home_layout|component_related_products|component_spec_table|component_feature_grid|component_link_cards|render_home_layout|get_template_part\('parts\//.test(text);
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
  const registered = new Set([
    ...plugin.matchAll(/'name'\s*=>\s*'([a-z0-9_]+)'/g),
    ...plugin.matchAll(/\$field\(\s*'field_[a-z0-9_]+'\s*,\s*'([a-z0-9_]+)'/g),
  ].flatMap(match => [match[1]]));
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
