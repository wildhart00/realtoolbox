# Discovery slice validation — October 18, 2026

149/149 checks passed across 9 existing/new test files. New discovery.test.ts
adds 11 tests: cross-query canonical dedup/provenance, unsupported claims,
malicious snippets discarded, unvetted-host denial, demo≠hands-on, old release
background, six rotating tasks/both audiences, monthly caps 26 and 20,
inactive cadence, and private/credential URL rejection.

Existing pipeline/review/admin/nonadmin/preview/release-guard and paid-entitlement
regressions passed. Preview audience test adjusted to scope the new use-case
region rather than counting every article on the page.

Signed-in browser at /admin/updates-engine: backend readback paused, policy not
tested, zero enabled sources. Discoveries fixture run showed 3 candidates;
workflow-idea filter showed only its flagged candidate, no live writes.
Public localhost preview showed 2 practical use-case cards; 390px mobile had no
horizontal overflow. No runtime errors observed. Screenshots inspected.

Read-only live comparison reconfirmed all 22 existing table ACL/RLS/policy
snapshots unchanged; settings paused=true/tested=false, all business rows zero.
Build telemetry reports build OK. No SQL, worker, schedules, providers, AI,
email, autopublish or site publication occurred.

Remaining: actual primary-source discovery handoff/fetch adapters and persistent
discovery/use-case storage are not implemented. Narrow health/snapshot/job-log
RPC remains proposal work, explicitly deferred at this budget checkpoint.