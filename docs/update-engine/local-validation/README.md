# Local SQL validation (Revision 3, PROPOSED_MIGRATION.sql sha256 a3242b40…b3)

Ran on a disposable local PostgreSQL 16.13 cluster, reachable only through a
sandbox socket (listen_addresses='', data dir in /tmp, deleted afterwards).
Never touched pcnsuyadfqrmythikwpa. Result: 93 pass / 0 fail (results.txt).
This does NOT prove production behaviour.

Stub differences vs Supabase: synthetic auth.uid() reads GUC `test.uid` (no JWT);
roles anon/authenticated/service_role created locally (service_role BYPASSRLS);
default privileges imitate Supabase's broad grants; minimal has_role/user_roles/
tools/update_updated_at_column stand-ins; no PostgREST, pg_graphql, Supabase
extensions or PG17 (Supabase version not matched).

Review findings (not fixed): service_role and authenticated still hold EXECUTE
on the admin functions via default privileges (refused by has_role, but the
REVOKE should name them). updates_public / update_sources_public run with owner
rights — a deliberate projection needing review; raw candidate fields stay out.

## Revision 3.1 (sha256 f5eeeca0…04f2): function EXECUTE revoked from PUBLIC, anon,
authenticated, service_role before specific grants. Re-run: function ACL matrix
(fnacl.txt) as intended; 92/93 pass — the single "fail" was the old expectation
(not_admin) for service_role calling an admin RPC; it is now denied earlier with
"permission denied for function". Expectation updated in run_tests.sh, not re-run.
Public view smoke: 0 before publish, 1 after, 0 after withdraw.

## Approved sandbox_exec correction — 2026-10-18
Proposal SHA256: `85c24826e736773a95c2bcf31645dd45e573cfc48d0fcbb235287eadd47b8ae7`.
Fresh disposable PG16.13, Unix socket only, explicit port 5432, no listeners:
**115 pass / 0 fail** (original 93 plus 22 sandbox checks), in `sandbox-results.txt`.
`sandbox-target.txt` records version/local target; `sandbox-rollback.txt` is 0
remaining engine relations after locally executing the commented rollback.
Cluster stopped and /tmp/pgt deleted. Initial connection attempt failed before
SQL because the server port was unspecified; its cluster was also cleaned up.
Stub now includes sandbox_exec NOLOGIN BYPASSRLS and the observed postgres/public
table, function and sequence default grants (PG16 cannot model PG17 MAINTAIN).
Minimal dependency stubs, synthetic GUC auth and absence of PostgREST still apply.
Owner-rights views remain deliberate; no new sequences are created. This is
local validation, not production proof. No live migration has been applied.
