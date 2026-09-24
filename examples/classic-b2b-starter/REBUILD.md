# Classic B2B Starter rebuild

This is the working baseline for the componentized Starter Template rebuild. It intentionally starts from the latest harness branch and copies only the proven clean-room theme/plugin/content source, not deployment state or test evidence.

## Decision

Do not restart from an empty directory. Keep the proven WordPress data model, seed flow, SMTP, Rank Math, Classic Editor and deploy gates. Rebuild the presentation layer around a strict component architecture.

## Scope for this branch

1. Replace `cleanroom_` / `harness-cleanroom` naming with neutral `starter_` / `b2b-starter`.
2. Finish migrating all page templates to component functions and template parts.
3. Keep page body and ACF fields editable in WP Admin.
4. Enforce zero uploaded media for starter content; all media slots use dimension placeholders.
5. Add automated checks for component duplication, blank media, ACF binding, heading hierarchy and mobile layout.
6. Produce a reusable GitHub-ready starter package under this directory.

The active runtime project remains `/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/harness-cleanroom` for deploy verification until this branch becomes the canonical starter.
