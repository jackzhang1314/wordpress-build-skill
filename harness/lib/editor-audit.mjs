import {existsSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

const ALLOWED_BLOCK_TYPES = new Set([
  'heading', 'paragraph', 'list', 'image', 'button', 'section', 'columns',
  'column', 'table', 'faq', 'form', 'catalog', 'shortcode',
]);

export function auditEditorPatterns(projectRoot, project = {}) {
  const configured = project.cms?.editorPatterns ?? 'config/editor-block-patterns.json';
  const path = join(resolve(projectRoot), configured);
  const problems = [];
  const checks = [];
  let patterns;

  if (!existsSync(path)) {
    return {name: 'editor-patterns', pass: false, checks: [{name: 'patterns-file', pass: false, detail: 'missing'}]};
  }
  try {
    patterns = JSON.parse(readFileSync(path, 'utf8'));
    checks.push({name: 'patterns-file', pass: true});
  } catch (error) {
    return {name: 'editor-patterns', pass: false, checks: [{name: 'patterns-json', pass: false, detail: error.message}]};
  }

  const names = Object.keys(patterns.patterns ?? {});
  checks.push({name: 'patterns-count', pass: names.length > 0, count: names.length});
  if (!names.length) problems.push({name: 'patterns', issue: 'no editor patterns defined'});

  const seen = new Set();
  for (const [name, blocks] of Object.entries(patterns.patterns ?? {})) {
    if (seen.has(name)) problems.push({name, issue: 'duplicate pattern'});
    seen.add(name);
    let count = 0;
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (typeof node.type === 'string') {
        count++;
        if (!ALLOWED_BLOCK_TYPES.has(node.type)) {
          problems.push({name, issue: `unsupported editor module: ${node.type}`});
        }
      }
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') walk(value);
      }
    };
    walk(blocks);
    checks.push({name: `pattern:${name}`, pass: count > 0, blocks: count});
  }

  return {name: 'editor-patterns', pass: problems.length === 0, checks, problems};
}
