---
name: wordpress-content
description: Edit existing WordPress pages, posts, navigation, ACF/CPT models and forms across Classic, Block/FSE, page-builder and hybrid WordPress sites, with backend editability and rendering-system safety enforced.
---

# WordPress Content and CMS

Use this skill for page bodies, posts, navigation, ACF fields, CPT/taxonomy questions, forms, media mappings and CMS audits.

## First checks

1. Confirm `mode`.
2. Confirm the rendering system: Classic PHP, Block/FSE, page builder, hybrid or unknown.
3. For external projects, inspect the live WordPress shape with `project inspect`; for Block/FSE or hybrid sites, add route-level `project inspect --route-set core` before navigation/template work.
4. Confirm whether navigation is a classic menu, block navigation, page-builder menu/module or mixed.
5. Confirm whether the page uses a classic PHP template, FSE template or page-builder layout.
6. Confirm whether any new field is editable in WordPress admin.

## Commands

```bash
node wordpress-builder.mjs --project . status
node wordpress-builder.mjs --project . project inspect --route-set core --json
node wordpress-builder.mjs --project . edit-page about --file body.html --adopt-remote
node wordpress-builder.mjs --project . post push article.json
node wordpress-builder.mjs --project . nav add Products --url /products/
node wordpress-builder.mjs --project . nav remove 'Old label'
node wordpress-builder.mjs --project . nav block plan --route / --file content/block-nav.json
node wordpress-builder.mjs --project . nav block apply --plan <plan-id>
node wordpress-builder.mjs --project . template assign about --template page-templates/customer.php
node wordpress-builder.mjs --project . template assign service --template builder-templates/canvas.php --post-type builder_service
node wordpress-builder.mjs --project . cms-audit
node wordpress-builder.mjs --project . audit-fields
```

## External limits

- Do not deploy.
- Do not overwrite theme/plugin code.
- Classic navigation and classic page-template assignment are verified capabilities.
- Block navigation requires route-level ownership. A supported flat `wp_navigation` list may use `nav block plan` then `nav block apply`; inline navigation, submenus and template-part markup still require an authorized source-custody workflow. Do not use classic menu commands as a workaround.
- Page-builder layouts require builder-specific inspection before markup or template claims.
- `edit-page` updates `post_content`; it must not be presented as visible editing for an Elementor-owned historical page. The command refuses `_elementor_edit_mode=builder` writes instead of silently changing fallback content.
- If PHP/template code must change, stop and propose a scoped source-custody upgrade.
- Existing content, navigation and page-template writes create a lightweight restore snapshot in `.backups/external-writes/`.

## Builder-managed new pages

For an existing Elementor, Divi or custom-editor site, do not convert old pages. Install Builder Core, then create new pages with Builder CPTs, ACF fields and plugin-owned page templates:

```bash
node wordpress-builder.mjs --project . builder install
node wordpress-builder.mjs --project . builder page plan --file content/builder-page.json
node wordpress-builder.mjs --project . builder page apply --plan <plan-id>

# Legacy surgical path when the dedicated workflow is not suitable:
node wordpress-builder.mjs --project . post push new-page.json
node wordpress-builder.mjs --project . template assign new-page --template builder-templates/landing.php
node wordpress-builder.mjs --project . template assign service --template builder-templates/canvas.php --post-type builder_service
```

Historical Elementor/Divi/Bricks pages stay on their original rendering owner. Builder Core only adds the parallel Builder content layer. Editing third-party page-builder data is a product non-goal: old editor pages are left to their native editor, while new Builder-managed pages use the Builder CPT/ACF/template architecture.

Builder Core `1.1.0` supports nine editable fields: hero subtitle/summary, primary CTA, buyer benefits, specifications, FAQ and bottom CTA. Builder Landing renders these with the main editor body; no Repeater or ACF PRO is required.

## References

- [Content model](references/content-model.md)
- [ACF](references/acf.md)
- [Pages and posts](references/pages-posts.md)
- [Navigation](references/navigation.md)
- [Forms](references/forms.md)
- [Media](references/media.md)
- [Search quality](references/search-quality.md)
