import {createHash} from 'node:crypto';

const BLOCK_COMMENT = /<!--\s*wp:([a-z][a-z0-9-]*)\s*(\{[\s\S]*?\})?\s*(?:\/)?-->/g;

function parseAttributes(raw) {
  if (!raw) return {value: {}, valid: true};
  try {
    const value = JSON.parse(raw);
    return {value: value && typeof value === 'object' && !Array.isArray(value) ? value : {}, valid: true};
  } catch {
    return {value: {}, valid: false};
  }
}

function uniqueNumbers(values) {
  return [...new Set(values.map(Number).filter(value => Number.isInteger(value) && value > 0))];
}

function ownerPath(kind, slug) {
  return `${kind}:${slug}`;
}

function templatePartReference(attributes) {
  const slug = String(attributes.slug ?? '').trim();
  if (!slug) return null;
  return {
    slug,
    ...(attributes.theme ? {theme: String(attributes.theme)} : {}),
    ...(attributes.tagName ? {tagName: String(attributes.tagName)} : {}),
  };
}

/**
 * Parse structural references from WordPress block markup.
 *
 * This deliberately returns references and counts, never the source content. Route
 * diagnostics can therefore be persisted without turning project.json into a template
 * backup.
 */
export function parseTemplateContent(content) {
  const source = String(content ?? '');
  const references = {templateParts: [], navigationRefs: [], inlineNavigationBlocks: 0, invalidBlockAttributes: 0};
  for (const match of source.matchAll(BLOCK_COMMENT)) {
    const blockName = match[1];
    const attributes = parseAttributes(match[2]);
    if (!attributes.valid) references.invalidBlockAttributes += 1;

    if (blockName === 'template-part') {
      const part = templatePartReference(attributes.value);
      if (part) references.templateParts.push(part);
      else references.invalidBlockAttributes += 1;
    } else if (blockName === 'navigation' || blockName === 'navigation-ref') {
      const ref = Number(attributes.value.ref);
      if (Number.isInteger(ref) && ref > 0) references.navigationRefs.push(ref);
      else if (blockName === 'navigation') references.inlineNavigationBlocks += 1;
    }
  }
  references.navigationRefs = uniqueNumbers(references.navigationRefs);
  return references;
}

export function stableContentHash(content) {
  return createHash('sha256').update(String(content ?? ''), 'utf8').digest('hex').slice(0, 16);
}

export function fullContentHash(content) {
  return createHash('sha256').update(String(content ?? ''), 'utf8').digest('hex');
}

function summarizeTemplate(template, type) {
  const content = String(template.content ?? '');
  const parsed = parseTemplateContent(content);
  const title = template.title && typeof template.title === 'object'
    ? String(template.title.rendered ?? template.title.raw ?? '')
    : String(template.title ?? '');
  return {
    type,
    id: String(template.id ?? ''),
    slug: String(template.slug ?? ''),
    title,
    source: String(template.source ?? 'theme'),
    ...(type === 'wp_template_part' ? {area: String(template.area ?? '')} : {}),
    wpId: Number.isInteger(Number(template.wp_id)) && Number(template.wp_id) > 0 ? Number(template.wp_id) : null,
    status: 'available',
    contentHash: stableContentHash(content),
    templateParts: parsed.templateParts,
    navigationRefs: parsed.navigationRefs,
    inlineNavigationBlocks: parsed.inlineNavigationBlocks,
    invalidBlockAttributes: parsed.invalidBlockAttributes,
  };
}

export function summarizeBlockTemplates(templates, type = 'wp_template') {
  return (Array.isArray(templates) ? templates : []).map(template => summarizeTemplate(template, type));
}

export function templateCandidateSlugs({
  queryType,
  postType = '',
  slug = '',
  id = 0,
  taxonomy = '',
  assignedTemplate = '',
  showOnFront = 'posts',
} = {}) {
  switch (queryType) {
    case 'front-page':
      return showOnFront === 'page' ? ['front-page', 'index'] : ['home', 'index'];
    case 'home':
      return ['home', 'index'];
    case 'page':
      return [
        ...(assignedTemplate ? [assignedTemplate] : []),
        ...(slug ? [`page-${slug}`] : []),
        ...(id ? [`page-${id}`] : []),
        'page',
        'singular',
        'index',
      ];
    case 'post':
    case 'single':
      return [
        ...(assignedTemplate ? [assignedTemplate] : []),
        ...(postType && slug ? [`single-${postType}-${slug}`] : []),
        ...(postType ? [`single-${postType}`] : []),
        'single',
        'singular',
        'index',
      ];
    case 'cpt-single':
      return [
        ...(assignedTemplate ? [assignedTemplate] : []),
        ...(postType && slug ? [`single-${postType}-${slug}`] : []),
        ...(postType ? [`single-${postType}`] : []),
        'single',
        'index',
      ];
    case 'cpt-archive':
      return [...(postType ? [`archive-${postType}`] : []), 'archive', 'index'];
    case 'category':
      return [
        ...(slug ? [`category-${slug}`] : []),
        ...(id ? [`category-${id}`] : []),
        'category',
        'taxonomy',
        'archive',
        'index',
      ];
    case 'taxonomy':
      return [
        ...(taxonomy && slug ? [`taxonomy-${taxonomy}-${slug}`] : []),
        ...(taxonomy ? [`taxonomy-${taxonomy}`] : []),
        'taxonomy',
        'archive',
        'index',
      ];
    case 'search':
      return ['search', 'index'];
    case '404':
      return ['404', 'index'];
    default:
      return ['index'];
  }
}

/**
 * Build an inventory-only candidate hierarchy. This is useful as explanatory context,
 * but it is intentionally low confidence: WordPress must still resolve the real route.
 */
export function resolveTemplateHierarchy(context, templates = []) {
  const candidates = templateCandidateSlugs(context);
  const available = new Map();
  for (const template of templates) {
    if (!template.slug) continue;
    const existing = available.get(template.slug);
    if (!existing || template.source === 'custom') available.set(template.slug, template);
  }
  const matches = candidates.map(slug => available.get(slug)).filter(Boolean);
  return {
    candidates,
    matches: matches.map(template => template.slug),
    selected: matches[0]?.slug ?? null,
    selectedSource: matches[0]?.source ?? null,
    status: matches.length ? 'inventory-only' : 'no-match',
    confidence: 'low',
    reason: 'WordPress route resolution was not observed; inventory cannot prove ownership',
  };
}

function findTemplatePart(reference, parts) {
  return parts.find(part => part.slug === reference.slug
    && (!reference.theme || !part.id || part.id.startsWith(`${reference.theme}//`)));
}

export function resolveNavigationOwnership({
  selectedTemplate,
  templateParts = [],
  classicMenus = [],
  renderingSystem = 'unknown',
}) {
  const fseSelected = Boolean(selectedTemplate);
  const owners = [];
  const navigationReferences = [];
  const selectedParts = [];

  for (const navigationRef of selectedTemplate?.navigationRefs ?? []) {
    navigationReferences.push({
      id: navigationRef,
      owner: ownerPath('template', selectedTemplate.slug),
      source: selectedTemplate.source,
      confidence: 'high',
    });
  }
  if (selectedTemplate?.inlineNavigationBlocks) {
    owners.push({
      kind: 'inline-navigation',
      owner: ownerPath('template', selectedTemplate.slug),
      source: selectedTemplate.source,
      confidence: 'high',
    });
  }

  for (const reference of selectedTemplate?.templateParts ?? []) {
    const part = findTemplatePart(reference, templateParts);
    if (!part) {
      selectedParts.push({...reference, status: 'missing', confidence: 'low'});
      continue;
    }
    const partNavigationRefs = part.navigationRefs.map(id => ({
      id,
      owner: ownerPath('template-part', part.slug),
      source: part.source,
      confidence: 'high',
    }));
    navigationReferences.push(...partNavigationRefs);
    if (part.inlineNavigationBlocks) {
      owners.push({
        kind: 'inline-navigation',
        owner: ownerPath('template-part', part.slug),
        source: part.source,
        confidence: 'high',
      });
    }
    selectedParts.push({
      slug: part.slug,
      area: part.area,
      source: part.source,
      status: 'selected',
      navigationRefs: part.navigationRefs,
      inlineNavigationBlocks: part.inlineNavigationBlocks,
      invalidBlockAttributes: part.invalidBlockAttributes,
      confidence: 'high',
    });
  }

  const assignedClassicMenus = classicMenus.filter(menu => (menu.locations ?? []).length > 0);
  const hasBlockNavigation = navigationReferences.length > 0 || owners.length > 0;
  let kind = 'unknown';
  if (fseSelected) kind = hasBlockNavigation ? 'block-navigation' : 'none';
  else if (hasBlockNavigation && assignedClassicMenus.length) kind = 'mixed';
  else if (hasBlockNavigation) kind = 'block-navigation';
  else if (assignedClassicMenus.length && ['classic-php', 'page-builder', 'hybrid', 'unknown'].includes(renderingSystem)) kind = 'classic-menu';

  const missingPart = selectedParts.some(part => part.status === 'missing');
  const invalidMarkup = Boolean(selectedTemplate?.invalidBlockAttributes)
    || selectedParts.some(part => part.status === 'missing' || part.invalidBlockAttributes > 0);
  let confidence = fseSelected ? 'high' : 'medium';
  if (selectedTemplate?.status === 'fallback' || selectedTemplate?.confidence === 'low' || missingPart || invalidMarkup) confidence = 'low';

  const uniqueNavigationReferences = [];
  for (const reference of navigationReferences) {
    if (!uniqueNavigationReferences.some(item => item.id === reference.id && item.owner === reference.owner)) {
      uniqueNavigationReferences.push(reference);
    }
  }

  return {
    kind,
    classicMenuIds: assignedClassicMenus.map(menu => menu.id),
    wpNavigationIds: uniqueNavigationReferences.map(reference => reference.id),
    navigationRefs: uniqueNavigationReferences,
    inlineNavigationBlocks: selectedTemplate?.inlineNavigationBlocks ?? 0,
    selectedParts,
    owners,
    confidence,
  };
}

export function routeCapabilities({navigation, fseSelected, sitePageTemplates = 'unknown', renderingSystem = 'unknown'}) {
  const confidentNavigation = navigation.confidence === 'high' || navigation.confidence === 'medium';
  return {
    classicMenuWrite: !fseSelected && renderingSystem === 'classic-php' && navigation.kind === 'classic-menu' && confidentNavigation,
    blockNavigationRead: navigation.kind === 'block-navigation' || navigation.kind === 'mixed',
    classicPageTemplateAssign: !fseSelected && renderingSystem === 'classic-php' && ['classic', 'mixed'].includes(sitePageTemplates),
    fseTemplateInspection: fseSelected,
  };
}

export function parseNavigationPostContent(content) {
  const source = String(content ?? '');
  const links = [];
  const unsupportedBlocks = [];
  let cursor = 0;
  for (const match of source.matchAll(BLOCK_COMMENT)) {
    const prefix = source.slice(cursor, match.index);
    if (prefix.trim()) unsupportedBlocks.push({type: 'text', value: prefix.trim()});
    cursor = match.index + match[0].length;
    const attributes = parseAttributes(match[2]);
    if (match[1] !== 'navigation-link' || !attributes.valid) {
      unsupportedBlocks.push({type: match[1], reason: attributes.valid ? 'unsupported-block' : 'invalid-attributes'});
      continue;
    }
    const label = String(attributes.value.label ?? '').trim();
    const url = String(attributes.value.url ?? '').trim();
    const lockedOrBound = attributes.value.lock !== undefined
      || attributes.value.templateLock !== undefined
      || attributes.value.metadata !== undefined;
    if (!label || !url || lockedOrBound) {
      unsupportedBlocks.push({type: 'navigation-link', reason: !label || !url ? 'missing-label-or-url' : 'locked-or-bound'});
      continue;
    }
    links.push({label, url});
  }
  if (source.slice(cursor).trim()) unsupportedBlocks.push({type: 'text', value: source.slice(cursor).trim()});
  return {
    supported: links.length > 0 && unsupportedBlocks.length === 0,
    links,
    unsupportedBlocks,
  };
}

function navigationJsonAttributes(value) {
  return JSON.stringify(value)
    .replaceAll('--', '\\u002d\\u002d')
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}

export function buildNavigationPostContent(links) {
  const normalized = links.map(link => ({
    label: String(link.label ?? '').trim(),
    url: String(link.url ?? '').trim(),
  }));
  if (normalized.length === 0 || normalized.length > 20) throw new Error('block navigation requires 1-20 links');
  if (normalized.some(link => !link.label || !link.url)) throw new Error('every block navigation link needs a label and URL');
  if (new Set(normalized.map(link => link.label)).size !== normalized.length) throw new Error('block navigation labels must be unique');
  if (new Set(normalized.map(link => link.url)).size !== normalized.length) throw new Error('block navigation URLs must be unique');
  return normalized.map(link => `<!-- wp:navigation-link ${navigationJsonAttributes({
    label: link.label,
    url: link.url,
    kind: 'custom',
  })} /-->`).join('\n') + '\n';
}

export function validateBlockMarkup(content) {
  const source = String(content ?? '');
  if (!source.trim()) return {valid: false, reason: 'empty-content'};
  if (/<\?php|<\?=|<\?[\s]/i.test(source)) return {valid: false, reason: 'php-not-allowed'};
  const comment = /<!--\s*(\/?)wp:([a-z][a-z0-9-]*)([\s\S]*?)-->/g;
  const stack = [];
  let count = 0;
  for (const match of source.matchAll(comment)) {
    count += 1;
    const [, closing, name, attributes] = match;
    if (closing) {
      if (stack.at(-1) !== name) {
        return {valid: false, reason: `unexpected-close:${name}`};
      }
      stack.pop();
      continue;
    }
    if (!String(attributes ?? '').trimEnd().endsWith('/')) stack.push(name);
  }
  if (count === 0) return {valid: false, reason: 'no-block-markup'};
  if (stack.length) return {valid: false, reason: `unclosed-block:${stack.at(-1)}`};
  return {valid: true, reason: 'ok'};
}

export function patchBlockTemplateContent(content, find, replace) {
  const source = String(content ?? '');
  const target = String(find ?? '');
  const replacement = String(replace ?? '');
  if (!target || !replacement) throw new Error('template patch requires non-empty find and replace values');
  if (target === replacement) throw new Error('template patch replace value is identical to find value');
  const first = source.indexOf(target);
  if (first < 0) throw new Error('template patch target was not found');
  if (source.indexOf(target, first + target.length) >= 0) throw new Error('template patch target must be unique');
  const patched = source.slice(0, first) + replacement + source.slice(first + target.length);
  const validation = validateBlockMarkup(patched);
  if (!validation.valid) throw new Error(`patched template markup is invalid: ${validation.reason}`);
  return {
    content: patched,
    beforeHash: fullContentHash(source),
    afterHash: fullContentHash(patched),
  };
}
