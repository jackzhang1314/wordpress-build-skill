# Page Architecture v2

Status: implemented in the component-starter rebuild branch. This document is the routing and editability contract; implementation must match it before release.

## 1. Problem addressed

Earlier versions bound About and Contact presentation to page slugs (`page-about.php`, `page-contact.php`), mixed data lookup into views, and carried LED-specific product fields in the generic Starter model. That made slug changes fragile, backend content incomplete, and the template industry-specific.

## 2. Official WordPress routing model

WordPress resolves a page in this order:

1. Assigned custom page template
2. `page-{slug}.php`
3. `page-{id}.php`
4. `page.php`
5. `singular.php`
6. `index.php`

CPT singles use `single-{post_type}.php`; taxonomy archives use `taxonomy-{taxonomy}.php`; post type archives use `archive-{post_type}.php`. The Starter follows this hierarchy instead of inventing routes.

## 3. Layer contract

```text
WordPress Template Hierarchy
  -> Page controller (theme/inc/page-data.php)
  -> Normalized page data array
  -> Template composition
  -> Pure component / template part
  -> CSS design-token layer
```

Rules:

- Templates may run the main Loop and call one controller.
- Controllers own ACF, Customizer, term, option and query data.
- Components receive normalized props and own markup.
- Templates do not contain business promises.
- Controllers do not contain markup.
- Global classes remain `\WP_Post`, `\WP_Query`, and `\WP_Term`.

## 4. Page type matrix

| Page type | Template/controller | Admin owner |
|---|---|---|
| Static home | `front-page.php` + `homepage_data()` | Page editor + Homepage content & sections ACF |
| About | `page-templates/about.php` + `about_data()` | Assigned template, page editor, Factory profile, Site copy |
| Contact / RFQ | `page-templates/contact.php` + `contact_data()` | Assigned template, page editor, Contact page content ACF |
| Product collection | `taxonomy-product_collection.php` + `product_category_data()` | Term description + Category content ACF |
| Product single | `single-starter_product.php` + `product_data()` | Product editor + Product content ACF |
| Industry single | `single-starter_industry.php` + `industry_data()` | Industry editor + Industry details ACF |
| Guide single | `single-starter_guide.php` | Guide editor and archive intro |
| News single | `single.php` | Post editor, featured image, category/tag |
| Landing / full width | `page-templates/landing.php`, `full-width.php` | Assigned template and page editor |
| System pages | `archive.php`, `search.php`, `404.php` | Site copy ACF |

## 5. Assigned template policy

About and Contact use `page-templates/{about,contact}.php`. The seed sets `_wp_page_template`. Editors may rename the slug; the layout remains intact. Slug-bound page templates are forbidden.

`page-templates/landing.php` is available for campaign pages. `page-templates/full-width.php` is the neutral generic page shell. The static home continues to use `front-page.php` because it is the canonical WordPress front-page override.

## 6. Generic product schema

Core fields are industry-neutral:

- `quick_specs`: `Label | Value` lines
- `product_highlights`: one claim per line
- `spec_table`: `Label | Value` lines
- `product_applications`: one item per line
- `product_documents`: one item per line
- `warranty`, `lead_time`, `moq`
- `customization_note`
- `product_cta_note`, `product_cta_label`, `product_trust_points`
- `related_products`: optional ACF post object; automatic fallback otherwise

`wattage`, `efficacy`, and `ip_rating` are demo content concerns, not Starter schema. Seed migrates them into `quick_specs` and removes the legacy scalar fields.

## 7. Content ownership

| Content | Owner |
|---|---|
| “Products”, “Full specifications” | Universal UI label in template/component |
| Company name, email, phone, hours | Customizer |
| Long-form page body | WordPress editor |
| Specs, highlights, documents, promises | ACF |
| Repeating catalogue content | CPT/taxonomy/main query |
| Section visibility/count/title | Homepage ACF |
| Form fields, notifications, entries | Fluent Forms |
| SEO title/description/schema | Rank Math |

## 8. Navigation ownership

- Fresh provisioning seeds the Primary navigation.
- Normal deploy preserves editor changes and does not rebuild navigation.
- `deploy --with-nav` explicitly rebuilds navigation.
- `content --with-nav` seeds content and explicitly rebuilds navigation.
- Day-to-day menu additions use `nav add` / WP Admin.

## 9. Harness gates

The Starter check enforces:

- official page-template headers and assignment map
- no slug-bound page templates
- ACF fields consumed by the controller layer are registered
- WordPress class qualification
- CPT/taxonomy route manifest
- zero shipped media
- heading hierarchy
- component and CSS contracts
- PHP syntax

Remote verification additionally checks all live routes, database counts, blank media, screenshots and RFQ submission.

## 10. Migration and rollback

1. Deploy theme/plugin.
2. Run content seed with the v2 migration:
   - assigned templates are set
   - generic product fields are written
   - old product scalar fields are removed
   - global ACF options are populated
3. Verify all routes and template markers.
4. Preserve navigation unless `--with-nav` was requested.
5. The previous slug templates are removed in the same atomic deployment; rollback restores both code and templates from the deploy backup.

## 11. Acceptance criteria

- Changing `/about/` or `/contact/` does not change the layout.
- Every visible business promise has an ACF/Customizer owner.
- A generic B2B product can be completed without lighting terminology.
- Homepage sections can be shown, hidden, renamed and limited.
- Navigation survives a normal deploy.
- All 23 acceptance routes and template screenshots pass.
- Local checks and 148 harness tests pass.
