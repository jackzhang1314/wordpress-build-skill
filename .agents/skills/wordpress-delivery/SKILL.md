---
name: wordpress-delivery
description: Run WordPress checks, source deployments, backups, release verification, SEO acceptance, screenshots, rollback and recovery with source/external safety enforced.
---

# WordPress Delivery

Use this skill for local/live checks, source deployment, release acceptance, backup, rollback and recovery.

## Mode rules

### Source

May run:

```bash
check
backup
deploy --skip-content
verify --screenshots
rollback
```

### External

May run:

```bash
check
backup
status
verify
```

Must not run `deploy`, `media`, `content`, `setup` or `configure-seo`.

## References

- [Local checks](references/local-checks.md)
- [Deployment](references/deployment.md)
- [Release verification](references/release-verification.md)
- [SEO acceptance](references/seo-acceptance.md)
- [Backup and rollback](references/backup-rollback.md)
- [Incident recovery](references/incident-recovery.md)

## Handoff

After delivery, return to `wordpress-builder`. For failed source deployment, use backup/rollback guidance. For failed content or design, return to the owning skill.
