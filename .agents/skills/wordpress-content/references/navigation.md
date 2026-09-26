# Navigation

First inspect the real navigation mechanism and the route that will be changed.

## Read-only diagnosis

```bash
node wordpress-builder.mjs --project . project inspect --json
node wordpress-builder.mjs --project . project inspect --routes /,/about/ --json
node wordpress-builder.mjs --project . project inspect --route-set core --json
```

`--route-set core` samples the homepage, a normal page, a post, CPT archive/single routes, a taxonomy route, search and 404 when representative content exists. Explicit `--routes` is for a targeted page. Route output is compact: template slug/id/source/hash, selected template parts, `wp_navigation` IDs, owners and confidence. Full block markup is not written into `project.json`.

Interpretation rules:

1. A published `wp_navigation` post is only a candidate. It is **used** only when the selected route template or selected template part references its ID.
2. An inline Navigation block is block navigation even when it has no `wp_navigation` ref.
3. An assigned Classic menu is proven navigation only on a Classic PHP route. On Block/FSE or hybrid sites, a menu location alone does not prove that the current header renders it.
4. A Site Editor custom template/part (`source: custom`) overrides the theme file of the same slug. Report that source; do not tell the user to edit only the theme file.
5. Missing parts, malformed block attributes, failed probing or a non-JSON response produce low confidence. Do not turn that into a write capability.

## Write boundaries

Classic menu operations are supported only when route/site shape proves Classic rendering:

```bash
node wordpress-builder.mjs --project . nav add Products --url /products/
node wordpress-builder.mjs --project . nav remove 'Old label'
```

## Supported `wp_navigation` write

Only a flat `wp:navigation-link` list referenced by the selected route can be updated through the two-phase workflow:

```bash
node wordpress-builder.mjs --project . nav block plan --route / --file content/block-nav.json
node wordpress-builder.mjs --project . nav block apply --plan <plan-id>
```

Input:

```json
{
  "links": [
    {"label": "Home", "path": "/"},
    {"label": "Products", "path": "/products/"}
  ]
}
```

`plan` is local-only. It records the selected template, selected parts, navigation owner, impact and before/after hashes. `apply` rechecks route ownership and content drift, creates a restore snapshot, updates `wp_navigation`, reads it back, flushes cache, verifies every label in the original route HTML and automatically restores the previous content if live verification fails.

Multiple `wp_navigation` candidates require `--navigation <id>`. Inline navigation, submenus, locked/custom blocks and missing/low-confidence owners are not supported by this path. FSE template/template-part editing remains a source-custody workflow; do not use classic menu commands as a workaround.
