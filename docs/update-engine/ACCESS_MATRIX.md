# Update engine — proposed access matrix (NOT APPLIED, revision 2)

Target: the backend named by `project_id` in `supabase/config.toml` (one instance for preview and live). Re-verify at deployment.

| Object | Visitor | Signed-in user | Admin (has_role, server-checked) | Worker (service role) |
|---|---|---|---|---|
| updates_public (view) | read published only | read published only | read | — |
| update_sources_public (view) | safe fields | safe fields | read | — |
| update_engine_settings | none | none | read; pause/resume via function | read via functions |
| update_sources | none | none | read | via future narrow function |
| update_candidates | none | none | read; state changes ONLY via review/publish/withdraw functions | `engine_record_revision()` only |
| update_review_events | none | none | read (written atomically by functions) | written by function |
| update_job_runs | none | none | read | via future narrow function |
| user_watch_topics / user_preferences | none | own rows | — | — |
| saved_tools, newsletter_subscribers, click_events | unchanged | unchanged | unchanged | — |

Candid limits:
- service_role bypasses row-level security. Its safety rests on the worker calling only the narrow function, which re-checks settings, source enablement and host allowlist in SQL. Table grants to service_role are SELECT only in this proposal; a deliberate bypass in worker code would still be possible and must be prevented by code review before activation.
- No client can publish directly; publication requires an admin call that fails when settings are missing or paused.
- The auto-publish policy flag has no client setter.
- `updated_at` is bookkeeping only; cards show `source_checked_at` and `published_at`.

Target backend ID: pcnsuyadfqrmythikwpa (serves preview and live). Revision 3 adds REVOKE-before-GRANT, empty search_path, settings FOR SHARE locking, atomic duplicate upsert. SQL is unverified until SQL_TEST_SPEC.md runs on an isolated database.

## Sandbox correction approved; locally validated, NOT APPLIED (sha256 85c24826e736773a95c2bcf31645dd45e573cfc48d0fcbb235287eadd47b8ae7)
| Object | PUBLIC | anon | authenticated | service_role | sandbox_exec |
|---|---|---|---|---|---|
| update_engine_settings / sources / candidates | none | none | SELECT, RLS admin-only | SELECT (bypasses RLS) | none |
| update_review_events / update_job_runs | none | none | SELECT, RLS admin-only | none | none |
| Direct INSERT/UPDATE/DELETE on any engine table | none | none | none | none | none |
| updates_public (owner-rights view: safe columns, published only) | none | SELECT | SELECT | none | none |
| update_sources_public (owner-rights view: id, vendor, index_url, last_success_at, enabled rows only) | none | SELECT | SELECT | none | none |
| user_watch_topics | none | none | SELECT/INSERT/DELETE own rows | none | none |
| user_preferences | none | none | SELECT/INSERT/UPDATE own rows | none | none |
| review/publish/withdraw/set_paused RPCs | none | none | EXECUTE + internal has_role admin check | none | none |
| engine_record_revision (worker) | none | none | none | EXECUTE | none |
Owner-rights public views are a reviewed deliberate projection; raw tables stay denied to anon. No private helper RPCs exist in this proposal.
No new sequences exist (UUID defaults use gen_random_uuid()). Local PG16.13: 115/115 checks passed, including all original 93 plus 22 sandbox checks. Installation is blocked by the supported migration tool's prohibition on the proposal's settings seed INSERT; no SQL rewrite or live write occurred.
