import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import test from 'node:test';

const root = new URL('../../', import.meta.url).pathname;
const pluginPath = join(root, 'harness/assets/wordpress-builder-core/wordpress-builder-core.php');
const plugin = readFileSync(pluginPath, 'utf8');
const landing = readFileSync(join(root, 'harness/assets/wordpress-builder-core/templates/landing.php'), 'utf8');
const pluginCss = readFileSync(join(root, 'harness/assets/wordpress-builder-core/assets/css/wordpress-builder-core.css'), 'utf8');

function builderCoreFields() {
  const start = plugin.indexOf("'fields' => [");
  const end = plugin.indexOf("'location' => [", start);
  assert.ok(start >= 0 && end > start, 'Builder Core ACF field group is malformed');
  const fieldsSource = plugin.slice(start, end);
  return fieldsSource.split(/\n\s+\[\n(?=\s+'key' => 'field_wbc_)/).slice(1);
}

test('Builder Core ACF fields are REST-exposed and documented for admin editing', () => {
  const fields = builderCoreFields();
  assert.equal(fields.length, 9);
  for (const field of fields) {
    assert.match(field, /'key' => 'field_wbc_/);
    assert.match(field, /'instructions' => '[^']+/);
    assert.match(field, /'show_in_rest' => 1/);
  }
});

test('Builder Core plugin version is defined consistently', () => {
  assert.match(plugin, /Version: 1\.1\.0/);
  assert.match(plugin, /define\('WORDPRESS_BUILDER_CORE_VERSION', '1\.1\.0'\);/);
});

test('Builder Core templates remain editable WordPress page templates', () => {
  assert.match(landing, /wbc_benefits/);
  assert.match(landing, /wbc_specifications/);
  assert.match(landing, /wbc_faq/);
  assert.match(landing, /wbc_secondary_cta_url/);

  for (const templateName of ['canvas.php', 'landing.php']) {
    const template = readFileSync(
      join(root, 'harness/assets/wordpress-builder-core/templates', templateName),
      'utf8',
    );
    assert.match(template, /Template Name: WordPress Builder/);
    assert.match(template, /Template Post Type: page, builder_project, builder_service/);
    assert.match(template, /the_content\(\)/);
  }
});


test('Builder Core landing styles are scoped, responsive and accessible', () => {
  assert.match(plugin, /wordpress_builder_core_enqueue_assets/);
  assert.match(pluginCss, /\.wordpress-builder-template\s*\{/);
  assert.match(pluginCss, /@media \(max-width: 600px\)/);
  assert.match(pluginCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(pluginCss, /:focus-visible/);
  assert.doesNotMatch(pluginCss, /linear-gradient\(/);
});
