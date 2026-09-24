# Classic B2B Starter rebuild

This is the working baseline for the componentized Starter Template rebuild. It starts from the latest harness branch and contains the proven theme/plugin/content source, without deployment state or test evidence.

## Decision

Do not restart from an empty directory. Keep the proven WordPress data model, seed flow, SMTP, Rank Math, Classic Editor and deploy gates. Rebuild the presentation layer around a strict component architecture.

## Scope

1. Keep `starter_` and `b2b-starter` as the only neutral naming; the prior project-specific naming must not return.
2. Finish migrating all page templates to component functions and template parts.
3. Keep page body and ACF fields editable in WP Admin.
4. Enforce zero uploaded media for starter content; all media slots use dimension placeholders.
5. Add automated checks for neutral naming, component duplication, blank media, ACF binding, heading hierarchy and mobile layout.
6. Produce a reusable GitHub-ready starter package.

A previous local runtime checkout remains useful for comparing behavior, but this branch is the canonical starter source.
