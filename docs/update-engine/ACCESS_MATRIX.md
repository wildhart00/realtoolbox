# Update engine — proposed access matrix (NOT APPLIED)

Target: this project's single Lovable Cloud backend (preview and live share it).

| Object | Visitor (anon) | Signed-in user | Admin (has_role, server-checked) | Worker (service role, server function only) |
|---|---|---|---|---|
| updates_public (view) | read published only | read published only | read | — |
| update_sources_public (view) | read safe fields | read safe fields | read | — |
| update_sources | none | none | full | update health |
| update_candidates | none | none | full | insert |
| update_review_events | none | none | read, insert own | — |
| update_job_runs | none | none | read | insert |
| update_engine_settings | none | none | read/update | read |
| user_watch_topics | none | own rows | — | read for digests later |
| user_preferences | none | own row | — | read |
| saved_tools (existing, reused) | none | own rows (unchanged) | unchanged | — |
| newsletter_subscribers (existing) | insert only (unchanged) | insert only | read (unchanged) | — |
| click_events / analytics | insert only (unchanged) | insert only | read | — |

Published-only rule: `updates_public` filters `state = 'published'`, so queued, rejected and withdrawn rows never reach visitors.
Workers: no new keys; would run in a server function using the existing built-in service role, with pause flag and budget enforced server-side.
