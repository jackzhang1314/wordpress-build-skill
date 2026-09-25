# Account SSH Key

Use one reusable key per Hostinger hosting account/SSH user:

```bash
node wordpress-builder.mjs --project . ssh setup
```

The default path is `~/.ssh/hostinger-<user>_ed25519`.

For a new hosting user, Setup can bootstrap the key with Hostinger Files and a temporary Cron Job. If automation fails, copy the public key and open hPanel SSH Access. After the one-time handoff, rerun SSH setup.

Do not copy project-specific keys between projects. Do not assume the key works for a different Hostinger hosting user.
