# Deployment Guide

Launch checklist for taking the starter template from local development to production.

## Pre-flight (local)

- [ ] Brand colours changed in `theme/style.css` (3 variables)
- [ ] Placeholder text replaced (`yourcompany.example`, `Your Company`)
- [ ] Product/industry/guide content reviewed and correct
- [ ] Hero photo uploaded (Media Library, title = `hero`)
- [ ] Contact form tested locally (submits and shows success)
- [ ] SMTP constants verified with a real email test
- [ ] `DESIGN.md` tokens match current `theme/style.css`

## Hosting setup

### 1. Server requirements

| Requirement | Minimum |
|---|---|
| WordPress | 6.4 |
| PHP | 8.1 |
| MySQL / MariaDB | 8.0 / 10.4 |
| HTTPS | Required (auto-redirect) |

### 2. Install WordPress

1. Create a database and user
2. Upload WordPress to `public_html/`
3. Run the installer
4. Set permalink structure: **Post name**

### 3. Upload theme and plugin

```sh
# Theme
rsync -av theme/ your-server:~/public_html/wp-content/themes/your-brand/

# Plugin
rsync -av plugin/ your-server:~/public_html/wp-content/plugins/your-brand-model/
```

Activate both in WP Admin → Appearance / Plugins.

### 4. Install required plugins

Install from wp.org (free versions):

| Plugin | Purpose |
|---|---|
| Advanced Custom Fields (free) | CPT fields |
| Fluent Forms (free) | Contact form |
| Rank Math SEO (free) | SEO + sitemap |
| Classic Editor | Classic editing experience |

### 5. Configure wp-config.php

Add **above** the line `/* That's all, stop editing! */`:

```php
define('SMTP_HOST', 'smtp.yourprovider.com');
define('SMTP_PORT', 465);
define('SMTP_SECURE', 'ssl');
define('SMTP_USERNAME', 'noreply@yourdomain.com');
define('SMTP_PASSWORD', 'your-real-smtp-password');
define('SMTP_FROM', 'noreply@yourdomain.com');
define('SMTP_FROM_NAME', 'Your Company');
```

Also verify `WP_DEBUG` is `false` and `DISALLOW_FILE_EDIT` is `true`.

### 6. Seed content (first deploy only)

```sh
# Via WP-CLI on the server
wp eval-file scripts/seed.php
```

This imports products, industries, guides, pages and menus from `content/site-data.json`.

### 7. Create the contact form

If Fluent Forms doesn't auto-create form ID 3, create it manually:

1. WP Admin → Fluent Forms → New Form → blank
2. Add fields: Name, Email, Company, Message
3. Note the form ID
4. Edit the Contact page → insert `[fluentform id="N"]` shortcode
5. Notification → send to `sales@yourdomain.com`

## Post-launch verification

- [ ] Homepage loads (200)
- [ ] `/products/`, `/industries/`, `/guides/` archives return 200
- [ ] At least one product detail page returns 200
- [ ] Contact page renders the form
- [ ] Submit a test form → email received
- [ ] `/sitemap_index.xml` returns 200 and includes product/guide URLs
- [ ] No `yourcompany.example` or `Your Company` placeholders remain in visible text
- [ ] All pages use HTTPS (no mixed content)
- [ ] Mobile: nav opens/closes, form submits, layout has no horizontal scroll
- [ ] 404 page renders (visit a random URL)
- [ ] WordPress admin login works

## Maintenance

| Task | Frequency |
|---|---|
| Update WordPress core / plugins | Weekly |
| Backup database + `wp-content` | Daily (hosting provider) |
| Review Rank Math sitemap submission in Google Search Console | Once |
| Test contact form email delivery | Monthly |

## Rollback

Keep a copy of `theme/` and `plugin/` from the last working deploy. To restore:

```sh
rsync -av --delete theme-backup/ your-server:~/public_html/wp-content/themes/your-brand/
```

Content edits in WP Admin survive theme restores (they live in the database).

## Visual verification (390 / 768 / 1440)

After any deploy, capture every declared route at all three breakpoints:

```sh
node ../../harness/cli.mjs --project . verify --screenshots          # full gate + screenshots
node ../../harness/cli.mjs --project . screenshot --routes /,/products/ --widths 390,768,1440
```

Screenshots land in `evidence/screenshots/` as `WIDTH--route.png`. The gate
fails when any capture is missing or suspiciously small (error page). Chrome
is auto-detected; set `CHROME_BIN` to override.
