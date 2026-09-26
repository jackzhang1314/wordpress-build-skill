# Project Contract

Every content, design, navigation or deployment task must answer:

1. Is the project `source` or `external`?
2. Is the source profile Starter or custom?
3. Which authoring/rendering system is used: Classic PHP, Block/FSE, Elementor, Divi, Beaver Builder, WPBakery, Bricks, Oxygen, hybrid or unknown?
4. What route, template or layout controls the page?
5. Where does each value come from?
6. Can the owner edit it in WordPress admin?
7. Does this require an ACF/CMS model change?
8. Does navigation change, and which navigation adapter owns it?
9. Does SEO, heading order or accessibility change?
10. What backup is required before writing?
11. What local and live verification proves success?

## Change classes

| Change | Required checks |
| --- | --- |
| CSS token/spacing/color only | Visual regression, responsive QA |
| Component markup | ACF/CMS source, heading order, accessibility, template route |
| New section | Data source, ACF/location, template inclusion, editability, live render |
| New field | ACF group/location/REST, template binding, backend edit, live output |
| New page template | Template header, `the_content()`, page assignment, live render; Block/FSE/hybrid sites also need selected route template/source evidence |
| FSE template patch | Selected route owner, unique find/replace, markup validation, custom override strategy, rollback, live text verification |
| New route/page | IA, template, CMS ownership, SEO, verification |
| Navigation | Menu mechanism, selected route owner, affected labels, front-end path, rollback; `wp_navigation` must use plan/apply when supported |
| External theme/plugin code | Stop; propose explicit source-custody upgrade |

Theme type is not a compatibility blocker. It is an adapter signal: the same ACF/CPT/content workflow can power Classic PHP, Block/FSE and page-builder sites, but rendering changes require the matching template/layout owner.

No styling-only claim is valid if markup or data binding changed.
