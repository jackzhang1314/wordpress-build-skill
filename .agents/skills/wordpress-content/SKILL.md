---
name: wordpress-content
description: Edit existing WordPress pages, posts, navigation, ACF/CPT models and forms across Classic, Block/FSE, page-builder and hybrid WordPress sites, with backend editability and rendering-system safety enforced.
---

# WordPress Content and CMS

Use this skill for page bodies, posts, navigation, ACF fields, CPT/taxonomy questions, forms, media mappings and CMS audits.

## First checks

1. Confirm `mode`.
2. Confirm the rendering system: Classic PHP, Block/FSE, page builder, hybrid or unknown.
3. For external projects, inspect the live WordPress shape with `project inspect`.
4. Confirm whether navigation is a classic menu, block navigation, page-builder menu/module or mixed.
5. Confirm whether the page uses a classic PHP template, FSE template or page-builder layout.
6. Confirm whether any new field is editable in WordPress admin.

## Commands

```bash
node wordpress-builder.mjs --project . status
node wordpress-builder.mjs --project . edit-page about --file body.html --adopt-remote
node wordpress-builder.mjs --project . post push article.json
node wordpress-builder.mjs --project . nav add Products --url /products/
node wordpress-builder.mjs --project . nav remove 'Old label'
node wordpress-builder.mjs --project . template assign about --template page-templates/customer.php
node wordpress-builder.mjs --project . cms-audit
node wordpress-builder.mjs --project . audit-fields
```

## External limits

- Do not deploy.
- Do not overwrite theme/plugin code.
- Classic navigation and classic page-template assignment are verified capabilities.
- Block navigation and FSE templates require inspection before a write.
- Page-builder layouts require builder-specific inspection before markup or template claims.
- If PHP/template code must change, stop and propose a scoped source-custody upgrade.
- Existing content, navigation and page-template writes create a lightweight restore snapshot in `.backups/external-writes/`.

## Builder-managed new pages

For an existing Elementor, Divi or custom-editor site, do not convert old pages. Install Builder Core, then create new pages with Builder CPTs, ACF fields and plugin-owned page templates:

```bash
node wordpress-builder.mjs --project . builder install
node wordpress-builder.mjs --project . post push new-page.json
node wordpress-builder.mjs --project . template assign new-page --template builder-templates/landing.php
```

## References

- [Content model](references/content-model.md)
- [ACF](references/acf.md)
- [Pages and posts](references/pages-posts.md)
- [Navigation](references/navigation.md)
- [Forms](references/forms.md)
- [Media](references/media.md)
- [Search quality](references/search-quality.md)
