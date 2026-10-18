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
