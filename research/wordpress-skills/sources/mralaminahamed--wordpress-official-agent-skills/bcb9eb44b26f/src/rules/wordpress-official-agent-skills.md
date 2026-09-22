# WordPress Official Agent Skills

You have access to expert-level WordPress skills. Invoke the relevant skill before responding to any task that matches.

## Skills

**blueprint** — Use when creating, editing, or reviewing WordPress Playground blueprint JSON files. Triggers on mentions of blueprints, playground configuration, or requests to set up a WordPress demo environment.

**wordpress-router** — Use when asked about a WordPress codebase (plugin, theme, block theme, Gutenberg blocks, WP core checkout) and you need to classify the repo and route to the correct workflow or skill.

**wp-abilities-api** — Use when working with the WordPress Abilities API: `wp_register_ability`, `wp_register_ability_category`, `/wp-json/wp-abilities/v1/*`, `@wordpress/abilities` — defining abilities, categories, meta, REST exposure, permissions checks.

**wp-abilities-audit** — Use when auditing a WordPress plugin's REST surface to produce a standardized document proposing Abilities API registrations. Works on any WP plugin.

**wp-abilities-verify** — Use when verifying a WordPress plugin's Abilities API registrations: enumerate abilities, check callback behavior matches annotations, validate permissions and schemas, validate audit documents from wp-abilities-audit.

**wp-block-development** — Use when developing WordPress (Gutenberg) blocks: `block.json` metadata, `register_block_type(_from_metadata)`, attributes/serialization, supports, dynamic rendering (`render.php`/`render_callback`), deprecations/migrations, `viewScript` vs `viewScriptModule`, and `@wordpress/scripts`/`@wordpress/create-block` workflows.

**wp-block-themes** — Use when developing WordPress block themes: `theme.json` (global settings/styles), templates and template parts, patterns, style variations, and Site Editor troubleshooting (style hierarchy, overrides, caching).

**wp-interactivity-api** — Use when building or debugging WordPress Interactivity API features: `data-wp-*` directives, `@wordpress/interactivity` store/state/actions, block `viewScriptModule` integration, `wp_interactivity_*()` — including performance, hydration, and directive behavior.

**wp-performance** — Use when investigating or improving WordPress performance: profiling/measurement (WP-CLI profile/doctor, Server-Timing, Query Monitor via REST headers), database/query optimization, autoloaded options, object caching, cron, HTTP API calls.

**wp-phpstan** — Use when configuring, running, or fixing PHPStan static analysis in WordPress projects (plugins/themes/sites): `phpstan.neon` setup, baselines, WordPress-specific typing, handling third-party plugin classes.

**wp-playground** — Use for WordPress Playground workflows: fast disposable WP instances in the browser or locally via `@wp-playground/cli` (`server`, `run-blueprint`, `build-snapshot`), auto-mounting plugins/themes, switching WP/PHP versions, blueprints, debugging (Xdebug).

**wp-plugin-development** — Use when developing WordPress plugins: architecture and hooks, activation/deactivation/uninstall, admin UI and Settings API, data storage, cron/tasks, security (nonces/capabilities/sanitization/escaping), release packaging.

**wp-plugin-directory-guidelines** — Use when reviewing WordPress plugins for GPL compliance, checking license headers, evaluating upsell/freemium/trialware patterns, validating plugin naming or trademark rules, understanding WP.org rejections, or answering questions about the 18 Plugin Directory guidelines.

**wp-project-triage** — Use when you need a deterministic inspection of a WordPress repository (plugin/theme/block theme/WP core/Gutenberg/full site): tooling/tests/version hints and a structured JSON report to guide workflows.

**wp-rest-api** — Use when building, extending, or debugging WordPress REST API endpoints/routes: `register_rest_route`, `WP_REST_Controller`/controller classes, schema/argument validation, `permission_callback`/authentication, response shaping, `register_rest_field`/`register_meta`, exposing CPTs/taxonomies via `show_in_rest`.

**wp-wpcli-and-ops** — Use when working with WP-CLI (`wp`) for WordPress operations: safe search-replace, db export/import, plugin/theme/user/content management, cron, cache flushing, multisite, and scripting/automation with `wp-cli.yml`.

**wpds** — Use when building UIs leveraging the WordPress Design System (WPDS) and its components, tokens, and patterns.
