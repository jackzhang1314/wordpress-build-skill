# Deployment

Deployment is available only to `mode: source` projects. It performs:

1. local quality gates;
2. remote backup;
3. required-plugin reconciliation;
4. controlled theme/plugin sync;
5. WordPress/Rank Math configuration;
6. optional media/content import;
7. Hostinger cache clear;
8. live route/database verification.

```bash
node wordpress-builder.mjs --project . deploy --skip-content
```

Use `--with-content` only when content replacement is intended. External projects must use precise content, navigation and template-assignment workflows instead.
