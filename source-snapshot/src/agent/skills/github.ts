import { z } from 'zod';
import { parseSkill } from './import';
import { MAX_PACKAGE, safePath, type SkillPackage } from './model';

export const GITHUB_ORIGIN = 'https://api.github.com/*';
const sha = z.string().regex(/^[a-f0-9]{40}$/);
const entrySchema = z.object({ path: z.string(), mode: z.string(), type: z.enum(['blob', 'tree', 'commit']), sha, size: z.number().int().nonnegative().optional() });
const treeSchema = z.object({ tree: z.array(entrySchema).max(100000), truncated: z.boolean() });
const commitSchema = z.object({ sha, commit: z.object({ tree: z.object({ sha }) }) });
type Entry = z.infer<typeof entrySchema>;
export interface GitHubLink { owner: string; repo: string; target: string[]; file: boolean }
export interface GitHubCandidate { path: string; files: Entry[] }
export interface GitHubDiscovery { owner: string; repo: string; commit: string; candidates: GitHubCandidate[] }

export function parseGitHubLink(value: string): GitHubLink {
  const input = value.trim();
  let url: URL;
  try { url = new URL(input.startsWith('https://') ? input : `https://${input}`); }
  catch { throw new Error('请粘贴 GitHub 仓库、技能文件夹或 SKILL.md 链接。'); }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password) throw new Error('目前支持 github.com 上的公开仓库链接。');
  let parts: string[];
  try { parts = url.pathname.replace(/\/$/, '').slice(1).split('/').map(decodeURIComponent); }
  catch { throw new Error('GitHub 链接编码无效。'); }
  const [owner, rawRepo, kind, ...target] = parts, repo = rawRepo?.replace(/\.git$/, '');
  if (!owner || !repo || !/^[\w-]+$/.test(owner) || !/^[\w.-]+$/.test(repo) || repo === '.' || repo === '..') throw new Error('链接需要包含 GitHub 用户名和仓库名。');
  if (kind && kind !== 'tree' && kind !== 'blob') throw new Error('请使用仓库主页、tree 文件夹链接或 blob/SKILL.md 文件链接。');
  if (kind && (!target.length || target.length > 16)) throw new Error('链接缺少分支，或目录层级过深。');
  // Encoded slashes are permitted in refs, but never permit path traversal.
  if (target.length) safePath(target.join('/'));
  if (kind === 'blob' && target.at(-1) !== 'SKILL.md') throw new Error('文件链接需要指向 SKILL.md；其他资源会随技能文件夹一起导入。');
  return { owner, repo, target, file: kind === 'blob' };
}

class GitHubError extends Error { constructor(readonly status: number, message: string) { super(message); } }
// Requests stay on one API origin, never inherit cookies or the configured model key.
async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const timeout = AbortSignal.timeout(20000);
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
    credentials: 'omit', redirect: 'error', signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) {
    const message = response.status === 404 ? '仓库、分支或文件不存在，或该仓库不是公开仓库。'
      : response.status === 403 || response.status === 429 ? 'GitHub 暂时限制了访问，请稍后重试，或下载技能 ZIP 后上传。'
      : `GitHub 读取失败（${response.status}），请稍后重试。`;
    await response.body?.cancel(); throw new GitHubError(response.status, message);
  }
  const reader = response.body?.getReader(); if (!reader) throw new Error('GitHub 返回了空响应。');
  const decoder = new TextDecoder(); let size = 0, text = '';
  try {
    while (true) {
      const part = await reader.read(); if (part.done) break;
      size += part.value.byteLength;
      if (size > 10 * 1024 * 1024) { await reader.cancel(); throw new Error('仓库目录过大，请使用具体技能文件夹的链接。'); }
      text += decoder.decode(part.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally { reader.releaseLock(); }
}
const repository = (link: Pick<GitHubLink, 'owner' | 'repo'>) => `/repos/${encodeURIComponent(link.owner)}/${encodeURIComponent(link.repo)}`;
async function tree(base: string, id: string, recursive: boolean, signal?: AbortSignal): Promise<Entry[]> {
  const result = treeSchema.parse(await request(`${base}/git/trees/${id}${recursive ? '?recursive=1' : ''}`, signal));
  if (result.truncated) throw new Error('GitHub 返回的目录不完整，请改用更具体的技能文件夹链接，或上传 ZIP。');
  return result.tree;
}

export async function discoverGitHubSkills(value: string, signal?: AbortSignal): Promise<GitHubDiscovery> {
  const link = parseGitHubLink(value), base = repository(link);
  let commit: z.infer<typeof commitSchema> | undefined, folders: string[] = [];
  if (!link.target.length) commit = commitSchema.parse(await request(`${base}/commits/HEAD`, signal));
  else {
    // GitHub branch names may contain '/'. Resolve the longest existing ref;
    // every subsequent lookup uses its immutable commit/tree SHA.
    const target = link.file ? link.target.slice(0, -1) : link.target;
    for (let length = target.length; length > 0; length--) {
      try {
        commit = commitSchema.parse(await request(`${base}/commits/${encodeURIComponent(target.slice(0, length).join('/'))}`, signal));
        folders = target.slice(length); break;
      } catch (error) { if (!(error instanceof GitHubError) || ![404, 422].includes(error.status)) throw error; }
    }
  }
  if (!commit) throw new Error('没有找到链接中的分支或版本。请检查链接，或使用仓库主页链接。');
  let treeId = commit.commit.tree.sha;
  for (const folder of folders) {
    const found = (await tree(base, treeId, false, signal)).find(item => item.path === folder && item.type === 'tree');
    if (!found) throw new Error(`没有找到技能目录：${folders.join('/')}。`);
    treeId = found.sha;
  }
  const entries = await tree(base, treeId, true, signal);
  const roots = entries.filter(item => item.type === 'blob' && (item.path === 'SKILL.md' || item.path.endsWith('/SKILL.md'))).map(item => item.path.slice(0, -8));
  if (link.file && !roots.includes('')) throw new Error('此链接下没有 SKILL.md 文件。');
  const candidates = (link.file ? [''] : roots).sort().map(root => {
    const nested = roots.filter(other => other !== root && other.startsWith(root));
    const files = entries.filter(item => item.type !== 'tree' && item.path.startsWith(root) && !nested.some(other => item.path.startsWith(other)))
      .map(item => ({ ...item, path: item.path.slice(root.length) }));
    return { path: [...folders, root.replace(/\/$/, '')].filter(Boolean).join('/'), files };
  });
  if (!candidates.length) throw new Error('这个目录中没有找到 SKILL.md。请检查链接是否指向技能仓库或文件夹。');
  return { owner: link.owner, repo: link.repo, commit: commit.sha, candidates };
}

export async function downloadGitHubSkill(discovery: GitHubDiscovery, candidate: GitHubCandidate, signal?: AbortSignal): Promise<SkillPackage> {
  const entries = candidate.files;
  if (!entries.length || entries.length > 64) throw new Error('每个技能最多 64 个文件，请选择更具体的技能文件夹。');
  let size = 0;
  for (const entry of entries) {
    safePath(entry.path);
    if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) throw new Error('此技能包含符号链接或 Git 子模块，当前不能完整导入。请上传包含实际文件的 ZIP。');
    if (entry.size === undefined) throw new Error('GitHub 未返回文件大小，无法验证技能包。');
    size += entry.size;
  }
  if (size > MAX_PACKAGE) throw new Error('技能包超过 2 MB，请缩减包内资源后上传。');
  const files = [];
  for (const entry of entries) {
    signal?.throwIfAborted();
    const blob = z.object({ encoding: z.literal('base64'), content: z.string().max(3 * 1024 * 1024), size: z.number().int().nonnegative() }).parse(await request(`${repository(discovery)}/git/blobs/${entry.sha}`, signal));
    const data = blob.content.replace(/\s/g, '');
    if (blob.size !== entry.size || atob(data).length !== entry.size) throw new Error('下载的文件大小与仓库记录不一致，请重试。');
    files.push({ path: entry.path, data });
  }
  const skill = await parseSkill(files);
  skill.origin = { owner: discovery.owner, repo: discovery.repo, commit: discovery.commit, path: candidate.path };
  return skill;
}
