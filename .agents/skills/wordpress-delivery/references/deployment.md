# Deployment

Source deployment uses backup, plugin checks, controlled sync, configuration, cache and verification:

```bash
node wordpress-builder.mjs --project . deploy --skip-content
```

Use `--with-content` only when intentional. Do not deploy an external project. For custom source projects, confirm the local source really owns the remote theme/plugin before first deployment.
