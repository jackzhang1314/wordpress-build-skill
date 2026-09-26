import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import {loadProject} from './config.mjs';

const ignoredDirectoryNames = new Set([
  '.backups',
  '.git',
  '.wordpress-builder',
  'node_modules',
  'theme',
  'plugin',
  'content',
  'docs',
  'scripts',
  'evidence',
]);

function normalizeRemoteDomain(value) {
  const domain = String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain) return '';
  return domain;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function discoverInDirectory(directory, depth, maxDepth, result) {
  const entries = readdirSync(directory, {withFileTypes: true}).sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || ignoredDirectoryNames.has(entry.name)) continue;
    const child = join(directory, entry.name);
    if (existsSync(join(child, 'project.json'))) {
      try {
        const project = loadProject(child);
        result.projects.push({project, projectRoot: child});
      } catch (error) {
        result.invalidProjects.push({projectRoot: child, error: error.message});
      }
      continue;
    }
    if (depth < maxDepth) discoverInDirectory(child, depth + 1, maxDepth, result);
  }
}

export function discoverLocalProjects(projectsRoot, {maxDepth = 3} = {}) {
  const root = resolve(projectsRoot);
  const result = {root, exists: existsSync(root), projects: [], invalidProjects: []};
  if (!result.exists) return result;

  if (existsSync(join(root, 'project.json'))) {
    try {
      result.projects.push({project: loadProject(root), projectRoot: root});
    } catch (error) {
      result.invalidProjects.push({projectRoot: root, error: error.message});
    }
    return result;
  }

  discoverInDirectory(root, 1, maxDepth, result);
  return result;
}

function latestBackup(projectRoot, project) {
  const backupRoot = join(projectRoot, '.backups');
  if (!existsSync(backupRoot)) return null;

  let latest = null;
  for (const entry of readdirSync(backupRoot, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const manifest = readJson(join(backupRoot, entry.name, 'manifest.json'));
    if (!manifest || manifest.domain !== project.domain) continue;
    const candidate = {id: manifest.id ?? entry.name, createdAt: manifest.createdAt ?? null};
    if (!latest || String(candidate.createdAt ?? candidate.id) > String(latest.createdAt ?? latest.id)) latest = candidate;
  }
  return latest;
}

function latestDeploy(projectRoot, project) {
  const state = readJson(join(projectRoot, '.deploy-state.json'));
  if (!state || state.domain !== project.domain) return null;
  return {
    deployedAt: typeof state.deployedAt === 'string' ? state.deployedAt : null,
    backup: typeof state.backup === 'string' ? state.backup : null,
  };
}

function inspectionState(project, now, staleHours) {
  const inspectedAt = project.remote?.inspectedAt;
  if (!inspectedAt) return {inspectedAt: null, ageHours: null, state: 'unknown'};
  const inspectedMs = Date.parse(inspectedAt);
  if (!Number.isFinite(inspectedMs)) return {inspectedAt, ageHours: null, state: 'invalid'};
  const ageHours = Math.max(0, (now.getTime() - inspectedMs) / 3_600_000);
  return {
    inspectedAt,
    ageHours: Number(ageHours.toFixed(2)),
    state: ageHours <= staleHours ? 'fresh' : 'stale',
  };
}

function projectSummary({project, projectRoot}, projectsRoot, now, staleHours) {
  return {
    title: project.title,
    projectRoot,
    relativePath: relative(projectsRoot, projectRoot) || '.',
    mode: project.mode,
    sourceProfile: project.sourceProfile,
    configuredTheme: project.theme,
    activeTheme: project.remote?.activeTheme ?? null,
    sshConfigured: Boolean(project.ssh),
    remoteInspection: inspectionState(project, now, staleHours),
    lastBackup: latestBackup(projectRoot, project),
    lastDeploy: latestDeploy(projectRoot, project),
  };
}

export function buildSitesStatus(websites, projectsRoot, {
  now = new Date(),
  staleHours = 168,
  maxDepth = 3,
} = {}) {
  const discovery = discoverLocalProjects(projectsRoot, {maxDepth});
  const projectsByDomain = new Map();
  for (const item of discovery.projects) {
    const domain = normalizeRemoteDomain(item.project.domain);
    if (!domain) continue;
    if (!projectsByDomain.has(domain)) projectsByDomain.set(domain, []);
    projectsByDomain.get(domain).push(item);
  }

  const normalizedWebsites = websites.map(website => {
    const domain = normalizeRemoteDomain(website.domain);
    const matches = projectsByDomain.get(domain) ?? [];
    const localProjects = matches
      .map(item => projectSummary(item, discovery.root, now, staleHours));
    return {
      domain,
      url: `https://${domain}`,
      username: website.username ?? null,
      orderId: website.order_id ?? null,
      enabled: website.is_enabled !== false,
      websiteType: website.website_type ?? null,
      rootDirectory: website.root_directory ?? null,
      matchState: localProjects.length === 0 ? 'unmatched' : (localProjects.length === 1 ? 'unique' : 'ambiguous'),
      localProjects,
    };
  });

  const matchedDomains = new Set(normalizedWebsites.filter(website => website.localProjects.length > 0).map(website => website.domain));
  const localOnlyProjects = discovery.projects
    .filter(({project}) => {
      const domain = normalizeRemoteDomain(project.domain);
      return domain && !matchedDomains.has(domain);
    })
    .map(item => projectSummary(item, discovery.root, now, staleHours));

  return {
    pass: true,
    projectsRoot: discovery.root,
    projectsRootExists: discovery.exists,
    staleHours,
    websites: normalizedWebsites,
    localOnlyProjects,
    invalidProjects: discovery.invalidProjects,
    summary: {
      remoteCount: normalizedWebsites.length,
      matchedRemoteCount: normalizedWebsites.filter(website => website.localProjects.length > 0).length,
      unmatchedRemoteCount: normalizedWebsites.filter(website => website.localProjects.length === 0).length,
      ambiguousRemoteCount: normalizedWebsites.filter(website => website.localProjects.length > 1).length,
      localProjectCount: discovery.projects.length,
      localOnlyProjectCount: localOnlyProjects.length,
      invalidProjectCount: discovery.invalidProjects.length,
    },
  };
}
