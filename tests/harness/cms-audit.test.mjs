import assert from 'node:assert/strict';
import test from 'node:test';
import {auditCmsModel, cmsAuditPhp} from '../../harness/lib/cms-audit.mjs';

const project = {
  contentCounts: [
    {label: 'Products', postType: 'starter_product'},
    {label: 'Product categories', postType: 'product_collection', kind: 'term'},
  ],
};

function validRemote() {
  return {
    postTypes: {
      starter_product: {
        public: true, rest: true, supports: ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
        labels: {name: 'Products', singular_name: 'Product', menu_name: 'Products', all_items: 'All Products', edit_item: 'Edit Product', add_new_item: 'Add Product', search_items: 'Search Products'},
      },
    },
    taxonomies: {
      product_collection: {
        public: true, rest: true, hierarchical: true,
        labels: {name: 'Categories', singular_name: 'Category', menu_name: 'Categories', all_items: 'All', edit_item: 'Edit', add_new_item: 'Add'},
        object_type: ['starter_product'],
      },
    },
    groups: [{
      key: 'group_product', title: 'Product', active: true,
      locations: [[{param: 'post_type', operator: '==', value: 'starter_product'}]],
      fields: [{name: 'summary', key: 'field_summary', label: 'Summary', type: 'textarea', instructions: 'Use plain text.', rest: true}],
    }],
    posts: {starter_product: [{id: 1, slug: 'product-one', title: 'Product One', status: 'publish', values: {summary: 'Ready'}}]},
    terms: [{taxonomy: 'product_collection', id: 2, slug: 'industrial', name: 'Industrial', values: {}}],
    options: {},
    pages: [{id: 1, slug: 'home', title: 'Home', status: 'publish', template: '', is_front: true, is_posts_page: false}],
    settings: {pageOnFront: 1, pageForPosts: 2, showOnFront: 'page'},
  };
}

test('CMS model audit passes a complete editable model', () => {
  const report = auditCmsModel(validRemote(), project);
  assert.equal(report.pass, true);
  assert.equal(report.problems.length, 0);
});

test('CMS model audit catches REST, labels, instructions and orphan meta', () => {
  const remote = validRemote();
  remote.postTypes.starter_product.rest = false;
  remote.taxonomies.product_collection.labels.edit_item = '';
  remote.groups[0].fields[0].instructions = '';
  remote.posts.starter_product[0].values.legacy = 'orphan';
  const report = auditCmsModel(remote, project);
  assert.equal(report.pass, false);
  const issues = report.problems.map(problem => problem.issue).join(' ');
  assert.match(issues, /REST access is disabled/);
  assert.match(issues, /missing admin label: edit_item/);
  assert.match(issues, /admin instructions are empty/);
  assert.match(issues, /stored value has no editable ACF definition/);
});

test('third-party SEO meta is excluded from ACF orphan checks', () => {
  const remote = validRemote();
  remote.posts.starter_product[0].values.rank_math_seo_score = 80;
  const report = auditCmsModel(remote, project);
  assert.equal(report.pass, true);
});

test('audit PHP is a WP-CLI payload with ABSPATH guard', () => {
  assert.match(cmsAuditPhp(), /^<\?php/);
  assert.match(cmsAuditPhp(), /defined\('ABSPATH'\)/);
});
