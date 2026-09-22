import test from 'node:test';
import assert from 'node:assert/strict';
import {rankMathConfig} from '../../harness/lib/seo.mjs';

test('Rank Math config derives content types and keeps approved modules only', () => {
  const config = rankMathConfig({
    title: 'Demo',
    contentCounts: [{label: 'Parts', postType: 'demo_part'}, {label: 'RFQ', postType: 'demo_rfq'}],
    seo: {
      organization: 'Demo Org',
      postTypes: [{name: 'demo_part'}, {name: 'demo_guide', richSnippet: 'article'}],
      taxonomies: [{name: 'demo_family'}],
      noindex: ['demo_archive'],
    },
  });
  assert.deepEqual(config.modules, ['sitemap', 'rich-snippet', 'acf', 'redirections', '404-monitor']);
  assert.deepEqual(config.postTypes.map(type => type.name), ['demo_part', 'demo_guide', 'post', 'page']);
  assert.equal(config.postTypes.find(type => type.name === 'demo_guide').richSnippet, 'article');
  assert.deepEqual(config.taxonomies.map(taxonomy => taxonomy.name), ['demo_family']);
});

test('Rank Math default includes post and page without private RFQ models', () => {
  const config = rankMathConfig({title: 'Demo', contentCounts: [{label: 'RFQ', postType: 'demo_rfq'}]});
  assert.deepEqual(config.postTypes.map(type => type.name), ['post', 'page']);
});
