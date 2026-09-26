# 0926-06 Theme-agnostic Rendering Adapters

- Time: 2026-09-26 17:13 CST (+08:00)
- Trigger: clarify that WordPress Builder supports any WordPress implementation, not only Classic or Starter themes.

## Implemented

- Added remote rendering-system detection:
  `classic-php`, `block-fse`, `page-builder`, `hybrid`, `unknown`.
- Added authoring-system detection for Classic PHP, Block/FSE, Elementor, Divi, Beaver Builder, WPBakery, Bricks and Oxygen.
- Enhanced `project inspect` with classic menu items, block navigation references, FSE templates/template parts and rendering capabilities.
- Clarified Skill contracts: ACF/CPT/page-content workflows are theme-agnostic; theme type selects the rendering adapter.
- Added `wordpress-builder-core` theme-independent plugin with Builder CPTs, taxonomy, ACF fields and plugin-owned page templates.
- Added `builder install` and `builder status` for scoped adoption of the theme-independent content layer.

## Validation

- Added regression coverage for Classic and Elementor-style remote inspections.
- Full typecheck, lint and test suite: 202/202 tests.

## Remaining

- Add dedicated write adapters for specific page builders after inspection and authorization.
- Add external-to-source custody promotion for authorized template/plugin changes.
