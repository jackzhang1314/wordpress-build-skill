# WordPress Builder Core

Theme-independent plugin installed by WordPress Builder. It registers Builder content types, taxonomies, ACF fields and page templates without modifying the active theme.

## Version

Current version: `1.1.0`

## Content layer

The plugin registers:

- `builder_project`
- `builder_service`
- `builder_category`
- Builder Canvas page template
- Builder Landing page template

All templates support `page`, `builder_project`, and `builder_service`. They call `get_header()`, `get_footer()`, and `the_content()`, so the existing site chrome and main editable body remain intact.

## Editable fields

Builder Core exposes nine free-ACF fields with individual REST exposure and admin instructions:

| Field | Type | Landing usage |
| --- | --- | --- |
| `wbc_subtitle` | text | Hero eyebrow |
| `wbc_summary` | textarea | Hero summary |
| `wbc_cta_label` | text | Primary action |
| `wbc_cta_url` | url | Primary action destination |
| `wbc_benefits` | textarea | Buyer benefit cards |
| `wbc_specifications` | textarea | Specification table |
| `wbc_faq` | textarea | FAQ disclosures |
| `wbc_secondary_cta_label` | text | Bottom action |
| `wbc_secondary_cta_url` | url | Bottom action destination |

Line-based fields use one item per line:

```text
Benefit | Supporting detail
Label | Value
Question | Answer
```

No Repeater, Gallery, Flexible Content, or ACF PRO feature is required.

## Scoped styles

Styles live in:

```text
assets/css/wordpress-builder-core.css
```

They are scoped under `.wordpress-builder-template`, loaded only for supported content using a Builder template, and do not replace the active theme's header, footer, fonts, or global styles.

## Existing editor sites

Builder Core is intentionally parallel to historical Elementor, Divi, Bricks, or custom-editor pages:

- old pages stay untouched;
- no third-party editor data is interpreted or rewritten;
- new Builder-managed pages use the Builder CPT/ACF/plugin-template layer.
