# Builder Core

Builder Core is a theme-independent plugin installed by WordPress Builder.

It adds:

1. Builder Project and Builder Service CPTs;
2. Builder Category taxonomy;
3. ten ACF-backed editable fields covering hero, CTA, benefits, specifications, FAQ, Fluent Forms RFQ and bottom action;
4. plugin-owned Canvas and responsive industrial Landing templates;
5. a stable content layer that works independently of the old theme, Elementor, Divi or another editor.

The content contract is intentional: every Builder Core ACF field is individually REST-exposed (`show_in_rest`) and carries non-empty admin instructions. Group-level REST settings do not replace field-level settings, and undocumented fields fail the CMS audit.

Install it on an adopted site with:

```bash
node wordpress-builder.mjs --project . builder install
node wordpress-builder.mjs --project . builder form install
```

`builder form install` installs/activates Fluent Forms when needed and creates or reuses the purpose-built `Builder equipment RFQ` form. It prints the numeric shortcode for `wbc_form_shortcode`.

By default the command creates a backup, installs/activates ACF, syncs Builder Core and verifies its CPTs.

Old pages remain untouched. New Builder-managed pages should use the two-phase workflow:

```bash
node wordpress-builder.mjs --project . builder page plan --file content/builder-page.json
node wordpress-builder.mjs --project . builder page apply --plan <plan-id>
```

The input binds a `builder_project` or `builder_service` to a Builder-owned template, writes only the ten Builder Core ACF fields, verifies the live permalink and rolls back automatically on failure. Available templates include:

```text
WordPress Builder Canvas
WordPress Builder Landing
```

This lets the Builder add new landing/product/service pages with its own ACF and template contracts without converting existing Elementor, Divi or custom-editor pages.


## Field and template contract

Builder Core `1.2.0` fields:

```text
wbc_subtitle
wbc_summary
wbc_cta_label
wbc_cta_url
wbc_benefits
wbc_specifications
wbc_faq
wbc_form_shortcode
wbc_secondary_cta_label
wbc_secondary_cta_url
```

Line-based fields use:

```text
Benefit | Supporting detail
Label | Value
Question | Answer
```

The Landing template renders the main editor body, buyer benefits, specifications, FAQ, an optional numeric Fluent Forms RFQ and a bottom CTA in that order. Styles are scoped to `.wordpress-builder-template`; the active theme header/footer and fonts remain responsible for site chrome.
