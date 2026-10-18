# Approved inactive installation completed

Owner authorized the supported two-step equivalent at 16:44 UTC, October 18,
2026. Target metadata matched the approved shared/live backend. Precheck found
zero object collisions, expected dependencies and no unexpected default-grant
roles. Prior preapply/abort snapshots and local 115-check evidence are retained.

## Exact difference and pins
The reviewed proposal is unchanged, SHA256:
`85c24826e736773a95c2bcf31645dd45e573cfc48d0fcbb235287eadd47b8ae7`.
INSTALL_DDL.sql removes only the exact singleton INSERT line, leaving all other
bytes, including commented rollback, untouched. DDL SHA256:
`4d240b2471f2c7c7ae1614680819959898fef1411fa575c29cf9945df7bce13e`.
Applied migration `drizzle/migrations/0000_install_dormant_update_engine.sql`
matches that DDL hash byte-for-byte. The migration tool returned success and
regenerated client types. No rollback comments were executed live.
INSTALL_SETTINGS.sql contains the removed line alone, SHA256:
`c0e2dcfcb478e130e0c2140a2da94efec285e262c4ae63decc21317fd4c8aad2`.
The supported data-write tool executed that exact statement separately; final
readback confirmed its success. No backfill disguise or tool bypass was used.

## Local validation before installation
Disposable PG16.13, Unix socket only, no TCP listeners. Missing settings denied
ingest, authenticated-admin publication and pause with settings_missing:
3/3 checks passed. Exact settings seed then original full suite: 115/115 passed.
Evidence: local-validation/two-step-{target,missing,results}.txt. Cluster stopped
and deleted. Synthetic auth/roles/dependency stubs and PG16 versus live version
differences remain; these checks do not prove production behaviour.

## Live readback after each step
After DDL: zero settings/sources/candidates/events/jobs/public rows, seven new
tables RLS-enabled, sandbox_exec no new table/view access. See
TWO_STEP_DDL_READBACK.json.
After settings: exactly one row id=true, paused=true,
template_auto_publish_tested=false. Zero sources (therefore zero enabled),
candidates, review events, jobs, watch topics, preferences and public rows.
Table ACL matrix and all five RPC grants match the reviewed matrix; all new
definers retain empty search_path. Owner-rights public view definitions recorded
with safe projection and published/enabled filters. sandbox_exec has no table,
view or RPC access. No sequences were introduced.
All 22 prior public-table ACL/RLS/policy hashes compare equal, including paid,
profiles, roles and tools. See TWO_STEP_FINAL_*.json for raw readback.

No source activation, worker deployment, schedules, providers, AI, email,
autopublishing, frontend changes or site publication occurred. Only the seven
new tables, two views, five functions/two triggers and exact settings row were
installed; existing data and security remain untouched.