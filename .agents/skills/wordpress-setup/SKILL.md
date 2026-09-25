---
name: wordpress-setup
description: Prepare the WordPress Builder environment, connect Hostinger, configure account-level SSH, create Starter projects, or adopt existing WordPress sites as source/external projects.
---

# WordPress Setup

Use this skill before creating a project or when environment, Hostinger, SSH or site connection setup is the blocker.

## Scope

- Repair local dependencies.
- Connect and verify Hostinger CLI.
- Configure the reusable account-level SSH key.
- Create Starter or custom source projects.
- Adopt existing WordPress sites as `external`.
- Inspect real WordPress shape after connection.

Not scope: page content editing, visual design, deployment or release acceptance.

## Entry points

```bash
node wordpress-builder.mjs bootstrap --fix
node wordpress-builder.mjs hostinger setup --install --connect
node wordpress-builder.mjs ssh setup
node wordpress-builder.mjs init <project-name> --root ../projects --from-starter
node wordpress-builder.mjs adopt <project-name> --domain <domain>
node wordpress-builder.mjs project inspect
```

The old `node harness/cli.mjs` path remains a deprecated compatibility wrapper.

## References

- [Environment](references/environment.md)
- [Hostinger account](references/hostinger-account.md)
- [Account SSH key](references/account-ssh-key.md)
- [Starter project](references/starter-project.md)
- [External adoption](references/external-adoption.md)
- [Project AGENTS](references/project-agents.md)

## Handoff

Return to `wordpress-builder` after the project exists and SSH/WP-CLI are verified. Then route to content, design or delivery.
