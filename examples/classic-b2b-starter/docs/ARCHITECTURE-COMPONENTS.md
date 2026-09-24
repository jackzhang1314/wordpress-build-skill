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

1. **Content schema** — CPTs (`cleanroom_product`, `cleanroom_industry`, `cleanroom_guide`), taxonomies, ACF fields, options. This is the admin-editable data contract.
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
- A visual or structural change must bump the theme version and pass browser verification.

## Next hardening

- Convert remaining repeated section blocks in product/industry/guide templates to component calls.
- Add a component registry test that fails when a template copies a known section structure.
- Add visual regression baselines at 390/768/1440 for every route.
- Keep starter media at zero uploaded attachments; content sync should enforce blank-media invariants.
