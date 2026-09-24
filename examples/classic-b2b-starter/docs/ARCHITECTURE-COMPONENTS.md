# WordPress component architecture

## Principle

WordPress already has routing; it does not need a client router. Our templates map WordPress routes to page compositions, and every visual block is a reusable component with one owner.

```text
WordPress route/template hierarchy
  → page template (composition only)
    → component / template part (markup + props)
      → CSS component layer (visual design)
        → design tokens (brand variables)
```

## Layers

1. **Content schema** — CPTs (`starter_product`, `starter_industry`, `starter_guide`), taxonomies, ACF fields, options. This is the admin-editable data contract.
2. **Design tokens** — CSS custom properties for brand color, text, surfaces, spacing, radius, shadow, and typography. No component hardcodes brand values.
3. **Components** — `theme/inc/components.php` owns reusable presentation functions. Loop-specific cards and global header/footer live in `theme/parts/`.
4. **Templates** — `front-page.php`, archives, singles, taxonomy, pages. They query data only when necessary and compose components; they do not repeat section markup.
5. **Harness gates** — structure, PHP syntax, heading hierarchy, content-data, secret scan, deploy verification, browser screenshots, and ACF field audit.

## Component contract

| Component | Inputs | Owns |
|---|---|---|
| `component_page_head` | eyebrow, title, description, breadcrumbs | Inner-page H1 and breadcrumb placement |
| `component_section_heading` | eyebrow, title, description, link | Section label/heading hierarchy |
| `component_cta_band` | eyebrow, title, text, button | Primary conversion block |
| `component_card_grid` | query_args/main_query, title_tag, pagination | Card query and empty state |
| `component_feature_grid` | label/value rows | Capability or benefit grid |
| `component_pill_list` | text items | Applications and tags |
| `component_faq` | question/answer rows | FAQ disclosure list |
| `component_callout` | title, text, variant | Challenge/outcome highlight |
| `component_spec_table` | label/value rows | Product specification table |
| `component_link_cards` | label/url/description links | 404/recovery destinations |
| `component_stat_strip` | value/label items | Homepage proof strip |
| `parts/card` | loop item + `title_tag` | Product/solution/guide card |
| `parts/site-header` | settings + navigation | Document body header |
| `parts/site-footer` | settings | Document body footer |
| `media_placeholder()` | kind, label, class, dimension | Asset slot and ratio communication |

## Editing rules

- Page body and ACF fields remain editable in WP Admin.
- Header/footer/global settings use Customizer or ACF options.
- Repeated presentation is changed in one component, not copied across templates.
- Placeholder media states the intended size/ratio; it does not invent a fake product image.
- Component markup is added only once in `theme/inc/components.php`; page templates pass data and compose it.
- Every ACF value consumed by a template must have a matching local ACF field definition; the starter test suite enforces this contract.
- Forms are embedded through `[starter_rfq_form]`; templates do not hardcode Fluent Forms IDs.
- A visual or structural change must bump the theme version and pass browser verification.

## Next hardening

- [x] All page templates compose through `inc/components.php` / `parts/`; inline section markup is gated by `harness check` (component-duplication).
- [x] Component registry test: `tests/harness/starter-gates.test.mjs` fails when a template copies a known section structure.
- [x] Visual captures: `harness screenshot` records every route at 390/768/1440 via headless Chrome; `harness verify --screenshots` runs it as a gate (byte-size validated).
- [x] Zero-media invariant: `harness check` fails on seed media references, media-map entries, binary assets or media-write calls in the theme.
- [x] ACF binding: `harness check` fails when the theme reads a field the plugin does not register.
- [x] Route manifest: `harness check` enforces the 23-route manifest declared in `project.example.json`.
