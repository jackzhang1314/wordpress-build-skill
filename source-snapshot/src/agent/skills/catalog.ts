import { builtinText } from './localization';
import { t } from '../../i18n/runtime';
import wordpressProducts from './builtin/wordpress/products.json';
import seoProducts from './builtin/seo/products.json';
import { connectorIds } from '../connections/ids';
import { z } from 'zod';
import type { SkillInfo } from './model';

export const categories = [
  { id: 'prospecting', get title() { return t('uiProspectingAndResearch'); } },
  { id: 'communication', get title() { return t('uiCommunication'); } },
  { id: 'website', get title() { return t('uiWebsitesAndOptimization'); } },
  { id: 'seo', get title() { return t('uiSEO'); } },
  { id: 'social', get title() { return t('uiSocialMedia2'); } },
  { id: 'advertising', get title() { return t('uiAdvertising2'); } },
  { id: 'data', get title() { return t('uiDataAndResearch'); } },
  { id: 'custom', get title() { return t('uiImported'); } },
] as const;
export type SkillCategory = typeof categories[number]['id'];
export const skillProductSchema = z.object({
  title: z.string().trim().min(1).max(80),
  seoGroup: z.enum(['竞争分析','内容生产','关键词','外链','页面优化','技术审计']).optional(),
  category: z.enum(['prospecting', 'communication', 'website', 'seo', 'social', 'advertising', 'data', 'custom']),
  summary: z.string().trim().min(1).max(240),
  inputs: z.array(z.string().max(160)).max(8).default([]),
  outputs: z.array(z.string().max(160)).max(8).default([]),
  tags: z.array(z.string().max(40)).max(16).default([]),
  example: z.string().max(1000).default(''),
  requirements: z.string().max(400).default(''),
  connections: z.array(z.enum(connectorIds)).max(connectorIds.length).optional(),
});
export type SkillProduct = z.infer<typeof skillProductSchema>;
const product = (title: string, category: SkillCategory, summary: string, inputs: string[], outputs: string[], tags: string[], example: string, requirements = '使用已有网页或任务资料；不会自动连接外部账户。'): SkillProduct => ({ title, category, summary, inputs, outputs, tags, example, requirements });
export const builtinProducts: Readonly<Record<string, SkillProduct>> = {
  ...z.record(z.string(), skillProductSchema).parse(seoProducts),
  ...z.record(z.string(), skillProductSchema).parse(wordpressProducts),
  'apify-google-maps-leads': { ...product('Google Maps 地图找客', 'prospecting', '按地区寻找商家，采集官网与公开联系方式，导出带来源的客户表。', ['地区与商家类型', '每词数量、联系方式补全选项与美元预算'], ['客户 CSV', '来源记录与采集状态'], ['Apify', 'Google Maps', '地图', '主动开发', '业务员'], '帮我找柏林的自行车店，每词最多 30 家，补全官网联系方式；先说明采集范围并询问我的 Apify 预算。', '需要在设置 → 连接器中连接 Apify；采集费用由你的 Apify 账户承担。'), connections: ['apify'] },
  'company-research': product('客户调研', 'prospecting', '核对客户业务与产品匹配，整理带来源的客户报告。', ['客户官网或公司名称', '我方产品与目标市场'], ['客户概况与来源', '匹配依据与联系切入点'], ['业务员', 'Google', '背调', '找客'], '研究当前客户官网，判断与我方产品的匹配情况，保留来源和未知项。'),
  'cold-outreach': product('个性化开发信', 'communication', '从真实客户证据出发，生成简短开发信与跟进草稿。', ['客户资料', '产品卖点与沟通语言'], ['主题与正文', '跟进草稿'], ['业务员', '邮件', '销售'], '根据客户资料写一封简洁的英文开发信，给出主题和一个明确的下一步。', '生成可编辑草稿，不自动发信。'),
  'site-outline': product('网站结构', 'website', '梳理网站导航、栏目层级和页面结构。', ['网站或页面清单'], ['导航结构与页面来源'], ['建站', '独立站', '导航'], '梳理当前网站导航和页面结构，注明已访问范围。'),
  'landing-cro': product('询盘转化检查', 'website', '找出采购信息与询盘路径缺口，形成可定位的修改建议。', ['产品页或落地页', '目标客户与产品事实'], ['问题与建议', '页面批注或修改清单'], ['独立站', 'CRO', '表单'], '从海外采购商角度检查当前页面的询盘路径，给出有依据的修改建议。'),
  'b2b-copywriting': product('B2B 产品页文案', 'website', '把真实产品资料整理成清楚、可用于建站的文案。', ['产品规格、应用与卖点', '页面用途和语言'], ['页面文案', '待补资料清单'], ['建站', '独立站', '文案'], '根据产品资料生成产品页文案，保留参数和来源，缺失事实列为待确认。'),
  'on-page-seo': { ...product('On-page SEO 检查', 'seo', '检查标题、内容、图片与内链，交付逐项修改建议。', ['当前页面', '目标词与市场（选填）'], ['原值与建议值', '证据与修改清单'], ['SEO', '独立站', '关键词', '页面优化'], '检查当前页面的 On-page SEO：标题、内容意图、图片和内链，给出原值、证据与修改建议。'), seoGroup:'页面优化' },
  'technical-seo': { ...product('技术 SEO 审计', 'seo', '检查单页或有界全站的抓取、重复内容、重定向与索引证据。', ['目标页面或域名', '抓取上限、JS 选项与审计目标'], ['技术问题与修复清单', '覆盖范围和证据文件'], ['SEO','Google','canonical','robots','技术审计'], '审计这个网站的技术 SEO，先确定抓取范围和费用，再按实际证据交付报告。', '单页 DOM 检查无需 API。全站抓取使用 DataForSEO，真实索引检查使用 Google 站点授权；按模式配置。'), seoGroup:'技术审计', connections:['dataforseo','google'] },
  'social-content': product('外贸社媒内容', 'social', '将产品与案例转成平台内容、互动草稿或内容日历。', ['真实产品或案例', '平台、受众与语言'], ['平台文案与素材说明', '内容计划或互动草稿'], ['LinkedIn', 'Facebook', 'Instagram', '社媒', '运营'], '把当前产品资料改写成 LinkedIn 行业分享和 Facebook 产品介绍，注明需要补充的素材。', '输出文案与素材简报，不自动生成视频或发布帖子。'),
  'search-term-review': product('搜索词分析', 'advertising', '核对广告搜索词意图和统计口径，输出分类与待观察项。', ['搜索词 CSV', '产品范围、日期与转化定义'], ['逐行分类', '统计与待观察清单'], ['Google Ads', '广告', 'CSV', '运营'], '分析上传的搜索词报表，按我方业务分类，保留逐行证据并核对统计口径。'),
  'negative-keywords': product('否词与误伤检查', 'advertising', '检查否词候选是否影响有效业务，生成可复核的清单。', ['搜索词或否词候选', '业务范围与匹配类型'], ['候选与影响依据', '保留观察清单'], ['Google Ads', '否定关键词', '广告'], '检查这些否词候选对我方产品和品牌词的影响，分别列出建议采用、需确认和保留观察。', '不修改广告账户；匹配规则需结合实际平台验证。'),
  'ad-creative': product('广告文案与落地页', 'advertising', '根据产品证据生成广告变体，核对落地页承诺。', ['产品事实与落地页', '平台、受众与广告目标'], ['文案变体', '落地页一致性检查'], ['Google Ads', 'Meta', 'LinkedIn', '广告素材'], '根据当前落地页生成广告文案变体，核对每个卖点在页面上是否有证据。', '生成草稿；发布、预算调整与图片生成需要另有工具。'),
  'page-table': product('网页转表格', 'data', '提取网页列表和产品参数，整理成带来源的表格。', ['网页表格或列表', '字段与数量范围'], ['CSV 与来源记录'], ['表格', 'CSV', '采集'], '提取当前网页中的数据，保留来源、单位和缺失项，核验后导出 CSV。'),
  'product-compare': product('产品对比', 'data', '比较多个产品的参数与差异，保留配置和来源。', ['产品页面或资料', '对比维度'], ['同口径对比表'], ['产品', '供应商', '选型'], '比较这些产品的规格与差异，不同配置分开列出，附上来源。'),
  'annotation-tasks': product('批注整理', 'data', '把网页批注整理成可执行的修改与验收清单。', ['已附带的网页批注'], ['修改与验收清单'], ['批注', '建站', '交接'], '按页面整理附带批注，保留编号，生成修改项和验收清单。'),
  'alibaba-research': product('阿里国际站商品研究', 'data', '筛选实际商品与供应商，保存可核对的采集结果。', ['关键词、筛选与数量', '实际可访问的阿里页面'], ['商品表与来源'], ['阿里国际站', 'Alibaba', '商品', '供应商'], '研究阿里国际站商品，先确认筛选、需要字段和数量，再采集并核验。', '网站验证码或登录障碍需用户处理；不等于卖家后台运营。'),
};
export function productFor(info: SkillInfo): SkillProduct {
  const builtin = info.source === 'builtin' ? builtinProducts[info.name] : undefined;
  if (builtin) return { ...builtin, get title() { return builtinText(builtin.title); }, get summary() { return builtinText(builtin.summary); }, get inputs() { return builtin.inputs.map(builtinText); }, get outputs() { return builtin.outputs.map(builtinText); }, get tags() { return builtin.tags.map(builtinText); }, get requirements() { return builtinText(builtin.requirements); } };
  return info.product ?? product(info.name, 'custom', info.description, [], [], [], '', info.compatibility ?? '外部导入；需核对工具依赖，尚未进行本产品业务验收。');
}
export function matchesSkill(info: SkillInfo, query: string): boolean {
  const p = productFor(info);
  const haystack = [p.title, info.name, info.description, p.summary, ...p.tags, ...p.inputs, ...p.outputs].join(' ').toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every(term => haystack.includes(term));
}
