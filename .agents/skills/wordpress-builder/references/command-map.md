# Command Map

Canonical invocation:

```bash
node wordpress-builder.mjs --project <site-dir> <command>
```

The legacy `node harness/cli.mjs` path remains a compatibility alias.

See `harness/lib/command-map.mjs` for the machine-readable command ownership, project-mode restrictions and risk classification. Key rules:

1. `sites list` and read-only `sites status` are available after Hostinger account setup and before a project is selected.
2. `builder install` is allowed on source or external sites because it adds an isolated plugin instead of overwriting theme/plugin source.
3. `builder page plan` is local-only; `builder page apply` creates or updates only a Builder CPT with plugin-owned templates, ACF whitelist fields and live rollback verification.
4. `deploy`, `media`, `content`, `setup` and `configure-seo` are source-only.
5. `edit-page`, `post`, `nav`, `template assign`, `backup`, `status`, audits and `verify` can be external.
6. `nav block plan` is local-only; `nav block apply` is external-safe only for a route-owned flat `wp_navigation` list and includes restore/live verification.
7. `block-template plan` is local-only; `block-template apply` is external-safe only for a selected route template/part, one unique patch and rollback-protected live verification.
8. `wp` passes arbitrary WP-CLI arguments; inspect the command before treating it as safe.
9. Any production write requires confirmation, backup or rollback policy and live verification.
