# Builder Core

Builder Core is a theme-independent plugin installed by WordPress Builder.

It adds:

1. Builder Project and Builder Service CPTs;
2. Builder Category taxonomy;
3. ACF-backed editable fields;
4. plugin-owned Canvas and Landing page templates;
5. a stable content layer that works independently of the old theme, Elementor, Divi or another editor.

Install it on an adopted site with:

```bash
node wordpress-builder.mjs --project . builder install
```

By default the command creates a backup, installs/activates ACF, syncs Builder Core and verifies its CPTs.

Old pages remain untouched. New Builder-managed pages can use:

```text
WordPress Builder Canvas
WordPress Builder Landing
```

This lets the Builder add new landing/product/service pages with its own ACF and template contracts without converting existing Elementor, Divi or custom-editor pages.
