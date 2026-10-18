# Approved single manual run — stopped before live effects

## Cleanup correction
Restoration is now required BEFORE attempting the authenticated unpause RPC. finally always attempts paused=true after an authorized unpause attempt, including a committed unpause whose response is lost. New mocked regression verifies both calls [false,true], final paused=true and zero collection calls on lost response. Full suite: 177/177, 14 files (regression-tests.txt); latest preview build OK.

Original seven activation artifact fingerprints verified before edit. Only approved cleanup handler changed:
SHA256 872732f4e3c874642526dd3bb30335f594b7a8e1d706423e21acee503bb7365a
All other artifact pins unchanged (approved-cleanup-artifacts.sha256). No SQL modifications.

## Runtime failure — actual local evidence
Deno 2.6.10 node:https.request rejects custom lookup synchronously:
`Not implemented: ClientRequest.options.lookup`
The lookup callback was NOT called; no request.end, no network permission, no DNS/feed/article request. Evidence: deno-pinning-blocker.txt. Prior mocked Deno success did not exercise the actual TLS request option; it was not sufficient to establish deployability.

Pinned lookup is essential to DNS/SSRF control. No fallback to unpinned fetch, relaxed TLS, alternative host, or Node-only deployment was made. Stop before installing/deploying anything. A Deno-supported verified IP-pinning/TLS-hostname transport is required before using the one-run authorization. No second network attempt occurred; even the first authorized fetch was not made.

## Live read-only precheck and independent final readback
Supported project_info confirmed selected existing LIVE backend pcnsuyadfqrmythikwpa. Reviewed revision/pause dependency signatures and definitions present. No manual RPC name collisions, source rows or unexpected default-grant roles. Existing anon/authenticated/service_role/sandbox_exec attributes as expected.
Pre/post aggregate ACL/RLS/policy hash over all 29 public tables:
`9875510688826de27ee322e0c6652083` both times. No existing table/security/paid-flow changes. A first read-only snapshot query had an explicit-cast error; corrected read-only query succeeded, no writes.

Final settings independently read from database: paused=true, template_auto_publish_tested=false.
Source rows=0; enabled sources=0; candidates=0; jobs/reservations=0; public updates=0; new manual RPCs=0.
Feed request count=0; article request count=0; draft IDs=[]; source publication/check timestamps absent because no feed fetched/draft created.
No unpause attempted, so no live repause/disable write necessary; existing settings remain paused and no feed source exists. No SQL migration/data-write/deployment/site publication/provider/email/schedule performed. No approval tool was invoked because runtime gate failed first.

## Credit checkpoint
Latest workspace balance: 167.54 total; billing 90.80 expires Nov 20; top-up 76.74 expires Jun 6; rollover 0.00. No purchase/plan change. Exact turn cost unavailable; billing-period delta is not claimed as turn attribution.
