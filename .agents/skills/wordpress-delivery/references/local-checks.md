# Local Checks

For source projects:

```bash
node wordpress-builder.mjs --project . check
```

Starter projects run the full Starter contract. Custom source projects run generic structure, syntax, secrets, route and content checks declared by the project.

Do not use Starter-only failures to reject a custom source project.
