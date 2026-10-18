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
