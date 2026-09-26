import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRemoteWordPress} from '../../harness/lib/external.mjs';
import {projectSchema} from '../../harness/lib/config.mjs';
import {
  parseTemplateContent,
  resolveNavigationOwnership,
  resolveTemplateHierarchy,
  stableContentHash,
  summarizeBlockTemplates,
} from '../../harness/lib/shape-diagnosis.mjs';

test('shape parser resolves template parts, navigation refs and inline navigation', () => {
  const content = [
    '<!-- wp:template-part {"slug":"header","theme":"factory","tagName":"header"} /-->',
    '<!-- wp:navigation {"overlayMenu":"mobile","ref":12} /-->',
    '<!-- wp:navigation-ref {"ref":13} /-->',
    '<!-- wp:navigation --> inline <!-- /wp:navigation -->',
    '<!-- an ordinary HTML comment -->',
  ].join('\n');
  const parsed = parseTemplateContent(content);
  assert.deepEqual(parsed.templateParts, [{slug: 'header', theme: 'factory', tagName: 'header'}]);
  assert.deepEqual(parsed.navigationRefs, [12, 13]);
  assert.equal(parsed.inlineNavigationBlocks, 1);
  assert.equal(parsed.invalidBlockAttributes, 0);
});

test('template summaries are compact and hashes are deterministic', () => {
  const content = '<!-- wp:navigation {"ref":18} /-->';
  const [summary] = summarizeBlockTemplates([{
    id: 'factory//page', slug: 'page', title: {rendered: 'Page'}, source: 'custom',
    wp_id: 55, content,
  }]);
  assert.equal(summary.wpId, 55);
  assert.equal(summary.source, 'custom');
  assert.deepEqual(summary.navigationRefs, [18]);
  assert.equal(summary.contentHash, stableContentHash(content));
  assert.equal(JSON.stringify(summary).includes('"content"'), false);
});

test('inventory hierarchy prefers custom source but remains low confidence without a route', () => {
  const templates = summarizeBlockTemplates([
    {id: 'factory//page', slug: 'page', source: 'theme', content: ''},
    {id: 'factory//index', slug: 'index', source: 'theme', content: ''},
  ]);
  templates.unshift({...templates.shift(), source: 'custom', wp_id: 66});
  const result = resolveTemplateHierarchy({queryType: 'page', slug: 'about', id: 9}, templates);
  assert.equal(result.selected, 'page');
  assert.equal(result.selectedSource, 'custom');
  assert.equal(result.status, 'inventory-only');
  assert.equal(result.confidence, 'low');
});

test('navigation ownership follows template to part to wp_navigation', () => {
  const template = summarizeBlockTemplates([{
    id: 'factory//index', slug: 'index', source: 'custom',
    content: '<!-- wp:template-part {"slug":"header","theme":"factory"} /-->',
  }])[0];
  const parts = summarizeBlockTemplates([{
    id: 'factory//header', slug: 'header', area: 'header', source: 'theme',
    content: '<!-- wp:navigation {"ref":31} /-->',
  }], 'wp_template_part');
  const navigation = resolveNavigationOwnership({selectedTemplate: template, templateParts: parts});
  assert.equal(navigation.kind, 'block-navigation');
  assert.deepEqual(navigation.wpNavigationIds, [31]);
  assert.equal(navigation.navigationRefs[0].owner, 'template-part:header');
  assert.equal(navigation.selectedParts[0].status, 'selected');
  assert.equal(navigation.confidence, 'high');
});

test('missing template parts force low confidence instead of a guessed owner', () => {
  const template = summarizeBlockTemplates([{
    id: 'factory//index', slug: 'index', source: 'theme',
    content: '<!-- wp:template-part {"slug":"missing-header"} /-->',
  }])[0];
  const navigation = resolveNavigationOwnership({selectedTemplate: template, templateParts: []});
  assert.equal(navigation.kind, 'none');
  assert.equal(navigation.selectedParts[0].status, 'missing');
  assert.equal(navigation.confidence, 'low');
});

test('remote inspection records authoritative route ownership without raw content', async () => {
  const templateContent = '<!-- wp:template-part {"slug":"header","theme":"factory"} /-->';
  const partContent = '<!-- wp:navigation {"ref":31} /-->';
  const selectedContent = '<!-- wp:template-part {"slug":"header","theme":"factory"} /--><main>Body</main>';
  const exec = (command, args = []) => {
    assert.equal(command, 'ssh');
    const text = args.at(-1) || '';
    if (text.includes('theme list')) return JSON.stringify([{name: 'Factory Blocks', slug: 'factory-blocks', is_block_theme: true}]);
    if (text.includes('plugin list')) return JSON.stringify([]);
    if (text.includes('menu list')) return JSON.stringify([]);
    if (text.includes('wp_navigation')) return '[]';
    if (text.includes('get_page_templates')) return '{}';
    if (text.includes('get_block_templates([], "wp_template_part")')) {
      return JSON.stringify([{id: 'factory//header', slug: 'header', title: 'Header', area: 'header', source: 'theme', content: partContent}]);
    }
    if (text.includes('get_block_templates')) {
      return JSON.stringify([{id: 'factory//index', slug: 'index', title: 'Index', source: 'custom', wp_id: 88, content: templateContent}]);
    }
    if (text.includes('post-type list')) return JSON.stringify([{name: 'page'}, {name: 'post'}]);
    if (text.includes('taxonomy list')) return JSON.stringify([{name: 'category'}]);
    if (text.includes('post_type=attachment')) return '3';
    if (text.includes('post_type=page')) return '5';
    if (text.includes('post_type=post')) return '7';
    if (text.includes('siteurl')) return 'https://site.test';
    if (text.includes('show_on_front')) return 'page';
    if (text.includes('core version')) return '7.1';
    return '';
  };
  const inventory = await inspectRemoteWordPress({
    domain: 'site.test',
    ssh: {host: '203.0.113.10', port: '65002', user: 'u123', keyPath: '/keys/id', wpPath: '/home/u123/site'},
  }, {
    exec,
    routes: '/',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      url: 'https://site.test/?_wp-find-template=1',
      text: async () => JSON.stringify({
        success: true,
        data: {
          id: 'factory//index', slug: 'index', title: 'Index', source: 'custom', wp_id: 88,
          content: selectedContent,
        },
      }),
    }),
  });
  const route = inventory.routeShapes.routes[0];
  assert.equal(inventory.navigation, 'block-navigation');
  assert.equal(route.fseTemplate.slug, 'index');
  assert.equal(route.fseTemplate.source, 'custom');
  assert.equal(route.navigation.kind, 'block-navigation');
  assert.deepEqual(route.navigation.wpNavigationIds, [31]);
  assert.equal(route.capabilities.classicMenuWrite, false);
  assert.equal(route.confidence, 'high');
  assert.equal(JSON.stringify(inventory).includes('Body</main>'), false);
  const parsed = projectSchema.safeParse({
    title: 'Remote project', domain: 'site.test', theme: 'factory-blocks', plugin: 'external',
    remote: {...inventory},
  });
  assert.equal(parsed.success, true);
});

test('failed template-route probing returns low confidence and does not invent ownership', async () => {
  const exec = (command, args = []) => {
    assert.equal(command, 'ssh');
    const text = args.at(-1) || '';
    if (text.includes('theme list')) return JSON.stringify([{name: 'Factory Blocks', is_block_theme: true}]);
    if (text.includes('plugin list')) return JSON.stringify([]);
    if (text.includes('menu list')) return JSON.stringify([]);
    if (text.includes('wp_navigation')) return JSON.stringify([{ID: 31, post_name: 'unused', post_title: 'Unused', post_status: 'publish', post_content: ''}]);
    if (text.includes('get_page_templates')) return '{}';
    if (text.includes('get_block_templates')) {
      return JSON.stringify([{id: 'factory//index', slug: 'index', title: 'Index', source: 'theme', content: '<!-- wp:navigation {"ref":31} /-->'}]);
    }
    if (text.includes('post-type list')) return JSON.stringify([]);
    if (text.includes('taxonomy list')) return JSON.stringify([]);
    if (text.includes('post_type=')) return '0';
    if (text.includes('siteurl')) return 'https://site.test';
    if (text.includes('show_on_front')) return 'posts';
    if (text.includes('core version')) return '7.1';
    return '';
  };
  const inventory = await inspectRemoteWordPress({
    domain: 'site.test',
    ssh: {host: '203.0.113.10', port: '65002', user: 'u123', keyPath: '/keys/id', wpPath: '/home/u123/site'},
  }, {
    exec,
    routes: '/unknown/',
    fetchImpl: async () => ({ok: true, status: 200, url: 'https://site.test/', text: async () => '<html></html>'}),
  });
  const route = inventory.routeShapes.routes[0];
  assert.equal(route.fseTemplate, null);
  assert.equal(route.confidence, 'low');
  assert.deepEqual(route.problems, ['WordPress did not return a selected block template']);
  assert.equal(route.navigation.kind, 'unknown');
  assert.equal(route.capabilities.classicMenuWrite, false);
});

test('block rendering does not treat an assigned classic menu as proven classic navigation', async () => {
  const inventory = isBlockTheme => ({
    marker: 'wordpress-builder-inspection/1',
    siteUrl: 'https://site.test',
    wpVersion: '7.1',
    showOnFront: 'posts',
    theme: {name: 'Shape Theme', slug: 'shape-theme', is_block_theme: isBlockTheme},
    plugins: [],
    menus: [{
      term_id: 8, name: 'Primary', slug: 'primary', locations: ['primary'],
      items: [{db_id: 1, title: 'Home', menu_item_parent: 0, url: '/'}],
    }],
    navigationPosts: [{
      ID: 31, post_name: 'unused', post_title: 'Unused', post_status: 'publish', post_content: '',
    }],
    pageTemplates: {},
    fseTemplates: isBlockTheme ? [{id: 'shape-theme//index', slug: 'index', title: 'Index', source: 'theme', content: ''}] : [],
    fseTemplateParts: [],
    postTypes: ['page'],
    taxonomies: ['category'],
    counts: {pages: 1, posts: 0, media: 0, blockNavigationPosts: 1},
  });
  const exec = (command, args = []) => {
    assert.equal(command, 'ssh');
    assert.equal(args.at(-1).includes('wordpress-builder-inspection/1'), true);
    return JSON.stringify(inventory(true));
  };
  const project = {
    ssh: {host: '203.0.113.10', port: '65002', user: 'u123', keyPath: '/keys/id', wpPath: '/home/u123/site'},
  };
  const result = await inspectRemoteWordPress(project, {exec});
  assert.equal(result.navigation, 'unknown');
  assert.deepEqual(result.usedBlockNavigationIds, []);
  assert.equal(result.capabilities.classicMenuWrite, false);

  const classic = await inspectRemoteWordPress(project, {
    exec: command => {
      assert.equal(command, 'ssh');
      return JSON.stringify(inventory(false));
    },
  });
  assert.equal(classic.navigation, 'classic-menu');
  assert.equal(classic.capabilities.classicMenuWrite, true);
});
