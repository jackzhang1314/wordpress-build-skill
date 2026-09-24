# B2B WordPress Starter Template

A production-ready B2B WordPress template for industrial suppliers, manufacturers and export companies. Fork → brand → launch in 30 minutes.

## What you get

| Area | Included |
|---|---|
| **Theme** | Responsive B2B design system (CSS variable driven), hero + stats + sections home page, product/industry/guide CPT templates, contact form page, mobile nav |
| **Content model** | `starter_product`, `starter_industry`, `starter_guide` CPTs + `product_collection` taxonomy with ACF fields (free version, no repeaters) |
| **Forms** | Fluent Forms RFQ page with styled form panel |
| **SEO** | Rank Math with per-post-type sitemap, product rich-snippet |
| **Email** | SMTP via wp-config constants (`theme/mu-plugins/smtp.php`) |
| **Backend editing** | ACF fields for products, industries, categories, factory profile, archive copy and contact content; Customizer for brand/contact globals |
| **Packaging** | `npm run package:starter` creates a reproducible tarball and SHA-256 manifest |
| **Docs** | `DESIGN.md` (design tokens), `CUSTOMIZE.md` (brand change guide), `DEPLOY.md` (launch checklist) |

## Quick start (3 steps)

### 1. Set your brand colours

Edit `theme/style.css` and change 3 variables:

```css
:root {
  --brand-primary: #1a1a2e;   /* your dark heading/ink colour */
  --brand-accent: #2563eb;    /* your CTA / link colour */
  --brand-surface: #f8f9fa;   /* your light section background */
}
```

Every derived colour (borders, muted text, shadows, hover states) updates automatically via `color-mix()`.

### 2. Replace placeholder content

- **Site name**: WordPress Admin → Settings → General
- **Contact email**: search `yourcompany.example` across `theme/` and replace
- **Product / industry / guide data**: edit `content/site-data.json`, or re-seed with `scripts/seed.php`
- **About page copy**: edit `content/patches/about.html`

### 3. Configure SMTP

Add to `wp-config.php` (above `/* That's all… */`):

```php
define('SMTP_HOST', 'smtp.yourprovider.com');
define('SMTP_PORT', 465);
define('SMTP_SECURE', 'ssl');
define('SMTP_USERNAME', 'noreply@yourdomain.com');
define('SMTP_PASSWORD', 'your-smtp-password');
define('SMTP_FROM', 'noreply@yourdomain.com');
define('SMTP_FROM_NAME', 'Your Company');
```

Then submit the contact form — a test email should arrive.

## Requirements

- WordPress 6.4+
- PHP 8.1+
- Plugins: ACF Free, Fluent Forms Free, Rank Math Free, Classic Editor

## Admin editing map

| Screen | Edits |
|---|---|
| **Products → Product specifications** | Wattage, efficacy, IP, warranty and `Label | Value` specification rows |
| **Product Highlights** | Checklist points shown on a product |
| **Industry Solutions** | Challenge and project-outcome fields |
| **Product Categories** | Intro, highlights, applications and FAQ |
| **Factory profile** | Factory intro, facts and capability cards |
| **Site copy** | Product / industry / guide / news archive intros and 404 copy |
| **Contact page content** | Intro, quoting checklist, form title and form note |
| **Appearance → Customize → Contact & Brand Info** | Email, phone, hours, topbar, footer, social links, homepage stats and CTA |

See `CUSTOMIZE.md` for the full brand-change checklist and `DEPLOY.md` for the launch runbook.

## File map

```
theme/style.css         — design tokens + all styles (change 3 vars here)
theme/*.php             — page templates (home, product, industry, guide, contact, about…)
theme/mu-plugins/smtp.php — SMTP config (reads wp-config constants)
plugin/starter-model.php — CPTs + ACF fields
content/site-data.json  — seed content (products, industries, guides, pages)
content/patches/about.html — About page body HTML
DESIGN.md               — design system reference for AI and humans
CUSTOMIZE.md            — what to change, where
DEPLOY.md               — production launch checklist
```
