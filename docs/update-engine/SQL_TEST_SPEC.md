# SQL test specification — update engine proposal (Revision 3)

SPECIFICATION ONLY. Not executed. Frontend/vitest tests do NOT verify any SQL.
Run later against an isolated, disposable Postgres with Supabase roles
(never pcnsuyadfqrmythikwpa, which serves preview and live). Each case: expected result.

## A. ACL matrix (query `information_schema.role_table_grants` + `has_table_privilege`)
- anon: SELECT only on `updates_public`, `update_sources_public`; none on engine tables.
- authenticated: SELECT on engine tables (RLS → admin rows only; non-admin gets 0 rows);
  SELECT/INSERT/DELETE `user_watch_topics`, SELECT/INSERT/UPDATE `user_preferences` (own rows).
- authenticated: no INSERT/UPDATE/DELETE on any engine table (expect `permission denied`).
- service_role: SELECT only on settings/sources/candidates; no write grants (writes only via functions).
- PUBLIC: no privilege on any new object.
- Functions: `engine_record_revision` executable by service_role only; admin functions by authenticated only; anon denied on all.
- Every SECURITY DEFINER function has `proconfig = {search_path=""}`.

## B. URL boundary (`engine_record_revision` on enabled appfolio source, prefixes `{/newsroom/}`)
Reject: `https://www.appfolio.com:443@evil.example/newsroom/x` (url_not_canonical),
`https://user@www.appfolio.com/newsroom/x`, `https://www.appfolio.com:8443/newsroom/x`,
`https://WWW.appfolio.com/newsroom/x`, `http://www.appfolio.com/newsroom/x`,
`https://www.appfolio.com.evil.example/newsroom/x` (host_not_allowlisted),
`https://evilwww.appfolio.com/newsroom/x`, `https://www.appfolio.com/newsroomevil/x` (path_not_allowlisted),
`https://www.appfolio.com/other/newsroom/x`, URLs with `?`, `#`, `\`, whitespace.
Accept: `https://www.appfolio.com/newsroom/x`.

## C. Pause serialization (two sessions)
1. S1 BEGIN; call `publish_update_candidate` (holds settings FOR SHARE). S2 `set_update_engine_paused(true)` → blocks until S1 commits.
2. Same with S1 calling `engine_record_revision`.
3. S2 pauses and commits first → S1 publish/record raises `engine_paused`.
4. No deadlock across 50 interleaved runs (lock order settings → source → candidate).

## D. Duplicates
1. Two concurrent sessions insert same source+hash → exactly 1 row, exactly 1 initial `update_review_events` row; other returns `duplicate:<state>`.
2. Duplicate after admin approval: state, reviewed_at, review events unchanged; `source_checked_at` = greatest(old,new); older timestamp never regresses it.
3. Missing settings row → every function raises `settings_missing`.
