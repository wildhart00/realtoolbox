# Approved one-run pilot — stopped on live access drift

## Actual outcome
No migration, data write, deployment, function invocation, feed request or article request occurred. Single-run authorization remains unused. No new credential, purchase, plan change, schedule, AI, email or site publication.

Supported project identity read confirmed the intended existing live backend. Current independent readback: paused=true, template_auto_publish_tested=false, sources=0, candidates=0, jobs=0, updates_public rows=0, 29 public tables. No manual Atom RPC name collisions; installed revision/pause signatures present. Reviewed artifact manifest verified before compatibility edits; SQL/source/generic transport pins unchanged.

## Blocking security drift — do not silently fix
Live ACL readback now includes `sandbox_exec=ar/postgres` (SELECT+INSERT) on update_engine_settings, update_sources, update_candidates, update_review_events, update_job_runs, updates_public and update_sources_public. The sandbox_exec role retains BYPASSRLS=true. This violates the approved no-access requirement for new engine objects. Prior stopped-run evidence reported sandbox_exec denial; current live evidence is authoritative. Cause not established. No grant/revoke/global role/security correction attempted.

Current 29-table protection snapshot hash is `0b401ccf8c6453211a7aa71b38f7fea2`, calculated from ordered names, RLS/force flags, ACL text and ordered policy definitions. Earlier evidence used aggregate `9875510688826de27ee322e0c6652083`; the aggregation recipe was not recovered here, so differing hashes alone are NOT claimed as proof of change. The explicit unexpected table/view ACL grants are the blocker. Existing paid flows untouched, not retested end-to-end here.

## Packaging validation completed before stop
Staged complete function-local package under `/tmp/manual-atom-package`, outside auto-deployed function paths. Exact npm pins: @supabase/supabase-js@2.103.3, @xmldom/xmldom@0.9.12. Deno 2.6.10 actual check initially reported 7 compatibility errors: RPC builders are thenables, not Promise; Buffer globals need explicit imports. Only staged explicit node:buffer imports and the source proposal's async/await RPC adapters corrected them without changing reviewed collection logic. Generic project transport remains unchanged.

`deno check --no-config /tmp/manual-atom-package/index.ts`: passed without --no-check. `deno bundle --no-config /tmp/manual-atom-package/index.ts -o /tmp/manual-atom-package/bundle.js`: passed, 56 modules, 945.64KB. Dependency tooling downloaded the esbuild bundler package; no feed/provider call. Check and bundle logs preserved next to this report. Startup validation NOT performed because access drift required stopping; no deployment proof claimed. No function code placed under supabase/functions.

The reviewed fixed-host design remains intentional: literal feed URL, runtime DNS and normal TLS certificate/hostname checks, no resolved-public-IP pinning. No fallback, retry or substitution attempted. No unpause attempted and no source row exists, so repause/disable writes were unnecessary; read-only final state already inactive.

## Required next decision
Stop pending independent review of unexpected live ACL drift. No broader security repair implicitly authorized. Installation and the single capped run remain blocked; no synthetic/live draft IDs or publication timestamps exist.