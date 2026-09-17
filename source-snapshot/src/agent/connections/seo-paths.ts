/** Fixed DataForSEO endpoints. POST result retrieval is distinct from paid creation. */
export const seoAdvancedPaths = {
  backlinkSummary: '/backlinks/summary/live', backlinks: '/backlinks/backlinks/live',
  referringDomains: '/backlinks/referring_domains/live', anchors: '/backlinks/anchors/live',
  linkGap: '/backlinks/domain_intersection/live', linkChanges: '/backlinks/timeseries_new_lost_summary/live',
  contentDiscovery: '/content_analysis/search/live', instantPage: '/on_page/instant_pages',
  lighthouse: '/on_page/lighthouse/live/json',
} as const;
export const onPageReadPaths = ['/on_page/pages', '/on_page/links', '/on_page/duplicate_tags', '/on_page/duplicate_content', '/on_page/redirect_chains', '/on_page/non_indexable', '/on_page/raw_html', '/on_page/microdata'] as const;
