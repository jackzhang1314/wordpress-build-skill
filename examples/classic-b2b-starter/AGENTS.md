# b2b-starter

Classic PHP theme + ACF project.

- Presentation lives in `theme/`; business models and ACF fields live in `plugin/`.
- Fill `project.json` before deploy. Never commit credentials.
- Run the central harness `check` before deploy and verify the original public URL after deploy.

## Backend CMS rules

1. Keep content registration in `plugin/starter-model.php`.
2. Every frontend value must have an editable ACF/Customizer owner.
3. Templates and components must not hardcode company-specific claims.
4. Read ACF term fields with `product_collection_{$term_id}`.
5. Use assigned page templates, not slug-bound `page-*.php` templates.
6. Every editable ACF field needs a label, admin instructions, REST access and a valid location.
7. Do not add ACF PRO-only repeaters, flexible content or gallery fields.
8. Run `cms-audit` and `audit-fields` after changing content model:
   ```bash
   node harness/cli.mjs --project <project> cms-audit
   node harness/cli.mjs --project <project> audit-fields
   ```
9. Keep ACF field groups organised with tabs when a group exceeds roughly eight fields.
10. Preserve navigation during normal deploys; rebuild only with explicit `--with-nav`.
