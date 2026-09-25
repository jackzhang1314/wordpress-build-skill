---
name: wordpress-content
description: Edit existing WordPress pages, posts, navigation, ACF/CMS models and forms using project-aware source or external workflows, with backend editability and shape limits enforced.
---

# WordPress Content and CMS

Use this skill for page bodies, posts, navigation, ACF fields, CPT/taxonomy questions, forms, media mappings and CMS audits.

## First checks

1. Confirm `mode`.
2. For external projects, inspect WordPress shape with `project inspect`.
3. Confirm whether navigation is a classic menu, block navigation or mixed.
4. Confirm whether the page template is classic or FSE.
5. Confirm whether any new field is editable in WordPress admin.

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
- If PHP/template code must change, stop and propose a scoped source-custody upgrade.

## References

- [Content model](references/content-model.md)
- [ACF](references/acf.md)
- [Pages and posts](references/pages-posts.md)
- [Navigation](references/navigation.md)
- [Forms](references/forms.md)
- [Media](references/media.md)
- [Search quality](references/search-quality.md)
