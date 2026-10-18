# Findings: sandbox_exec ACL mismatch (research only)

## Evidence on file
- TWO_STEP_FINAL_ACLS.json (after install): sandbox_exec had no SELECT/INSERT/UPDATE/DELETE on the seven engine objects.
- STOP_ACCESS_DRIFT_2026-10-18.md (latest check): `sandbox_exec=ar/postgres` (SELECT+INSERT) on those same seven objects. Cause not established at the time.

## Answers
1. Does read_query, project/session startup, or another platform step automatically grant SELECT/INSERT to sandbox_exec? **Unknown.** The official Lovable docs never mention `sandbox_exec` or how its access is granted (searched Cloud, Database, and "Generate files" docs). Internal platform guidance says the sandbox's database shell (psql) runs as a "restricted role", but it doesn't name the role or describe any automatic grants. Nothing I found says read_query grants anything.
2. Is there a supported way to check access that cannot restore those grants? **Unknown.** The supported read-only tools are read_query, the linter, and analytics_query. No guidance says whether they, or a sandbox session starting up, trigger an access refresh. Because of that, no route can be called "guaranteed not to restore grants".
3. Can a denial on specific objects survive the normal platform lifecycle? **Unknown.** Plain PostgreSQL keeps a REVOKE in place unless something grants access again. The evidence shows something did re-grant it, but no documentation says what or how often.
4. Who made the grant: not inferred. The `postgres` grantor and the aggregate hashes are not used to name an actor, as you asked.

## Recommendation (no action taken)
Only Lovable support can give an authoritative answer about the sandbox_exec grant lifecycle. You said not to contact them, so the install and single run stay blocked until you decide. Options:
- (a) Ask support.
- (b) Accept a re-grantable sandbox-only access and record it as a known risk.
- (c) Design the engine so it doesn't rely on denying sandbox_exec at all, for example by moving sensitive fields out of plain table reads.

No edits, SQL, deployment, collection, or settings changes were made. Credits spent: two documentation lookups only.
