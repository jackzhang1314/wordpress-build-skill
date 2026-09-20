import { parseDocument } from 'yaml';
import { unzipSync } from 'fflate';
import { z } from 'zod';
import { skillProductSchema } from './catalog';
import { MAX_BODY, MAX_PACKAGE, bytesToBase64, fileText, safePath, skillPackageSchema, type SkillFile, type SkillPackage } from './model';
const frontmatter = z.object({ name: z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().min(1).max(1024), compatibility: z.string().max(500).optional(), license: z.string().optional(), metadata: z.record(z.string(), z.string()).optional(), 'allowed-tools': z.string().optional() }).passthrough();

export async function parseSkill(input: SkillFile[], source: 'builtin' | 'imported' = 'imported'): Promise<SkillPackage> {
  if (!input.length || input.length > 64) throw new Error('每个技能需要 1–64 个文件。');
  let total = 0; const paths = new Set<string>();
  for (const file of input) {
    safePath(file.path);
    if (paths.has(file.path)) throw new Error(`文件路径重复：${file.path}`); paths.add(file.path);
    if (file.data.length > Math.ceil(MAX_PACKAGE / 3) * 4) throw new Error('技能包解压后不能超过 2 MB。');
    total += atob(file.data).length; if (total > MAX_PACKAGE) throw new Error('技能包解压后不能超过 2 MB。');
  }
  const mains = input.filter(file => file.path === 'SKILL.md' || file.path.endsWith('/SKILL.md'));
  if (mains.length !== 1) throw new Error('每次导入一个技能包，其中必须有且只有一个 SKILL.md。');
  const main = mains[0]!, root = main.path.slice(0, -'SKILL.md'.length);
  if (input.some(file => !file.path.startsWith(root))) throw new Error('请只选择技能目录中的文件。');
  const files = input.map(file => ({ ...file, path: safePath(file.path.slice(root.length)) })).sort((a, b) => a.path.localeCompare(b.path));
  const text = fileText(main).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/.exec(text);
  if (!match) throw new Error('SKILL.md 需要以 --- 包围的 YAML 元数据开头。');
  if (match[1]!.length > 8000) throw new Error('技能元数据过长。');
  const doc = parseDocument(match[1]!, { schema: 'core', uniqueKeys: true });
  if (doc.errors.length) throw new Error(`技能 YAML 格式有误：${doc.errors[0]!.message.slice(0, 180)}`);
  const metadata: unknown = doc.toJS({ maxAliasCount: 0 });
  const parsed = frontmatter.safeParse(metadata);
  if (!parsed.success) throw new Error('请检查技能元数据：name 使用小写字母、数字和单横线（最多 64 字符），description 为 1–1024 字符。');
  const data = parsed.data, body = match[2]!.trim();
  if (!body || body.length > MAX_BODY) throw new Error('技能正文需要 1–16000 字符；请将详细资料放入 references/ 后引用。');
  const diagnostics: string[] = [];
  if (root && root.split('/').filter(Boolean).at(-1) !== data.name) diagnostics.push('目录名称与 name 不同；导入后使用 name 作为技能名称。');
  if (data['allowed-tools']) diagnostics.push('allowed-tools 是实验性字段，当前不自动配置工具；网页权限仍按插件设置执行。');
  if (data.compatibility) diagnostics.push(`环境要求：${data.compatibility}（请核对是否适用于浏览器）`);
  if (files.some(file => file.path.startsWith('scripts/') || /\.(py|sh|js|ts|mjs|cjs)$/i.test(file.path))) diagnostics.push('包含脚本：已保存，可阅读；当前不提供 Python、终端或 Node.js 环境。同步 JavaScript 可复制到任务工作区后在隔离沙盒中运行。');
  if (files.some(file => { try { fileText(file); return false; } catch { return true; } })) diagnostics.push('包含二进制资源：已保存，当前模型只能读取文本资源。');
  if (body.split('\n').length > 500) diagnostics.push('正文超过规范建议的 500 行，建议拆分参考资料。');
  const productFile = files.find(file => file.path === 'skill.json');
  let product;
  if (productFile) {
    try { product = skillProductSchema.parse(JSON.parse(fileText(productFile))); }
    catch { throw new Error('skill.json 场景资料格式有误，请检查名称、分类、输入与输出。'); }
  }
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(files)));
  const version = [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return skillPackageSchema.parse({ name: data.name, description: data.description, compatibility: data.compatibility, version, source, enabled: true, body, files, metadata: data, diagnostics, product });
}

export async function readSkillUpload(files: File[]): Promise<SkillFile[]> {
  if (!files.length || files.length > 64) throw new Error('请选择一个 SKILL.md、ZIP 或技能文件夹（最多 64 个文件）。');
  if (files.reduce((size, file) => size + file.size, 0) > MAX_PACKAGE) throw new Error('导入文件总大小不能超过 2 MB。');
  if (files.length === 1 && /\.zip$/i.test(files[0]!.name)) {
    let size = 0, count = 0; const paths = new Set<string>();
    const unpacked = unzipSync(new Uint8Array(await files[0]!.arrayBuffer()), { filter: file => {
      if (file.name.endsWith('/')) { safePath(file.name.slice(0, -1)); return false; }
      safePath(file.name); if (paths.has(file.name)) throw new Error('ZIP 中有重复文件。'); paths.add(file.name);
      if (++count > 64 || (size += file.originalSize) > MAX_PACKAGE) throw new Error('ZIP 解压后超过 64 个文件或 2 MB。');
      return true;
    } });
    return Object.entries(unpacked).map(([path, bytes]) => ({ path, data: bytesToBase64(bytes) }));
  }
  return Promise.all(files.map(async file => ({ path: file.webkitRelativePath || file.name, data: bytesToBase64(new Uint8Array(await file.arrayBuffer())) })));
}
