# Shadow collection checkpoint — 2026-10-18

Implementation only. No SQL applied, handler deployed, provider called, schedule
created, settings changed or site published. Frontend unchanged.

## Exact allowlist
- `realtor-mediaroom`: index `https://mediaroom.realtor.com/news-releases`;
  exact host `mediaroom.realtor.com`; detail path prefix `/20`.
- `appfolio-newsroom`: index `https://www.appfolio.com/newsroom`;
  exact host `www.appfolio.com`; detail path prefix `/newsroom/`.
- No arbitrary search links, other hosts, credentials, query/fragment URLs,
  encoded path ambiguity, IP literals or private/special-use DNS answers.
  IPv6 is conservatively unsupported. DNS is validated and pinned for TLS.

## Required before activation (not verified here)
Check each official host's `/robots.txt`, newsroom terms and any automated-access
restrictions against this user agent and exact paths. Confirm ownership, redirect
behaviour, HTML link structure and supported NewsArticle/Article/PressRelease
JSON-LD date/headline metadata with real primary pages. No live fetch was made.
Unsupported/ambiguous/missing metadata fails closed, not inferred from snippets.

## Runtime/cost proposal
No purchase, AI, Firecrawl, search or paid provider. Initial ceiling two source
checks total per UTC day; one per source per rolling 24h, reserved in SQL before
fetch. At most one index plus two details per check, each 8 seconds, 512 KiB,
two redirects (three HTTP requests maximum per page). Thus at most six logical
pages / 18 wire requests / 9 MiB daily; counters in logs count logical pages,
not redirect hops. Hosting compute/egress pricing remains unquoted, not asserted
free. Reservations survive interrupted runs and consume the day's budget.

## Scope and limitations
Server-only files: `server/update-engine/http.ts`, `shadow.ts`, `shadow.test.ts`.
`collectShadow` requires explicit caller authorization and a server-only RPC
client; no credentials or persistent handler provided. The reservation/finish
RPCs are proposal-only in `SHADOW_RPC_PROPOSAL.sql`. Drafts use the existing
`engine_record_revision` RPC and nonempty review flags, never publish.
Only metadata changes are fingerprinted; body-only corrections are intentionally
not detectable by this adapter. Existing body-aware simulation pipeline remains
unchanged. Two sorted detail links are a bounded initial slice, not comprehensive
archive collection; stale links may prevent useful coverage. Prior revision
linkage, robust chronological archive selection and deployment integration remain
unfinished. This is not a verified working live engine. Search discovery remains
unvetted and has no persistent schema expansion.

## Isolated SQL evidence
`local-validation/shadow-target.txt`: PostgreSQL 16.13, Unix socket only,
`/tmp/pgt/data`, no TCP listener. Existing suite 115/115 plus new 31/31 checks
(`shadow-regression-results.txt`, `shadow-results.txt`, `shadow_tests.py`).
Tests exercise role ACLs including sandbox_exec BYPASSRLS, empty search_path,
missing/paused/disabled settings, reservations/cadence/daily cap, atomic invalid
finish denial, no-change health vs freshness, failure/partial snapshot retention,
pause lock serialization and proposal function rollback. Cluster stopped/deleted.
Synthetic auth.uid uses GUC `test.uid`, local trust socket authentication and
minimal dependency/role/default-ACL stubs; no real credentials/JWT/PostgREST.
No production proof, and fixture tests do not verify SQL.

SQL SHA256: `558a251084889b1fcdb020d69659ad58f6ed76695800334db9ebafe896c36908`.
HTTP SHA256: `ddb8cf5111243fe34f1a6846b0e4a31e8b445ca91546162de4cf04e880e2d8fc`.
Collector SHA256: `7a4f1340cbfaebb2d2afa6194dc1d8d926fa88e084327cc1857b77384489d6d2`.

## One bundled future activation approval scope
After terms/robots, primary HTML fixtures, unfinished coverage/linkage and runtime
quote checks pass: approve only the pinned RPC proposal, two reviewed disabled
source rows and server-only worker deployment; then explicitly enable only those
two sources and unpause shadow collection with tested-auto-publication still
false, within the daily cap. No public publishing, email, search discovery
activation or paid provider. Schedules require explicit inclusion in that approval;
manual pilot is the default. Reconfirm backend/dependencies/ACLs and unchanged
existing 22 table protections before any live apply. This document grants nothing.