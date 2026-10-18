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
