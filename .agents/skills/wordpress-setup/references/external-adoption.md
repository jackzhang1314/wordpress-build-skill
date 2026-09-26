# External Adoption

Use adoption for an existing WordPress site without taking ownership of its code.

```bash
node wordpress-builder.mjs adopt <project-name> --domain <domain>
```

Adoption records the live site URL, WordPress version, active theme, plugins, rendering system, navigation/template/layout shape and content counts, then creates `mode: external`.

Adoption is theme-agnostic. It supports Classic PHP themes, Block/FSE themes, hybrid themes and page-builder sites such as Elementor, Divi, Beaver Builder, WPBakery, Bricks or Oxygen. Inspection records the adapter needed; it does not treat a non-Starter implementation as incompatible.

External projects protect the customer implementation. Content, navigation and existing-template assignment are allowed. Source deployment is blocked.

If theme/plugin code must change, inspect and back up first, then propose an explicit source-custody upgrade.
