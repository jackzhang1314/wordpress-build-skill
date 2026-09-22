# Classic PHP + ACF default

For new WordPress B2B sites, prefer the production-tested classic architecture:

1. **Theme** stays minimal and classic: no Block Theme requirement, no `theme.json` dependency, no block markup in page copy. It owns templates, CSS, JS, accessibility and page composition.
2. **Business plugin** owns CPTs, taxonomies, ACF local field groups, RFQ capture and SEO defaults. Presentation code does not hardcode business data.
3. **Every visual page is normal PHP** (`front-page.php`, `page-templates/*.php`, `single-{cpt}.php`, `taxonomy-{tax}.php`). Editors change content through ACF fields, not by hand-building blocks.
4. **ACF repeaters render with `get_field()` + `foreach`**. CLI direct writes may return attachment IDs or plain arrays; helpers must accept IDs, array URLs and missing sizes.
5. **RFQ is a model**, not a static form: nonce + honeypot + private post + admin inbox + redirect reference. Store and verify the record end-to-end.
6. **Deploy with SSH/WP-CLI**. Hostinger CLI creates the website and clears cache; REST is for external integration. Before content import, import media and keep an attachment-ID map.
7. **Verify the real URL**, not just HTTP: one H1 per page, no heading skips, media actually loads, navigation has no duplicates, RFQ row exists with key fields.

Production evidence and deploy commands: `docs/19-经典主题ACF生产部署与Harness.md`.
