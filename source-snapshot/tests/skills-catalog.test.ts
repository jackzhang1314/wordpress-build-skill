import 'fake-indexeddb/auto';
import { expect, it } from 'vitest';
import { openDB } from 'idb';
import { unzipSync } from 'fflate';
import { categories, matchesSkill, productFor } from '../src/agent/skills/catalog';
import { builtinSkills } from '../src/agent/skills/builtin';
import { bytesToBase64, fileText } from '../src/agent/skills/model';
import { parseSkill } from '../src/agent/skills/import';
import { exportSkillPackage } from '../src/agent/skills/package';
import { SkillStore } from '../src/agent/skills/store';

const encoded = (path: string, text: string) => ({ path, data: bytesToBase64(new TextEncoder().encode(text)) });
it('场景目录覆盖所有内置包，支持岗位、平台与多词查询且没有空场景', async () => {
  const skills = await builtinSkills();
  expect(skills).toHaveLength(37);
  for (const category of categories.filter(c => c.id !== 'custom')) expect(skills.some(s => productFor(s).category === category.id)).toBe(true);
  const seo = skills.find(s => s.name === 'on-page-seo')!;
  expect(matchesSkill(seo, 'SEO 独立站')).toBe(true); expect(matchesSkill(seo, 'SEO 邮件')).toBe(false);
  expect(productFor(seo).inputs.length).toBeGreaterThan(0); expect(productFor(seo).outputs.length).toBeGreaterThan(0);
});
it('新包完整可往返导出，许可证与包内相对引用都可解析，元数据不提前装入正文', async () => {
  for (const skill of (await builtinSkills()).filter(s => s.product)) {
    const zip = exportSkillPackage(skill);
    const files = Object.entries(unzipSync(zip)).map(([path, bytes]) => ({path,data:bytesToBase64(bytes)}));
    const restored = await parseSkill(files);
    expect(restored.version).toBe(skill.version); expect(restored.product).toEqual(skill.product);
    expect(restored.files.some(f => f.path === 'LICENSE.txt')).toBe(true);
    for (const file of restored.files.filter(f => f.path === 'SKILL.md')) {
      for (const match of fileText(file).matchAll(/references\/[a-z-]+\.md/g)) expect(files.some(f => f.path === match[0])).toBe(true);
    }
    expect(restored.body.length).toBeLessThan(16000);
  }
});
it('无 sidecar 的第三方包保持兼容；合法分类可用但不信任伪造验证标记', async () => {
  const base = [encoded('SKILL.md','---\nname: custom-seo\ndescription: SEO 方法\n---\n根据页面资料检查')];
  const legacy = await parseSkill(base); expect(productFor(legacy).category).toBe('custom');
  const sidecar = {...productFor(legacy),title:'自定义 SEO',category:'seo',verified:true};
  const imported = await parseSkill([...base,encoded('skill.json',JSON.stringify(sidecar))]);
  expect(productFor(imported).category).toBe('seo'); expect(imported.product).not.toHaveProperty('verified');
  await expect(parseSkill([...base, encoded('skill.json','{"title":"缺少字段"}')])).rejects.toThrow('skill.json');
});
it('旧版内置技能 heads 不能覆盖新包版本，启停偏好与历史版本可保留', async () => {
  const name = crypto.randomUUID(), store = new SkillStore(name);
  const current = (await store.list()).find(s => s.name === 'technical-seo')!;
  const db = await openDB(name);
  await db.put('heads', {...current, version:'old-version',description:'旧目录',enabled:false});
  const listed = (await store.list()).find(s => s.name === current.name)!;
  expect(listed.version).toBe(current.version); expect(listed.enabled).toBe(false);
  expect((await store.get(listed)).name).toBe(current.name);
  await store.toggle(current.name,true); expect((await store.resolve('/technical-seo\n检查'))[0]?.version).toBe(current.version);
  db.close(); await store.close();
});
it('SEO 活动目录包含十八个入口，旧名称合并但历史包仍能读取', async () => {
  const { builtinSkillVersions } = await import('../src/agent/skills/builtin');
  const store = new SkillStore(crypto.randomUUID());
  const listed = await store.list();
  expect(listed.filter(skill => productFor(skill).category === 'seo')).toHaveLength(18);
  expect(listed.some(skill => skill.name === 'seo-content-brief')).toBe(false);
  expect(listed.some(skill => skill.name === 'seo-content-studio')).toBe(true);
  expect((await store.resolve('/seo-content-brief\n请给我简报'))[0]?.name).toBe('seo-content-studio');
  const legacy = (await builtinSkillVersions()).find(skill => skill.name === 'seo-content-brief')!;
  expect((await store.get(legacy)).body).toBe(legacy.body);
  await store.close();
});
it('旧内置入口的停用偏好迁移，新入口显式设置优先；旧目录不复活', async () => {
  const { builtinSkillVersions } = await import('../src/agent/skills/builtin');
  const { infoOf } = await import('../src/agent/skills/model');
  const name = crypto.randomUUID(), store = new SkillStore(name);
  await store.list(); const db = await openDB(name);
  const legacy = (await builtinSkillVersions()).find(skill => skill.name === 'seo-keyword-article')!;
  await db.put('heads', { ...infoOf(legacy), enabled: false });
  expect((await store.list()).find(skill => skill.name === 'seo-content-studio')?.enabled).toBe(false);
  await store.toggle('seo-content-studio', true);
  expect((await store.list()).find(skill => skill.name === 'seo-content-studio')?.enabled).toBe(true);
  expect((await store.list()).some(skill => skill.name === legacy.name)).toBe(false);
  db.close(); await store.close();
});
it('完整 SEO 更新后仍可回读冻结的历史包原版本', async()=>{
 const {default:legacy}=await import('../src/agent/skills/builtin/seo/legacy-packages.json');
 const store=new SkillStore(crypto.randomUUID());
 for(const old of legacy){const restored=await store.get({name:old.name,version:old.version});expect(restored.version).toBe(old.version);expect(restored.files).toEqual(old.files);}
 await store.close();
});
it('十八个 SEO 技能按六个互斥业务组各三个组织', async()=>{
 const seo=(await builtinSkills()).filter(s=>productFor(s).category==='seo');
 for(const group of ['竞争分析','内容生产','关键词','外链','页面优化','技术审计'])expect(seo.filter(s=>productFor(s).seoGroup===group)).toHaveLength(3);
});
