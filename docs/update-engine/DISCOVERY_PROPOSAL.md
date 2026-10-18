# Discovery layer — preview only

SearchAdapter currently has a synthetic implementation only. Six rotating task
queries cover investor diligence/operations and agent listing/follow-up/transaction
work. No outbound search, fetch, model, worker or schedule exists.

Proposed cadence: six searches/week, enforced future monthly ceiling 26 searches
and 20 new detail fetches; known-source checks daily. This is a proposal, not a
running schedule. Provider prices and economics remain unknown.

Search candidates retain canonical URL, kind, dates and query/provider provenance;
snippets are discarded after risk/injection classification. Dedup is URL+kind at
discovery stage; actual primary-source revisions still use the existing pipeline's
source+content-hash identity. Old announcements stay background. Search-only
candidates can never publish, even on a known host.

Source promotion is only a disabled proposal. Human review must verify primary
publisher, exact hosts/path prefixes/redirects, outbound DNS/IP safety, privacy
and provider costs. No arbitrary host is added to the registry or fetched.
Future primary evidence must pass existing source validation/extraction/risk and
revision pipeline; no snippet-to-RawItem shortcut is implemented.

Use-case preview records reuse the owner's previously supplied Realtor/AppFolio
announcements. Vendor-described facts are separate from editorial evaluation
suggestions; setup effort/cost/testing are explicitly unknown or not tested.
No new real tools are claimed: discovery fixtures are synthetic example domains.

## Remaining capability — not implemented
Health/snapshot/job-log narrow RPC proposal remains unfinished to preserve this
slice's budget. It must enforce settings→source locks, fail-closed paused/missing
settings, source enablement, resumable partial-run handling, atomic complete-batch
snapshot/health/log writes and service-only execution, then isolated SQL tests.
Discovery persistence/use-case SQL, vetted promotion, real primary fetch adapters,
provider quotes, activation and schedule configuration require later work.
No SQL or access-rule changes are made in this slice.