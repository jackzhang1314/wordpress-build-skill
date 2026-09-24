# Blog editorial redesign

- **Date/time:** 2026-09-25, 05:54 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested deep blog-page design optimisation informed by Google SEO and quality guidance.

## Research applied

1. Google page experience: good Core Web Vitals, mobile behaviour, HTTPS, no intrusive interstitials, and clear main-content separation.
2. Google people-first / E-E-A-T guidance: visible bylines, expertise, trust and a satisfying reader experience.
3. Google Article structured data: Person/Organization author, `datePublished`, `dateModified` and publisher details.
4. Editorial design practice: readable 76ch article measure, clear metadata, table of contents, author box, related posts and contextual CTAs.

## Implementation

1. Added dedicated blog templates and components:
   - `home.php`;
   - improved `archive.php` and `index.php`;
   - editorial `blog-card` template;
   - `component_blog_archive`;
   - `component_related_blog_cards`.
2. Added `theme/inc/blog.php` with reading time, byline helpers, modified-date logic, heading anchors/TOC extraction, related posts and publisher logo helpers.
3. Rebuilt the single post template with:
   - title and category context;
   - leader paragraph;
   - author avatar/byline;
   - publish/update dates and reading time;
   - featured image with caption;
   - sticky table of contents when at least three headings exist;
   - readable article body;
   - tags;
   - author box;
   - previous/next navigation;
   - related articles;
   - contextual CTA;
   - `BlogPosting` JSON-LD.
4. Added `/news/` posts page, set WordPress `page_for_posts`, added Blog navigation, expanded the route manifest to 24 routes, and removed the default Hello World article from starter seed.
5. Continued the precision-catalogue design system: cleaner tokens, high-contrast body text, disciplined hairline grids, reduced box noise and improved dark CTA/footer hierarchy.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **157/157 pass**
- Starter local checks: pass
- Deployment: pass
- Live routes: **24/24 pass**
- `/news/`: featured lead card, category filter, byline and pagination contracts verified
- Single article: byline, reading time, article body, author box, CTA and `BlogPosting` JSON-LD verified
- Remote ACF audit: **66/66 stored values have admin-editable fields**
- Blog screenshots at 390 / 768 / 1440: **6/6 pass**
