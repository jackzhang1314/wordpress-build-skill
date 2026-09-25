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
