# WordPress component architecture

## Principle

WordPress already has routing; the Starter does not add a router. Templates map WordPress routes to page compositions, controllers own data, and every visual block is a reusable component with one owner.

```text
WordPress route/template hierarchy
  → page controller (`theme/inc/page-data.php`)
    → page template (composition only)
      → component / template part (markup + props)
        → CSS component layer (visual design)
          → design tokens (brand variables)
```

## Layers

1. **Routing** — WordPress template hierarchy, assigned page templates, CPT and taxonomy templates.
2. **Page controllers** — `theme/inc/page-data.php` returns normalized arrays for home, about, contact, product, category and industry views.
3. **Content schema** — CPTs, taxonomies, ACF fields, options and Customizer settings.
4. **Components** — `theme/inc/components.php` owns reusable presentation; loop cards and header/footer live in `theme/parts/`.
5. **Design tokens** — CSS custom properties for color, type, surface, radius and shadow.
6. **Harness gates** — architecture, PHP syntax, fields, routes, screenshots, live pages and form submission.

## Component contract

| Component | Inputs | Owns |
|---|---|---|
| `component_page_head` | eyebrow, title, description | Inner-page H1 and breadcrumb placement |
| `component_section_heading` | eyebrow, title, link, level | Consistent section headers |
| `component_card_grid` | query args, main query, pagination | Card grid and empty state |
| `component_feature_grid` | rows | Label/value feature cards |
| `component_quick_specs` | rows | Compact definition list |
| `component_spec_table` | rows | Accessible specification table |
| `component_faq` | rows | Details/summary FAQ |
| `component_cta_band` | title, description, button | End-page conversion band |
| `parts/site-header`, `parts/site-footer` | global settings | Global chrome and navigation |
| `parts/card`, `parts/hero` | current post or props | Reusable hero/card shell |

## Gate summary

- `npm run typecheck`, `npm run lint`, `npm test`
- `node harness/cli.mjs --project examples/classic-b2b-starter check`
- `npm run package:starter`
- Remote: `verify`, `verify --screenshots --mode templates|full`, `verify-form`

See [PAGE-ARCHITECTURE-V2.md](PAGE-ARCHITECTURE-V2.md) for the page-routing and admin-editability contract.
