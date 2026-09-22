# Classic PHP + ACF project template

`project-harness.mjs` is copied from the IRONTRACK production run and expects a sibling `project.json`.

Commands: `doctor`, `check`, `backup`, `media`, `content`, `deploy`, `status`, `rollback`, `wp`, `open`.

The seed contract is deliberately data-first: `site-data.example.json` defines terms, products, guides, pages and menus; `media-map.json` maps media keys to attachment IDs. A project should copy this file into `scripts/` and replace content, not edit generic deploy logic.

Production lessons encoded here:

- SSH is the primary management channel; Hostinger CLI is only platform operations/cache.
- `wp db export` is bypassed with WP-CLI constants + `mysqldump` because Hostinger disables `proc_open`.
- Media import creates an ID map before content seeding.
- ACF repeaters are rendered from `get_field()` arrays, not `have_rows()` loops.
- RFQ is a first-class model with nonce, honeypot, private post storage, admin inbox and redirect reference.
- Live verification checks HTTP, H1 count, heading skips, content markers and database counters.
