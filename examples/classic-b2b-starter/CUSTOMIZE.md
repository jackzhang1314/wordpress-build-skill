# Customization Guide

Change the template into your branded B2B site. Work through the sections in order.

## 1. Brand colours (30 seconds)

Edit `theme/style.css` — change **only** these three values:

| Token | What it controls | Example |
|---|---|---|
| `--brand-primary` | Headings, dark ink, shadow base | `#1a1a2e` (navy), `#1b1b1b` (charcoal) |
| `--brand-accent` | Buttons, links, eyebrows, focus | `#2563eb` (blue), `#0E8345` (green), `#D97706` (amber) |
| `--brand-surface` | Light section tint, card backgrounds | `#f8f9fa` (warm grey), `#f0f4f8` (cool grey) |

Every other colour is derived automatically. Verify contrast:

- `--brand-accent` on white: minimum 4.5:1 for text usage
- `--brand-primary` on `--brand-surface`: minimum 7:1 for headings

See `DESIGN.md` for the full token reference.

## 2. Site identity (5 minutes)

| What | Where |
|---|---|
| Site name | WP Admin → Settings → General → Site Title |
| Tagline | WP Admin → Settings → General → Tagline |
| Logo | Replace `theme/assets/favicon.svg`; add custom logo via Customizer or hardcode in `header.php` |
| Contact email | Search `sales@yourcompany.example` across `theme/` (header, footer, page-contact) and replace |
| Working hours | `theme/footer.php` + `theme/page-contact.php` — edit the `Mon–Fri, 9:00–18:00 (GMT+8)` string |

## 3. Content (20 minutes)

### Pages

| Page | Source | How to edit |
|---|---|---|
| Home hero + sections | `content/site-data.json` → `pages[0]` | Edit `title`, `excerpt` (hero subhead), `content` (hero prose) |
| About page body | `content/patches/about.html` | Edit raw HTML |
| About page facts | `theme/functions.php` → `factory_defaults()` | Edit the `stats` and `capabilities` textarea strings |
| Contact page | `theme/page-contact.php` | Edit the aside checklist and direct-lines section |

### Products / Industries / Guides

Edit `content/site-data.json` and re-seed, or edit in WP Admin:

| Post type | Slug base | Archive |
|---|---|---|
| `starter_product` | `/products/` | `/products/` |
| `starter_industry` | `/industries/` | `/industries/` |
| `starter_guide` | `/guides/` | `/guides/` |
| `product_collection` (taxonomy) | `/product-category/` | Category pages |

Each product has ACF fields: `wattage`, `efficacy`, `ip_rating`, `warranty`, `specs` (textarea — one `Label | Value` per line).

### Navigation

WP Admin → Appearance → Menus. Assign to **Primary navigation**. Sub-menu items become dropdowns automatically.

## 4. Images

| Asset | Where |
|---|---|
| Hero photo | Upload to Media Library with post_title = `hero` |
| Product photos | Set featured image on each product |
| Placeholder fallback | Automatic SVG icons when no featured image is set |
| Favicon | `theme/assets/favicon.svg` |

## 5. Email

Add constants to `wp-config.php` (see README §3). Test by submitting the contact form.

## 6. Forms

The contact form uses Fluent Forms (form ID 3). To change fields:

1. WP Admin → Fluent Forms → edit the RFQ form
2. Styling comes from `theme/style.css` — no plugin-level changes needed
3. Notification email uses the SMTP constants

## 7. SEO

1. WP Admin → Rank Math → verify site is registered
2. Sitemap: `/sitemap_index.xml` (auto-generated)
3. Each product/guide gets a meta box — set focus keyword and description
4. Organization name: `project.json` → `seo.organization` (seed only) or Rank Math settings

## What NOT to change

| File | Reason |
|---|---|
| `plugin/starter-model.php` CPT slugs | Breaks theme template file naming (`single-starter_product.php` etc.) |
| Theme class names (`Starter\Theme\…`) | Referenced across templates |
| `DESIGN.md` token names | AI-generated pages follow this document |
| `content/media-map.json` structure | The seed script depends on the format |

If you must rename a CPT, search-and-replace `starter_product` → `your_product` and rename the corresponding template files together.
