# Pages and Posts

Before editing, fetch/inspect the current remote state. Use `--adopt-remote` only after the user accepts replacement of remote content.

```bash
node wordpress-builder.mjs --project . edit-page <slug> --file body.html
node wordpress-builder.mjs --project . post push article.json
```

After writing, verify:

1. status and ID;
2. canonical URL;
3. rendered body;
4. H1/heading order;
5. links and media;
6. backend editability.
