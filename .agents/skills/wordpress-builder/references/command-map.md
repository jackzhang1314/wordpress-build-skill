# Command Map

Canonical invocation:

```bash
node wordpress-builder.mjs --project <site-dir> <command>
```

The legacy `node harness/cli.mjs` path remains a compatibility alias.

See `harness/lib/command-map.mjs` for the machine-readable command ownership, project-mode restrictions and risk classification. Key rules:

1. `sites list` and read-only `sites status` are available after Hostinger account setup and before a project is selected.
2. `builder install` is allowed on source or external sites because it adds an isolated plugin instead of overwriting theme/plugin source.
3. `deploy`, `media`, `content`, `setup` and `configure-seo` are source-only.
4. `edit-page`, `post`, `nav`, `template assign`, `backup`, `status`, audits and `verify` can be external.
5. `wp` passes arbitrary WP-CLI arguments; inspect the command before treating it as safe.
6. Any production write requires confirmation, backup or rollback policy and live verification.
