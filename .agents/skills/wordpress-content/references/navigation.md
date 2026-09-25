# Navigation

First inspect the real navigation mechanism.

Classic menu operations are supported:

```bash
node wordpress-builder.mjs --project . nav add Products --url /products/
node wordpress-builder.mjs --project . nav remove 'Old label'
```

Block navigation may live in `wp_navigation` posts or FSE template parts. Do not claim a classic menu change fixed a block navigation site. Inspect first, and use template/part editing only through an authorized source workflow.
