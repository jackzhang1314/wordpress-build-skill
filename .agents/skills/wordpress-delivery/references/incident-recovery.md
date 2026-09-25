# Incident Recovery

For a failed deployment:

1. stop further writes;
2. capture CLI error and affected URLs;
3. identify the backup ID;
4. restore only the failed scope;
5. flush cache;
6. verify live route and database;
7. record cause and permanent gate.

Do not retry a destructive operation without understanding the failure.
