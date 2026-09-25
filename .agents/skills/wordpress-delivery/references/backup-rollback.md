# Backup and Rollback

Before production writes, ensure `backup` exists or explain why a prior rollback point is sufficient.

Surgical external writes (`edit-page`, `nav`, `template assign`) create a lightweight snapshot in `.backups/external-writes/`. These snapshots record the prior content, menu items or page-template meta. They do not replace a full database backup for broad changes.

```bash
node wordpress-builder.mjs --project . backup
node wordpress-builder.mjs --project . rollback <backup-id>
```

A rollback is complete only when the affected live route, database state and business flow are verified.
