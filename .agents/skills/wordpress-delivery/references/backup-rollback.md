# Backup and Rollback

Before production writes, ensure `backup` exists or explain why a prior rollback point is sufficient.

```bash
node wordpress-builder.mjs --project . backup
node wordpress-builder.mjs --project . rollback <backup-id>
```

A rollback is complete only when the affected live route, database state and business flow are verified.
