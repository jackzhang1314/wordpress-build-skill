# Design System — B2B WordPress Starter

This is the visual and implementation contract for every starter template. Read it before changing markup, CSS, ACF fields, or page templates.

## Design direction

**Precision Catalogue.** The system is for industrial export buying journeys, not decorative marketing pages. It communicates reliability through typography, hairline grids, editable data, and restrained accent color. The visual signature is the technical media placeholder: a calibrated grid, centered dimension label, and asset-ready frame.

## 1. Foundations

### 1.1 Color tokens

Brand tokens are the only values a project should re-theme.

| Token | Default | Use |
|---|---|---|
| `--brand-primary` | `#111418` | Headings, nav text, footer |
| `--brand-accent` | `#2258D5` | Primary action, active state, links |
| `--brand-surface` | `#F4F5F7` | Tinted and empty surfaces |

Derived tokens remain semantic: `--paper`, `--surface`, `--surface-strong`, `--ink`, `--body-c`, `--muted`, `--faint`, `--line`, `--line-strong`, `--accent-soft`, `--accent-dark`, `--ring`. Never hardcode a raw color in a component.

### 1.2 Type scale

InterVariable is the single family.

| Role | Token / value |
|---|---|
| Display | `--text-display`: `clamp(2.15rem,3.5vw,3.35rem)`, line-height `1.06` |
| Section | `--text-section`: `clamp(1.65rem,2.6vw,2.25rem)` |
| Title | `--text-title`: `clamp(1.35rem,2vw,1.7rem)` |
| Body | `16px / 1.65`; long-form article body `17px / 1.75` |
| Small | `--text-sm`: `.875rem` |
| Eyebrow | `11–12px`, `700`, uppercase, `.14–.18em` tracking |

Numeric values in stats, facts, specifications, and tables use `font-feature-settings:"tnum"`.

### 1.3 Space, grid, radius, elevation

- Space scale: `--space-1` through `--space-9` (`4/8/12/16/24/32/48/64/88px`).
- Container: `--container: 1240px`; outer gutter is 24px desktop, 20px mobile.
- Section rhythm: `--section-space: clamp(72px,8vw,116px)`.
- Radius: `--radius-xs` 7, `--radius-s` 10, `--radius` 16, `--radius-l` 20.
- Elevation is quiet: use `--shadow-card` at rest and `--shadow-lift` only for actionable hover.
- Hairline: `--hairline: 1px solid var(--line)`.

Breakpoints: mobile `<620px`, tablet `<980px`, desktop `>=980px`.

## 2. Placeholder system

The starter ships zero media. `media_placeholder()` renders a neutral asset frame, never a fake product photo or arbitrary icon.

Required markup:

```html
<span class="media-fallback" role="img" aria-label="Asset purpose">
  <span class="media-grid"></span>
  <span class="media-frame"></span>
  <span class="media-cross"></span>
  <span class="media-label">1200 × 900 · 4:3</span>
</span>
```

Rules:

1. State the target pixel dimensions and ratio in every fallback.
2. Preserve the ratio declared by the component context.
3. Keep the label legible against the technical grid.
4. Include the asset purpose in screen-reader text where the placeholder is meaningful.
5. Do not substitute brand illustrations, stock photography, or icon placeholders.

## 3. Components

Templates compose components; components do not query content unless the contract explicitly passes a query. Data controllers in `inc/page-data.php` map ACF/CPT data to props. `inc/template-loader.php` owns routing and the main query loop for selectable product, category, and home layouts.

### Header and navigation

- Topbar carries one editable message and contact link.
- Sticky header remains readable over long pages and uses backdrop blur.
- Primary navigation supports two levels; keyboard focus and hover both reveal submenus.
- Active trail is visible for `current-menu-item` and `current-menu-ancestor`.
- Mobile keeps brand, CTA, and disclosure control in one row.

### Buttons

| Variant | Class | Behavior |
|---|---|---|
| Primary | `.button` | Accent fill; darken on hover; never relies on color alone |
| Secondary | `.ghost-button` | Hairline border, ink text; border strengthens on hover |
| Text link | `.more` | Accent text plus arrow, no underline |

Minimum interactive height is 44px. Focus uses the global visible ring.

### Cards

Cards are contextual, not interchangeable decoration.

| Variant | Intent |
|---|---|
| Product | media top, title, concise excerpt, visible action |
| Term / industry | compact tile for category navigation |
| Resource | dense linked data row |
| Blog | editorial media and metadata hierarchy |
| Related category | quiet tile used at the end of a range page |

All card bodies are vertical flex containers. Media holds a consistent ratio; text spacing and hover behavior come from tokens. Empty query states use `.empty-state`.

### Hero

Homepage hero is `7fr / 5fr` at desktop and one column below tablet. Copy order is eyebrow, H1, one short description, primary RFQ action, secondary catalogue action. H1 targets 15–17 characters per line and never overwhelms the media module.

### Factory proof

Proof items are `Value | Label` in ACF and render value first. The compact proof strip is a single ledger, not repeated cards. Full manufacturing capability may include capabilities, process, QC, and certifications, but a page must not repeat the same proof message in multiple adjacent modules.

### Category range page

Standard order:

1. Breadcrumb
2. Range hero with overline, H1, buyer description, 2×2 key-fact ledger, RFQ + selection actions
3. Compact factory proof
4. Section anchor navigation
5. Product catalogue / main loop
6. Selection guide
7. Benefits
8. Category specifications
9. Applications and use cases
10. Manufacturing capability
11. Compliance, process, RFQ checklist
12. Related ranges
13. Resources
14. FAQ
15. Long-form editorial content
16. Final conversion band

The anchor navigation is sticky, horizontally scrollable, and has pill-sized touch targets. Specification tables scroll horizontally on small screens without changing CMS structure.

### Product page

Product hero is gallery left, identity and conversion right. Quick specs render as a three-column technical ledger. Full specifications are followed by FAQ, then the native WordPress editor as the final long-form product details section. Related products and RFQ CTA close the page. Gallery slots use ACF Free image fields; there is no PRO gallery dependency.

### Editorial / blog

Archive uses an SEO-first H1 and description, featured post, then a consistent card grid. Article pages expose title, metadata, optional TOC, long-form body, figures, tables, tags, author, and related posts. Native editor content controls long-form hierarchy; structured product/category data remains in ACF.

## 4. Accessibility and state

- Preserve heading order; one visible H1 per route.
- Text contrast must be at least 4.5:1.
- Every interactive element has visible keyboard focus.
- Clickable cards use real links with meaningful accessible names.
- Forms label every input, describe errors in text, and preserve submissions where possible.
- Honor `prefers-reduced-motion`; animation is limited to subtle transform/opacity feedback.
- Touch targets remain at least 44px.
- Tables and scrollable media retain keyboard/pointer access on mobile.

## 5. WordPress implementation rules

- Use PHP templates and `get_template_part()`; no page builder.
- Page templates are selected through the native WP template dropdown.
- Product templates use `Template Post Type: starter_product`.
- Category layout selection and homepage layout selection are editable ACF fields.
- ACF Free only: text, textarea, true/false, select, image, relationship, message, tab, and equivalent fields.
- No ACF repeater or flexible content field in starter defaults.
- Structured specs, facts, galleries, related items, and repeated claims are ACF fields, not free-prose copy.
- The native editor owns long-form body content only.
- Every visible business claim must map to an admin-editable field.
- Selectable layout renderers own the main loop; layout partials never call `have_posts()`.
- Normal deploys must not rebuild navigation unless navigation rebuild is explicitly requested.

## 6. Visual QA checklist

Capture at least home, category, product, about/contact or core template, and blog at 390, 768, and 1440.

Check:

1. Content sits inside the shared shell at every breakpoint.
2. No horizontal page overflow.
3. Header, sticky anchor nav, and `scroll-padding` offsets are correct.
4. Hero H1 is restrained and copy hierarchy is clear.
5. Placeholders show dimensions and use the technical grid.
6. Facts, quick specs, and tables align numerically.
7. Cards and related modules do not become identical repeating boxes.
8. Empty states remain usable and explain the next action.
9. Mobile navigation, forms, tables, and galleries are touch-friendly.
10. Focus order is visible and logical.
