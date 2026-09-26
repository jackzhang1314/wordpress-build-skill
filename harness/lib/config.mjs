import {existsSync, readFileSync} from 'node:fs';
import {isAbsolute, join, resolve} from 'node:path';
import {z} from 'zod';

export const slug = /^[a-z0-9][a-z0-9-]*$/;

export const projectSchema = z.object({
  title: z.string().min(2),
  mode: z.enum(['source', 'external']).default('source'),
  sourceProfile: z.enum(['starter', 'custom']).default('custom'),
  description: z.string().default(''),
  timezone: z.string().default(''),
  slug: z.string().regex(slug).optional(),
  type: z.string().default('wordpress-b2b'),
  domain: z.string().regex(/^$|^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i),
  theme: z.string().regex(slug),
  plugin: z.string().regex(slug),
  pluginMain: z.string().regex(/^[a-z0-9][a-z0-9._-]*\.php$/).optional(),
  livePages: z.array(z.string().regex(/^\/|^#\w+$/)).min(1).default(['/']),
  routeCount: z.number().int().positive().optional(),
  screenshotModes: z.object({
    smoke: z.array(z.string().min(1)).optional(),
    templates: z.array(z.string().min(1)).optional(),
    full: z.array(z.string().min(1)).optional(),
  }).optional(),
  contentMarkers: z.array(z.string().min(1)).default([]),
  contentCounts: z.array(z.object({
    label: z.string().min(1),
    postType: z.string().regex(/^[a-z0-9_-]+$/),
    expected: z.number().int().min(0).optional(),
    kind: z.enum(['post', 'term']).default('post'),
  })).default([]),
  requiredPlugins: z.array(z.string().regex(/^[a-z0-9-]+$/)).default(['advanced-custom-fields', 'seo-by-rank-math', 'fluentform', 'classic-editor']),
  disabledPlugins: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  ssh: z.object({
    host: z.string().min(1),
    port: z.string().regex(/^\d+$/).default('22'),
    user: z.string().min(1),
    keyPath: z.string().min(1),
    wpPath: z.string().startsWith('/'),
  }).optional(),
  hostinger: z.object({
    user: z.string().min(1),
    order: z.number().int().positive().optional(),
    adminUser: z.string().min(1).default('codexadmin'),
    adminEmail: z.string().email().optional(),
    datacenter: z.string().min(1).optional(),
  }).optional(),
  media: z.object({
    sources: z.array(z.object({
      name: z.string().regex(slug),
      path: z.string().min(1),
    })).default([]),
  }).default({sources: []}),
  seed: z.object({
    enabled: z.boolean().default(false),
    script: z.string().default('scripts/seed.php'),
    data: z.string().default('content/site-data.json'),
  }).default({enabled: false, script: 'scripts/seed.php', data: 'content/site-data.json'}),
  seo: z.object({
    organization: z.string().min(1).optional(),
    postTypes: z.array(z.object({
      name: z.string().regex(/^[a-z0-9_-]+$/),
      sitemap: z.boolean().default(true),
      metaBox: z.boolean().default(true),
      richSnippet: z.enum(['off','article','product']).default('off'),
    })).default([]),
    taxonomies: z.array(z.object({
      name: z.string().regex(/^[a-z0-9_-]+$/),
      sitemap: z.boolean().default(true),
      metaBox: z.boolean().default(true),
      richSnippet: z.enum(['off','article','product']).default('off'),
    })).default([]),
    noindex: z.array(z.string().regex(/^[a-z0-9_-]+$/)).default([]),
  }).default({}),
  cms: z.object({
    editorPatterns: z.string().default('config/editor-block-patterns.json'),
  }).optional(),
  remote: z.object({
    siteUrl: z.string().optional(),
    wpVersion: z.string().optional(),
    activeTheme: z.string().optional(),
    plugins: z.array(z.string()).default([]),
    themeType: z.enum(['classic', 'block', 'hybrid', 'unknown']).optional(),
    renderingSystem: z.enum(['classic-php', 'block-fse', 'page-builder', 'hybrid', 'unknown']).optional(),
    authoringSystems: z.array(z.string()).default([]),
    pageBuilder: z.string().nullable().optional(),
    navigation: z.enum(['classic-menu', 'block-navigation', 'mixed', 'unknown']).optional(),
    pageTemplates: z.enum(['classic', 'fse', 'mixed', 'none', 'unknown']).optional(),
    publicPostTypes: z.array(z.string()).default([]),
    publicTaxonomies: z.array(z.string()).default([]),
    menus: z.array(z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      locations: z.array(z.string()).default([]),
    })).default([]),
    forms: z.object({
      fluentform: z.boolean().default(false),
    }).default({}),
    counts: z.object({
      pages: z.number().default(0),
      posts: z.number().default(0),
      media: z.number().default(0),
      blockNavigationPosts: z.number().default(0),
    }).default({}),
    routeShapes: z.object({
      mode: z.enum(['explicit', 'core']),
      routes: z.array(z.object({
        route: z.string().min(1),
        queryType: z.string().min(1),
        hierarchy: z.object({
          candidates: z.array(z.string()),
          matches: z.array(z.string()),
          selected: z.string().nullable(),
          selectedSource: z.string().nullable(),
          status: z.string().min(1),
          confidence: z.enum(['high', 'medium', 'low', 'unknown']),
          reason: z.string().min(1),
        }),
        request: z.object({
          ok: z.boolean(),
          status: z.number(),
          finalUrl: z.string().optional(),
        }).nullable(),
        fseTemplate: z.object({
          type: z.string().min(1),
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          source: z.string().min(1),
          wpId: z.number().nullable(),
          status: z.string().min(1),
          contentHash: z.string().min(8),
          templateParts: z.array(z.object({
            slug: z.string().min(1),
            theme: z.string().optional(),
            tagName: z.string().optional(),
          })),
          navigationRefs: z.array(z.number()),
          inlineNavigationBlocks: z.number(),
          invalidBlockAttributes: z.number(),
        }).nullable(),
        templateParts: z.array(z.object({
          slug: z.string().min(1),
          area: z.string().optional(),
          source: z.string().min(1),
          status: z.string().min(1),
          navigationRefs: z.array(z.number()),
          inlineNavigationBlocks: z.number(),
          confidence: z.enum(['high', 'medium', 'low', 'unknown']),
          theme: z.string().optional(),
        })),
        navigation: z.object({
          kind: z.enum(['classic-menu', 'block-navigation', 'mixed', 'none', 'unknown']),
          classicMenuIds: z.array(z.number()),
          wpNavigationIds: z.array(z.number()),
          navigationRefs: z.array(z.object({
            id: z.number(),
            owner: z.string(),
            source: z.string(),
            confidence: z.enum(['high', 'medium', 'low', 'unknown']),
          })),
          inlineNavigationBlocks: z.number(),
          selectedParts: z.array(z.object({
            slug: z.string().min(1),
            area: z.string().optional(),
            source: z.string().optional(),
            status: z.string().min(1),
            navigationRefs: z.array(z.number()).optional(),
            inlineNavigationBlocks: z.number().optional(),
            confidence: z.enum(['high', 'medium', 'low', 'unknown']).optional(),
            theme: z.string().optional(),
            tagName: z.string().optional(),
          })),
          owners: z.array(z.object({
            kind: z.string(),
            owner: z.string(),
            source: z.string(),
            confidence: z.enum(['high', 'medium', 'low', 'unknown']),
          })),
          confidence: z.enum(['high', 'medium', 'low', 'unknown']),
        }),
        capabilities: z.object({
          classicMenuWrite: z.boolean(),
          blockNavigationRead: z.boolean(),
          classicPageTemplateAssign: z.boolean(),
          fseTemplateInspection: z.boolean(),
        }),
        confidence: z.enum(['high', 'medium', 'low', 'unknown']),
        problems: z.array(z.string()),
      })).default([]),
      fetchedAt: z.string().min(1),
    }).optional(),
    inspectedAt: z.string().optional(),
  }).optional(),
  paths: z.object({
    theme: z.string().default('theme'),
    plugin: z.string().default('plugin'),
    content: z.string().default('content'),
  }).default({theme: 'theme', plugin: 'plugin', content: 'content'}),
});

export function normalizeLegacyProject(raw) {
  const value = {...raw};
  value.slug ??= value.slug ?? raw.slug ?? slugify(raw.title ?? '');
  if (raw.sourceProfile === undefined) {
    const required = value.requiredPlugins ?? [];
    const looksLikeLegacyStarter = value.mode !== 'external'
      && required.includes('advanced-custom-fields')
      && required.includes('seo-by-rank-math')
      && required.includes('fluentform')
      && required.includes('classic-editor')
      && Number.isFinite(Number(raw.routeCount));
    value.sourceProfile = looksLikeLegacyStarter ? 'starter' : 'custom';
  }
  if (!value.theme && raw.themeName) value.theme = raw.themeName;
  if (!value.plugin && raw.pluginSlug) value.plugin = raw.pluginSlug;
  if (raw.partPostType && !value.contentCounts?.some(item => item.postType === raw.partPostType)) {
    value.contentCounts = [
      {label: 'Products', postType: raw.partPostType},
      ...(raw.guidePostType ? [{label: 'Guides', postType: raw.guidePostType}] : []),
      ...(raw.rfqPostType ? [{label: 'RFQ', postType: raw.rfqPostType}] : []),
      ...(value.contentCounts ?? []),
    ];
  }
  return value;
}

export function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function resolveProjectRoot(candidate = process.env.WORDPRESS_PROJECT_ROOT || process.cwd()) {
  const root = resolve(candidate);
  const hasProject = existsSync(join(root, 'project.json'));
  const hasExample = existsSync(join(root, 'project.example.json'));
  if (!hasProject && !hasExample) {
    throw new Error(`project.json not found in ${root}. Use --project <site-directory>.`);
  }
  return root;
}

export function loadProject(projectRoot) {
  const root = resolve(projectRoot);
  const projectPath = join(root, 'project.json');
  const examplePath = join(root, 'project.example.json');
  // Starter checkouts ship only project.example.json; allow local gates to run
  // against it as long as no write-state command depends on real SSH.
  const usedPath = existsSync(projectPath) ? projectPath : (existsSync(examplePath) ? examplePath : projectPath);
  const raw = JSON.parse(readFileSync(usedPath, 'utf8'));
  const parsed = projectSchema.safeParse(normalizeLegacyProject(raw));
  if (!parsed.success) {
    const detail = parsed.error.issues.map(issue => `${issue.path.join('.') || 'project'}: ${issue.message}`).join('; ');
    throw new Error(`Invalid project.json: ${detail}`);
  }
  const project = parsed.data;
  project.slug ??= slugify(project.title);
  project.pluginMain ??= `${project.plugin}.php`;
  if (project.ssh) project.ssh.keyPath = resolve(root, project.ssh.keyPath);
  project._projectFile = usedPath;
  project._isExample = usedPath === examplePath && !existsSync(projectPath);
  return project;
}

export function projectFile(projectRoot, relativePath) {
  return isAbsolute(relativePath) ? relativePath : join(projectRoot, relativePath);
}

export function validateConfigFile(path) {
  try {
    const raw = normalizeLegacyProject(JSON.parse(readFileSync(path, 'utf8')));
    return projectSchema.safeParse(raw);
  } catch (error) {
    return {success: false, error: {issues: [{path: [], message: error.message}]}};
  }
}
