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

Block navigation and FSE templates are read-only in this Builder release. Do not claim a classic menu change fixed a block navigation site. If template or plugin code must change, stop and propose an authorized source-custody workflow with backup and live verification.
