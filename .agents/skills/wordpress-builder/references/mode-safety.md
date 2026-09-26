# Mode Safety

## Source

Local source owns deployable theme/plugin code. Source may be Starter or custom.

Allowed core operations include `check`, `backup`, `deploy`, `media`, `content`, `setup`, `configure-seo`, `rollback` and `verify`.

## External

The local project does not own the live implementation.

Allowed:

```text
status, backup, edit-page, post push, nav, template assign, cms-audit, audit-fields, credentials, verify
```

Blocked:

```text
deploy, media, content, setup, configure-seo
```

If PHP/theme/plugin code must change, stop and propose a scoped source-custody upgrade after full backup and explicit authorization.
Before navigation or page-template writes on Block/FSE/hybrid sites, run route-level `project inspect --route-set core`. Unreferenced `wp_navigation` posts and unrendered Classic menu locations are not write permission. Mixed/unknown ownership must remain blocked.
External Block/FSE navigation writes are limited to the two-phase `nav block plan` / `nav block apply` workflow for a route-owned, flat `wp_navigation` list. Template/template-part and inline-navigation edits still require source custody.
