# Hostinger Account

Verify Hostinger access before remote setup:

```bash
node wordpress-builder.mjs hostinger setup --install --connect
```

Use official Hostinger CLI/API for website/account operations. Browser authorization is done by the account owner.

Account-level SSH access is per hosting user, not per website and not per Hostinger login. Website DNS may point to a web server that differs from the SSH endpoint; use verified SSH host mapping or explicit overrides when needed.
