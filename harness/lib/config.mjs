import {existsSync, readFileSync} from 'node:fs';
import {isAbsolute, join, resolve} from 'node:path';
import {z} from 'zod';

export const slug = /^[a-z0-9][a-z0-9-]*$/;

export const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().default(''),
  timezone: z.string().default(''),
  slug: z.string().regex(slug).optional(),
  type: z.string().default('wordpress-b2b'),
  domain: z.string().regex(/^$|^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i),
  theme: z.string().regex(slug),
  plugin: z.string().regex(slug),
  pluginMain: z.string().regex(/^[a-z0-9][a-z0-9._-]*\.php$/).optional(),
  livePages: z.array(z.string().regex(/^\/|^#\w+$/)).min(1).default(['/']),
  contentMarkers: z.array(z.string().min(1)).default([]),
  contentCounts: z.array(z.object({
    label: z.string().min(1),
    postType: z.string().regex(/^[a-z0-9_-]+$/),
    expected: z.number().int().min(0).optional(),
    kind: z.enum(['post', 'term']).default('post'),
  })).default([]),
  requiredPlugins: z.array(z.string().regex(/^[a-z0-9-]+$/)).default(['advanced-custom-fields', 'seo-by-rank-math']),
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
  paths: z.object({
    theme: z.string().default('theme'),
    plugin: z.string().default('plugin'),
    content: z.string().default('content'),
  }).default({theme: 'theme', plugin: 'plugin', content: 'content'}),
});

export function normalizeLegacyProject(raw) {
  const value = {...raw};
  value.slug ??= value.slug ?? raw.slug ?? slugify(raw.title ?? '');
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
  if (!existsSync(join(root, 'project.json'))) {
    throw new Error(`project.json not found in ${root}. Use --project <site-directory>.`);
  }
  return root;
}

export function loadProject(projectRoot) {
  const root = resolve(projectRoot);
  const raw = JSON.parse(readFileSync(join(root, 'project.json'), 'utf8'));
  const parsed = projectSchema.safeParse(normalizeLegacyProject(raw));
  if (!parsed.success) {
    const detail = parsed.error.issues.map(issue => `${issue.path.join('.') || 'project'}: ${issue.message}`).join('; ');
    throw new Error(`Invalid project.json: ${detail}`);
  }
  const project = parsed.data;
  project.slug ??= slugify(project.title);
  project.pluginMain ??= `${project.plugin}.php`;
  if (project.ssh) project.ssh.keyPath = resolve(root, project.ssh.keyPath);
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
