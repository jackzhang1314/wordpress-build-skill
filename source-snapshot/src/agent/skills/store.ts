import { skillNames } from './references';
import { openDB, type DBSchema } from 'idb';
import { builtinSkills, builtinSkillVersions } from './builtin';
import { canonicalSkillName, skillAliases } from './aliases';
import { parseSkill } from './import';
import { infoOf, skillOriginSchema, type SkillFile, type SkillInfo, type SkillPackage, type SkillRef, type SkillOrigin } from './model';
interface SkillDB extends DBSchema {
  heads: { key: string; value: SkillInfo };
  versions: { key: string; value: SkillPackage };
}
const key = (ref: SkillRef) => `${ref.name}@${ref.version}`;
export class SkillStore {
  private db;
  constructor(name = 'page-notes-skills') { this.db = openDB<SkillDB>(name, 1, { upgrade(db) { db.createObjectStore('heads', { keyPath: 'name' }); db.createObjectStore('versions'); } }); }
  async list(): Promise<SkillInfo[]> {
    const builtins = await builtinSkills(), heads = await (await this.db).getAll('heads');
    const result = new Map(builtins.map(skill => [skill.name, infoOf(skill)]));
    // Built-in toggles persist, but must not pin an obsolete bundled body/version after upgrade.
    for (const head of heads) {
      if (head.source === 'builtin' && skillAliases[head.name]) {
        const name = canonicalSkillName(head.name), replacement = result.get(name);
        // Explicit preference on the new entry wins; otherwise conservatively keep a disabled legacy choice.
        if (replacement && !heads.some(item => item.name === name) && !head.enabled) result.set(name, { ...replacement, enabled: false });
        continue;
      }
      const current = result.get(head.name);
      result.set(head.name, current ? { ...current, enabled: head.enabled } : head);
    }
    return [...result.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  async get(ref: SkillRef): Promise<SkillPackage> {
    const builtin = (await builtinSkillVersions()).find(skill => key(skill) === key(ref));
    const result = builtin ?? await (await this.db).get('versions', key(ref));
    if (!result) throw new Error(`技能版本已不可用：${ref.name}。请重新选择技能。`);
    return structuredClone(result);
  }
  async import(files: SkillFile[], replaceVersion?: string, origin?: SkillOrigin): Promise<SkillInfo> {
    const skill = await parseSkill(files), db = await this.db;
    if (origin) skill.origin = skillOriginSchema.parse(origin);
    if ((await builtinSkillVersions()).some(item => item.name === skill.name)) throw new Error('内置技能不能被覆盖，请修改自定义技能的 name。');
    const transaction = db.transaction(['heads', 'versions'], 'readwrite');
    const heads = transaction.objectStore('heads'), versions = transaction.objectStore('versions');
    const existing = await heads.get(skill.name);
    if (existing?.version === skill.version) { await transaction.done; return existing; }
    const allHeads = await heads.getAll(), allVersions = await versions.getAll();
    let error = '';
    if (existing && existing.version !== skill.version && replaceVersion !== existing.version) error = '同名技能已存在，请查看内容后选择“更新此技能”。';
    if (!existing && allHeads.filter(info => info.source === 'imported').length >= 50) error = '最多安装 50 个自定义技能。';
    if (JSON.stringify(allVersions).length + JSON.stringify(skill).length > 32 * 1024 * 1024) error = '技能版本存储已达到 32 MB 上限。';
    if (error) { await transaction.done; throw new Error(error); }
    skill.enabled = existing?.enabled ?? true;
    await versions.put(skill, key(skill)); await heads.put(infoOf(skill)); await transaction.done; return infoOf(skill);
  }
  async toggle(name: string, enabled: boolean): Promise<void> {
    const info = (await this.list()).find(item => item.name === name); if (!info) throw new Error('技能不存在。');
    await (await this.db).put('heads', { ...info, enabled });
  }
  async remove(name: string): Promise<void> {
    if ((await builtinSkills()).some(item => item.name === name)) throw new Error('内置技能可以停用，不能删除。');
    // Retain immutable versions referenced by paused tasks and queued messages.
    await (await this.db).delete('heads', name);
  }
  async resolve(prompt: string): Promise<SkillRef[]> {
    const names = [...new Set(skillNames(prompt).map(canonicalSkillName))];
    if (names.length > 4) throw new Error('每条消息最多指定 4 个技能。');
    const catalog = await this.list();
    return names.map(name => {
      const info = catalog.find(item => item.name === name && item.enabled);
      if (!info) throw new Error(`技能 ${name} 不存在或已停用，请在“技能”中选择。`);
      return { name: info.name, version: info.version };
    });
  }
  async close(): Promise<void> { (await this.db).close(); }
}
