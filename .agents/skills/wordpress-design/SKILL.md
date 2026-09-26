---
name: wordpress-design
description: Design or refactor WordPress themes, page templates, components, visual systems and accessibility, while checking ACF/CMS editability and source/external deployment limits.
---

# WordPress Design and Theme Engineering

Use this skill for visual direction, theme architecture, page templates, components, CSS, responsive behavior and accessibility.

## First checks

1. Is this a `source` project or `external`?
2. Is the source profile Starter or custom?
3. Is the active theme classic, block, hybrid or unknown?
4. Which template actually controls the route? For Block/FSE or hybrid sites, run `project inspect --route-set core` and use the selected template, selected parts and `source: theme|custom` as the ownership evidence.
5. Which ACF/CMS fields provide the content?

## Block/FSE template patches

For a Block/FSE or hybrid route, use the two-phase scoped patch workflow:

```bash
node wordpress-builder.mjs --project . block-template plan --route / --part header --file content/template-patch.json
node wordpress-builder.mjs --project . block-template apply --plan <plan-id>
```

The patch must contain one unique `find`, one `replace` and `verifyText`. The target must be the selected route template or one of its selected parts. Theme-source targets become WordPress custom overrides; they are not edited as theme files. Inline navigation, submenus and arbitrary full-template overwrites remain outside this command.

## Starter and custom contracts

- Starter projects keep the full Starter route, component, ACF and zero-media contracts.
- Custom source projects must not be forced into Starter templates, routes or component markup.
- External projects do not receive theme deployments.

## References

- [Design system](references/design-system.md)
- [Classic design baseline](references/design-system-classic.md)
- [Theme code](references/theme-code.md)
- [Page architecture](references/page-architecture.md)
- [Component contracts](references/component-contracts.md)
- [Accessibility](references/accessibility.md)

## Handoff

For new fields or page copy, use `wordpress-content`. For source deployment, use `wordpress-delivery`.
