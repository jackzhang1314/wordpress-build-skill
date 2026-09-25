# Project Contract

Every content, design, navigation or deployment task must answer:

1. Is the project `source` or `external`?
2. Is the source profile Starter or custom?
3. What route or template controls the page?
4. Where does each value come from?
5. Can the owner edit it in WordPress admin?
6. Does this require an ACF/CMS model change?
7. Does navigation change?
8. Does SEO, heading order or accessibility change?
9. What backup is required before writing?
10. What local and live verification proves success?

## Change classes

| Change | Required checks |
| --- | --- |
| CSS token/spacing/color only | Visual regression, responsive QA |
| Component markup | ACF/CMS source, heading order, accessibility, template route |
| New section | Data source, ACF/location, template inclusion, editability, live render |
| New field | ACF group/location/REST, template binding, backend edit, live output |
| New page template | Template header, `the_content()`, page assignment, live render |
| New route/page | IA, template, CMS ownership, SEO, verification |
| Navigation | Menu mechanism, affected labels, front-end path, rollback |
| External theme/plugin code | Stop; propose explicit source-custody upgrade |

No styling-only claim is valid if markup or data binding changed.
