import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject, projectSchema, normalizeLegacyProject} from '../../harness/lib/config.mjs';

test('project schema applies safe defaults and accepts minimal new projects', () => {
  const parsed = projectSchema.safeParse({
    title: 'Demo Site', theme: 'demo-theme', plugin: 'demo-model', domain: '',
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.paths.theme, 'theme');
  assert.deepEqual(parsed.data.requiredPlugins, ['advanced-custom-fields', 'seo-by-rank-math', 'fluentform', 'classic-editor']);
});

test('legacy project fields are normalized into generic content counts', () => {
  const normalized = normalizeLegacyProject({
    title: 'Legacy', themeName: 'legacy-theme', pluginSlug: 'legacy-model',
    partPostType: 'legacy_part', guidePostType: 'legacy_guide', rfqPostType: 'legacy_rfq',
  });
  assert.equal(normalized.theme, 'legacy-theme');
  assert.deepEqual(normalized.contentCounts.map(item => item.postType), ['legacy_part', 'legacy_guide', 'legacy_rfq']);
});

test('loadProject resolves key paths and rejects unsafe slugs', () => {
  const project = loadProject('/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/irontrack-parts');
  assert.equal(project.title, 'IRONTRACK PARTS');
  assert.equal(project.pluginMain, 'site-model.php');
  assert.equal(projectSchema.safeParse({title: 'Bad', theme: 'Bad', plugin: 'x', domain: ''}).success, false);
});
