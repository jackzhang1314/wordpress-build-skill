# Forms

Starter/form verification currently has direct Fluent Forms support:

```bash
node wordpress-builder.mjs --project . verify-form
```

It checks rendered form DOM, browser submission and database increment.

For external or custom forms, inspect the form plugin first. Do not assume Fluent Forms tables or shortcodes exist.
