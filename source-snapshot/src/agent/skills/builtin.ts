import wpSiteSetup from './builtin/wordpress/site-setup.md?raw';
import wpLegacyPackages from './builtin/wordpress/legacy-packages.json';
import wpPatterns from './builtin/wordpress/patterns.json';
import wpLicense from './builtin/wordpress/license.md?raw';
import wpSkill0 from './builtin/wordpress/wordpress-block-pages.md?raw';
import wpSkill1 from './builtin/wordpress/wordpress-acf-products.md?raw';
import wpSkill2 from './builtin/wordpress/wordpress-media.md?raw';
import wpSkill3 from './builtin/wordpress/wordpress-forms.md?raw';
import wpSkill4 from './builtin/wordpress/wordpress-seo-settings.md?raw';
import wpGuide from './builtin/wordpress/api-guide.md?raw';
import seoExtra8 from './builtin/seo/seo-performance.md?raw';
import seoExtra7 from './builtin/seo/seo-international.md?raw';
import seoExtra6 from './builtin/seo/seo-schema.md?raw';
import seoExtra5 from './builtin/seo/seo-internal-links.md?raw';
import seoExtra4 from './builtin/seo/seo-link-outreach.md?raw';
import seoExtra3 from './builtin/seo/seo-link-prospecting.md?raw';
import seoExtra2 from './builtin/seo/seo-backlink-audit.md?raw';
import seoExtra1 from './builtin/seo/seo-content-plan.md?raw';
import seoExtra0 from './builtin/seo/seo-performance-review.md?raw';
import legacySeoPackages from './builtin/seo/legacy-packages.json';
import { skillPackageSchema } from './model';
import { skillAliases } from './aliases';
import studio from './builtin/seo/seo-content-studio.md?raw';
import competitorAnalysis from './builtin/seo/seo-competitor-analysis.md?raw';
import seoSkill0 from './builtin/seo/seo-keyword-research.md?raw';
import seoSkill1 from './builtin/seo/seo-serp-analysis.md?raw';
import seoSkill2 from './builtin/seo/seo-content-brief.md?raw';
import seoSkill3 from './builtin/seo/seo-data-article.md?raw';
import seoSkill4 from './builtin/seo/seo-keyword-article.md?raw';
import seoSkill5 from './builtin/seo/seo-domain-analysis.md?raw';
import seoSkill6 from './builtin/seo/seo-competitor-research.md?raw';
import seoSkill7 from './builtin/seo/seo-content-gap.md?raw';
import seoSkill8 from './builtin/seo/seo-topic-clusters.md?raw';
import seoSkill9 from './builtin/seo/seo-content-refresh.md?raw';
import seoGuide from './builtin/seo/api-guide.md?raw';
import seoSources from './builtin/seo/sources.md?raw';
import seoLicenses from './builtin/seo/licenses.md?raw';
import maps from './builtin/apify-google-maps-leads.md?raw';
import table from './builtin/page-table.md?raw';
import compare from './builtin/product-compare.md?raw';
import outline from './builtin/site-outline.md?raw';
import annotations from './builtin/annotation-tasks.md?raw';
import company from './builtin/company-research.md?raw';
import seo from './builtin/technical-seo.md?raw';
import searchTerms from './builtin/search-term-review.md?raw';
import alibaba from './builtin/alibaba-research.md?raw';
import alibabaSearch from './builtin/alibaba-search-page.md?raw';
import onPage from './builtin/on-page-seo.md?raw';
import landing from './builtin/landing-cro.md?raw';
import copywriting from './builtin/b2b-copywriting.md?raw';
import social from './builtin/social-content.md?raw';
import outreach from './builtin/cold-outreach.md?raw';
import ads from './builtin/ad-creative.md?raw';
import negatives from './builtin/negative-keywords.md?raw';
import onPageChecks from './builtin/references/on-page-checks.md?raw';
import b2bReview from './builtin/references/b2b-review.md?raw';
import socialPlatforms from './builtin/references/social-platforms.md?raw';
import sources from './builtin/references/sources.md?raw';
import license from './builtin/references/marketing-license.md?raw';
import { builtinProducts } from './catalog';
import { bytesToBase64, type SkillPackage } from './model';
import { parseSkill } from './import';
const seoEntries = new Map<string, string>([
  [seo, 'technical-seo'],
  [seoSkill0, 'seo-keyword-research'], [seoSkill1, 'seo-serp-analysis'],
  [seoSkill2, 'seo-content-brief'], [seoSkill3, 'seo-data-article'], [seoSkill4, 'seo-keyword-article'],
  [seoSkill5, 'seo-domain-analysis'], [seoSkill6, 'seo-competitor-research'],
  [seoSkill7, 'seo-content-gap'], [seoSkill8, 'seo-topic-clusters'], [seoSkill9, 'seo-content-refresh'],
  [seoExtra0, 'seo-performance-review'],
  [seoExtra1, 'seo-content-plan'],
  [seoExtra2, 'seo-backlink-audit'],
  [seoExtra3, 'seo-link-prospecting'],
  [seoExtra4, 'seo-link-outreach'],
  [seoExtra5, 'seo-internal-links'],
  [seoExtra6, 'seo-schema'],
  [seoExtra7, 'seo-international'],
  [seoExtra8, 'seo-performance'],
  [studio, 'seo-content-studio'], [competitorAnalysis, 'seo-competitor-analysis'],
]);
const marketingEntries = new Map<string, string>([
  [onPage, 'on-page-seo'], [landing, 'landing-cro'], [copywriting, 'b2b-copywriting'],
  [social, 'social-content'], [outreach, 'cold-outreach'], [ads, 'ad-creative'], [negatives, 'negative-keywords'],
]);
const wordpressEntries = new Map<string,string>([[wpSkill0,'wordpress-block-pages'],[wpSkill1,'wordpress-acf-products'],[wpSkill2,'wordpress-media'],[wpSkill3,'wordpress-forms'],[wpSkill4,'wordpress-seo-settings']]);
let packages: Promise<SkillPackage[]> | undefined;
export function builtinSkillVersions(): Promise<SkillPackage[]> {
  return packages ??= Promise.all([wpSkill0,wpSkill1,wpSkill2,wpSkill3,wpSkill4,table, compare, outline, annotations, company, seo, searchTerms, alibaba, onPage, landing, copywriting, social, outreach, ads, negatives, maps, seoSkill0, seoSkill1, seoSkill2, seoSkill3, seoSkill4, seoSkill5, seoSkill6, seoSkill7, seoSkill8, seoSkill9, studio, competitorAnalysis, seoExtra0, seoExtra1, seoExtra2, seoExtra3, seoExtra4, seoExtra5, seoExtra6, seoExtra7, seoExtra8].map((text) => parseSkill([
    { path: 'SKILL.md', data: bytesToBase64(new TextEncoder().encode(text)) },
    ...(text===wpSkill0 ? [{path:'references/site-setup.md',data:bytesToBase64(new TextEncoder().encode(wpSiteSetup))},{path:'assets/patterns.json',data:bytesToBase64(new TextEncoder().encode(JSON.stringify(wpPatterns)))}] : []),
    ...(wordpressEntries.has(text) ? [
      {path:'LICENSE.txt',data:bytesToBase64(new TextEncoder().encode(wpLicense))},
      {path:'references/wordpress-api.md',data:bytesToBase64(new TextEncoder().encode(wpGuide))},
      {path:'skill.json',data:bytesToBase64(new TextEncoder().encode(JSON.stringify(builtinProducts[wordpressEntries.get(text)!])))}
    ] : []),
    ...(seoEntries.has(text) ? [
      {path:'references/seo-api.md',data:bytesToBase64(new TextEncoder().encode(seoGuide))},
      {path:'references/seo-sources.md',data:bytesToBase64(new TextEncoder().encode(seoSources))},
      {path:'LICENSE.txt',data:bytesToBase64(new TextEncoder().encode(seoLicenses))},
      {path:'skill.json',data:bytesToBase64(new TextEncoder().encode(JSON.stringify(builtinProducts[seoEntries.get(text)!])))},
    ] : []),
    ...(text===alibaba ? [{path:'references/search-page.md',data:bytesToBase64(new TextEncoder().encode(alibabaSearch))}]:[]),
    ...(marketingEntries.has(text) ? [
      {path:'references/sources.md',data:bytesToBase64(new TextEncoder().encode(sources))},
      {path:'LICENSE.txt',data:bytesToBase64(new TextEncoder().encode(license))},
      {path:'skill.json',data:bytesToBase64(new TextEncoder().encode(JSON.stringify(builtinProducts[marketingEntries.get(text)!])))}
    ] : []),
    ...(text === onPage ? [{path:'references/on-page-checks.md',data:bytesToBase64(new TextEncoder().encode(onPageChecks))}] : []),
    ...(text === landing || text === copywriting ? [{path:'references/b2b-review.md',data:bytesToBase64(new TextEncoder().encode(b2bReview))}] : []),
    ...(text === social ? [{path:'references/social-platforms.md',data:bytesToBase64(new TextEncoder().encode(socialPlatforms))}] : []),
    ...(text === table || text === compare ? [{ path: text === table ? 'references/table-rules.md' : 'references/compare-rules.md', data: bytesToBase64(new TextEncoder().encode(text === table ? '# 表格规则\n保持原始单位和筛选条件。聊天摘要不超过 8 列；文件保留用户所需全部字段。大量行用 extractTable 分批保存，不从截断快照抄录。注明实际提取行数、来源和未完成范围，原始缺失值保持空值。' : '# 对比规则\n使用相同口径比较。单位换算必须注明；不同配置不能直接判为优劣。每个型号附来源，结论对应实际参数差异。')) }] : []),
  ], 'builtin'))).then(current => [...legacySeoPackages.map(value => skillPackageSchema.parse(value)), ...wpLegacyPackages.map(value => skillPackageSchema.parse(value)), ...current]);
}

export async function builtinSkills(): Promise<SkillPackage[]> {
  return [...new Map((await builtinSkillVersions()).filter(skill => !skillAliases[skill.name]).map(skill => [skill.name, skill])).values()];
}
