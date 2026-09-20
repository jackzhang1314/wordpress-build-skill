/** Retired prototype entry points remain resolvable without duplicating the active catalog. */
export const skillAliases: Readonly<Record<string, string>> = {
  'seo-content-brief': 'seo-content-studio',
  'seo-data-article': 'seo-content-studio',
  'seo-keyword-article': 'seo-content-studio',
  'seo-domain-analysis': 'seo-competitor-analysis',
  'seo-competitor-research': 'seo-competitor-analysis',
};
export function canonicalSkillName(name: string): string { return skillAliases[name] ?? name; }
