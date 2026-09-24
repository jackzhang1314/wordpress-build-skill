# B2B Starter Design System

> **Single source of truth** for the starter template's visual language.
> Written for both humans and AI: read the tokens, follow the components,
> and every new page will match the existing site.

## 1. Design Tokens

### 1.1 Brand tokens (the only values users change)

| Token | Default | Usage |
|---|---|---|
| `--brand-primary` | `#0B1526` | Headings, footer links, dark accents, shadows |
| `--brand-accent` | `#1D5BDB` | Buttons, links, eyebrows, active states, focus rings |
| `--brand-surface` | `#F6F8FB` | Light section backgrounds, card tint, hero gradient base |

Override in a child theme or `<style>` block:

```css
:root {
  --brand-primary: #1a1a2e;
  --brand-accent: #2563eb;
  --brand-surface: #f8f9fa;
}
```

### 1.2 Derived tokens (auto-generated — do not hardcode)

| Token | Formula | Usage |
|---|---|---|
| `--paper` | `#FFFFFF` | Body background |
| `--surface` | `var(--brand-surface)` | Tinted section / card backgrounds |
| `--surface-2` | `mix(surface 82%, primary)` | Table header tint, hover rows |
| `--ink` | `var(--brand-primary)` | Heading colour, dark text |
| `--body` | `mix(primary 78%, surface)` | Body copy |
| `--muted` | `mix(primary 55%, surface)` | Secondary copy, captions |
| `--faint` | `mix(primary 34%, surface)` | Breadcrumb labels, de-emphasised text |
| `--line` | `mix(primary 10%, white)` | Default 1px borders |
| `--line-strong` | `mix(primary 18%, white)` | Emphasised borders, ghost-button edges |
| `--accent-dark` | `mix(accent 80%, black)` | Button hover background |
| `--accent-soft` | `mix(accent 8%, white)` | Card chip backgrounds, callout tint |
| `--accent-line` | `mix(accent 30%, white)` | Accent-tinted borders (FAQ open, term hover) |
| `--ring` | `mix(accent 16%, transparent)` | Focus ring and card focus shadow |
| `--ok` | `#0E8345` | Success / availability dot (fixed, not brand-derived) |
| `--ok-soft` | `#EAF7F0` | Success background |
| `--ok-line` | `#BFE5D0` | Success border |
| `--danger` | `#D92D20` | Required-field asterisk (fixed) |

### 1.3 Typography

- **Font stack**: `"InterVariable","Inter","Helvetica Neue",Arial,system-ui,-apple-system,"Segoe UI",sans-serif`
- Self-hosted variable font at `assets/fonts/InterVariable.woff2` with `font-display: swap`
- Body: `16.5px` / line-height `1.75`; mobile: `16px`
- Headings: weight 700, line-height `1.14`, letter-spacing `-.022em`

| Element | Size | Notes |
|---|---|---|
| `h1` (hero) | `clamp(38px, 4.8vw, 62px)` | letter-spacing `-.03em` |
| `h1` (product) | `clamp(30px, 3.6vw, 44px)` | |
| `h2` (section) | `clamp(24px, 2.6vw, 30px)` | |
| `h2` (callout / panel) | `20px` — `22px` | |
| `h3` (card title) | `17px` — `18.5px` | |
| `.eyebrow` | `12px`, uppercase, weight 700 | `letter-spacing .15em` |
| body | `16.5px` / `16px` mobile | |
| `.card .excerpt` | `14.5px` / `1.62` | |
| small labels | `12px` — `13px` | |

### 1.4 Spacing

4px base. Common values: `4 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 26 · 28 · 32 · 36 · 40 · 44 · 48 · 52 · 56 · 64 · 72 · 76 · 80 · 100`

Layout variables:

| Token | Value | Purpose |
|---|---|---|
| `--shell` | `1200px` | Content container max-width |
| `--gutter` | `48px` (desktop) / `36px` (≤1080) / `20px` (≤640) | Horizontal page padding |
| `--header-h` | `72px` (desktop) / `64px` (≤1020) | Sticky header height |

Section rhythm: `.section { margin-top: 84px }` (76px on ≤980). CTA band: `margin-top: 100px` (76px on ≤980). Hero top padding: `76px` (56px on ≤1020).

### 1.5 Radius

| Token | Value | Usage |
|---|---|---|
| `--radius` | `16px` | Cards, stat blocks, cta-card, photos |
| `--radius-s` | `10px` | Buttons, inputs, FAQ, guide-nav, small blocks |
| `--radius-xs` | `8px` | Nav links, toggle, sub-menu items, skip-link |

Special: hero photo `20px`, hero photo offset `24px`, form panel `18px`, cta-band `20px`, footer badge `999px` (pill).

### 1.6 Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 1px 2px mix(primary 5%)` | Static cards, hero-tag, form-panel |
| `--shadow-lift` | `0 16px 40px -16px mix(primary 22%), 0 2px 6px mix(primary 5%)` | Button / card hover, sub-menu |
| `--shadow-header` | `0 10px 30px -18px mix(primary 25%)` | `.site-header.is-elevated` |

### 1.7 Breakpoints

| Width | Changes |
|---|---|
| `≤1080px` | `--gutter: 36px`; nav padding tighter |
| `≤1020px` | `--header-h: 64px`; desktop nav + header CTA hidden; mobile nav enabled; hero/product/contact collapse to 1 column |
| `≤980px` | Grids → 2 columns; stats → 1 column; section/CTA margins reduced; footer → 2 columns |
| `≤640px` | `--gutter: 20px`; body 16px; all grids → 1 column; topbar hidden; footer → 1 column; page-head padding reduced |

## 2. Components

### 2.1 Button (`.button`)

```html
<a class="button" href="/contact/">Request a quotation</a>
<a class="button button-s" href="/contact/">Request a quote</a>
<a class="ghost-button" href="/products/">Browse the catalogue</a>
```

| Property | Value |
|---|---|
| Background | `var(--accent)` |
| Colour | `#fff` |
| Border | `1px solid var(--accent)` |
| Padding | `13px 26px` (normal), `10px 18px` (small) |
| Radius | `var(--radius-s)` |
| Font | `15px`, weight 600 |
| Hover | background `var(--accent-dark)`, `translateY(-1px)`, `--shadow-lift` |

Ghost button: white background, `--line-strong` border, `--ink` text; hover → `--accent` border/text, `--accent-soft` background.

**Don't**: use `<button>` for navigation links, or apply `.button` to non-interactive elements.

### 2.2 Card (`.card`)

Structure (from `parts/card.php`):

```html
<article class="card">
  <a class="card-media" href="..."><!-- img or media-fallback SVG --></a>
  <div class="card-body">
    <span class="card-chip">Category</span>
    <h2 class="card-title"><a href="...">Title</a></h2>
    <p class="excerpt">Trimmed excerpt, max 22 words.</p>
    <span class="more">View product</span>
  </div>
</article>
```

- White background, `--line` border, `--radius`
- Hover: `translateY(-4px)`, `--shadow-lift`, `--line-strong` border
- `:focus-within`: accent border + `ring` shadow
- Media: `aspect-ratio 4/3`; image scales `1.045` on hover
- Chip: `--accent-soft` background, accent text, `999px` pill

### 2.3 Form fields (`.rfq-form` / Fluent Forms)

```html
<label for="email">Email</label>
<input type="email" id="email" name="email">
```

| Property | Value |
|---|---|
| Border | `1px solid var(--line)` |
| Radius | `var(--radius-s)` |
| Padding | `12px 14px` (native) / `11px 14px` (Fluent) |
| Focus | `--accent` border + `--ring` box-shadow, no outline |
| Submit | inherits `.button` styles |
| Required | red `--danger` asterisk |
| Success | `--ok-soft` background, `--ok-line` border |

### 2.4 Navigation

**Topbar**: `--surface` background, 13px muted text, green dot, email link.

**Primary nav** (desktop): horizontal flex, 14.5px, weight 570, muted colour.
Hover: `--ink` colour + 60% accent underline bar slides in. Current item: `--ink`, full accent underline.

**Dropdown** (below header): white card, `--radius-s` items, accent-soft hover.

**Mobile nav**: full-screen fixed overlay below header, white `.98` opacity, 18px items, 15.5px sub-items, `.button` CTA at bottom.

### 2.5 Table (spec)

```html
<table class="spec-table">
  <tr><th>Label</th><td>Value</td></tr>
</table>
```

- `--line` border, `--radius`, white background, separate borders
- `th`: 34% width, `--surface` background, muted, weight 550
- Row hover: white-mixed surface; `th` hover: `--surface-2`
- `font-variant-numeric: tabular-nums`

### 2.6 Breadcrumb

```html
<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>
  <li><a href="/">Home</a></li>
  <li><a href="/products/">Products</a></li>
  <li aria-current="page">Product name</li>
</ol></nav>
```

13px, `--faint` colour, `/` separator via `li+li::before`, current item `--ink` weight 550.

### 2.7 CTA band

```html
<section class="cta-band">
  <div class="section-heading">
    <div><p class="eyebrow">Start here</p><h2>Heading</h2><p>Support line.</p></div>
    <a class="button" href="/contact/">Action</a>
  </div>
</section>
```

Gradient `surface → accent-soft`, `--line` border, `20px` radius, responsive padding.

### 2.8 Section heading

```html
<div class="section-heading">
  <div><p class="eyebrow">Label</p><h2>Title</h2></div>
  <a class="more" href="...">View all</a>
</div>
```

Flex row (column on ≤640), `margin-bottom: 40px`. `.more` link has animated `→` arrow.

### 2.9 Stat block

```html
<div class="stat"><b>150 lm/W</b><span>System efficacy, up to</span></div>
```

Surface gradient background, 3px accent top bar, `clamp(26px,2.8vw,34px)` value, tabular numerals.

## 3. Layout Patterns

### 3.1 Page head

```html
<header class="page-head">
  <?php breadcrumbs(); ?>
  <p class="eyebrow">Label</p>
  <h1>Page title</h1>
  <p>One-sentence summary.</p>
</header>
```

### 3.2 Hero (home)

Two-column grid (`1.04fr / .96fr`), eyebrow + h1 + prose + actions + badges on left, photo with offset accent-soft frame and hero-tag on right. Collapses to 1 column at ≤1020.

### 3.3 Archive grid

`page-head` → `.grid.archive-grid` (3 columns, 2 on ≤980, 1 on ≤640) → pagination.

### 3.4 Two-column product

`.product-layout`: sticky photo left (`.product-photo`, top = header + 24px), summary + specs + CTAs right. Collapses ≤1020.

### 3.5 Two-column contact

`.contact-layout`: guidance aside (checks, direct lines) + `.form-panel` (form). Collapses ≤1020.

### 3.6 Container

All content in `.shell` — `min(1200px, 100% - 2×gutter)`, centred.

## 4. Do & Don't

### Do

1. Always use design tokens (`var(--accent)`, `var(--radius)`) — never hex values in component rules.
2. Keep brand identity to the 3 `--brand-*` variables; test contrast (WCAG AA) after changing them.
3. Follow the component HTML structure exactly — class names are the API.
4. Use `clamp()` for responsive type so no separate mobile styles are needed.
5. Use `media_placeholder()` SVG fallback when no featured image exists.

### Don't

1. Don't hardcode colours in new CSS — add or use a token.
2. Don't introduce new font families or load Google Fonts; the system stack + self-hosted Inter is the baseline.
3. Don't override shadows or radii inline; use the scale.
4. Don't add content above `.eyebrow` or between `.section-heading` and its section content.
5. Don't use `!important` for brand styling — it breaks the override system.
