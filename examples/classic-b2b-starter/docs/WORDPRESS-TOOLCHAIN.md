# WordPress Toolchain Integration

This project deliberately uses a hybrid workflow:

```text
Codex harness = deterministic deployment + local gates
WP-CLI over SSH = remote state inspection and mutation
Browser/CDP = visual and interaction verification
WordPress Skills/MCP = connector-native content workflows where capabilities exist
```

## Official WP-CLI usage

The harness does not call WP-CLI locally; it calls it on the host through SSH. This is intentional because the site filesystem, database and cache are remote.

Common commands used by the harness and operators:

```bash
wp core version
wp plugin list --format=json
wp option get show_on_front
wp option get page_on_front
wp option get page_for_posts
wp post list --post_type=starter_product --format=json
wp term list product_collection --format=json
wp eval-file /tmp/audit.php
wp cache flush
wp rewrite flush
```

Rules:

- Never use `wp search-replace` as an unscoped migration tool.
- Prefer read-only commands first; write commands must have readback.
- For code/data changes, create backups before deployment.
- Use `wp cache flush` and `wp rewrite flush` after registration or template changes.

## Official WordPress editor architecture

The Starter uses the Classic Editor for content types with structured ACF fields. This is intentional:

- Product/category field data is controlled by ACF.
- Rich page bodies use `the_content()`.
- Product and guide post types now register locked native editor templates for the body.
- The native editor remains useful for paragraphs, headings, lists, tables, images and embeds.

Rules:

- Do not put structured catalogue data into arbitrary page HTML.
- Do not hardcode structured data into page body HTML if it needs reusable editing.
- Do not re-sanitize `the_content()` with `wp_kses_post()`; it may strip legitimate embed markup.
- Give H2/H3 headings stable IDs when generating a table of contents.
- Render editor output through a constrained prose container.

## WordPress MCP

WordPress is moving toward an Abilities API plus MCP Adapter architecture. The older Automattic `wordpress-mcp` repository is deprecated. The modern approach is to install/enable the official MCP Adapter package, then expose registered abilities over MCP.

For this Starter, MCP is optional and should be disabled by default on production unless the site owner explicitly wants AI write access. If enabled:

- restrict tools to a dedicated editor/service account;
- avoid destructive tools;
- require HTTPS and authenticated transport;
- audit every write;
- never expose admin credentials to the browser or commit them;
- prefer read-first operations and explicit write confirmation.

## Bundled WordPress Skills

The repository includes connector-native WordPress skills:

| Skill | Use it for | Do not use it for |
|---|---|---|
| `wordpress-block-pages` | Native block page drafts, design-profile discovery, page schema, navigation planning | Replacing this Starter's PHP templates or ACF model |
| `wordpress-acf-products` | Bulk product drafts into an existing REST-enabled ACF model | Creating WooCommerce products or bypassing the Starter model |
| `wordpress-media` | Uploading media, setting alt/caption, featured images | Duplicating uploads or using fake media IDs |
| `wordpress-forms` | WPForms schema and form creation where available | Claiming email delivery without testing SMTP |
| `wordpress-seo-settings` | Rank Math settings and verification | Promising Google reindexing or ranking changes |

## Decision rule

Use the harness for deterministic deployment and audits. Use WP-CLI for remote WordPress state. Use browser/CDP for visual and interaction checks. Use WordPress Skills/MCP only when their runtime capability exists on the target site and the task is connector-native content work.
