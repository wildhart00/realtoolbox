# RealToolbox.ai — maintained AI developments & tool-discovery destination (revised plan, nothing auto-applied)

## Core promise
For residential real estate investors and agents: know what changed, why it matters for your work, and what is worth trying. Skills stay as supporting products; existing lifetime purchases and paid routes stay intact. No new DealScreen as the core.

## Verified current state (read this turn, not assumed)
- Backend: one Lovable Cloud instance serves both preview and the published site. Any backend write made "in preview" is a live write. Draft-branch backend isolation is not established for this project and is not relied on.
- Data today: 9 published tools, 4 published blog posts, 0 reviews, 0 saved tools, 0 profile bios, 1 newsletter subscriber, 74 click events, 1 paid purchase.
- Scheduling extensions (pg_cron, pg_net) are installed. Existing scheduled-style functions: `expire-just-launched`, `refresh-tool-images` (both write `tools` with the admin key).
- A web-scraping connector (Firecrawl) is already connected; its plan limits and cost are not yet checked.
- No email-sending function exists. The current newsletter form only stores an address; it delivers nothing. Account signup is not marketing consent.
- `click_events` exists (used by `/go/:slug` and admin analytics); it has no test-traffic exclusion and no event-id dedup.
- Reusable, verified: `tools` + `categories` + `tool_categories`, `ToolCard`/`ToolGrid`/`ToolLogo`/`PricingBadge`, `ToolDetailPage`, `BrowsePage`, `saved_tools` table + `useSavedToolIds`, blog CMS (`BlogAdmin`, `PostBody`), `AdminLayout` + `has_role` admin gating, `CaptureDialog`, `useAuth`, `useEntitlements`, `AffiliateDisclosure`, Stacks pages.
- Security: `profiles` SELECT is `USING (true)` for everyone.

## Recommended architecture
```text
Allowlisted sources (vendor changelogs, pricing pages, release notes)
   -> scheduled fetch (bounded: N sources, 1x/day, timeout, 2 retries)
   -> snapshot hash + normalized diff (change detection, dedup by source+hash)
   -> AI-drafted factual summary of the diff (short, own words, link out; no copying)
   -> REVIEW QUEUE (admin) -> approve / edit / reject
   -> published "Update" with labels + dates
   -> feeds: homepage, tool pages, task finder, watchlists, weekly digest
```
New tables (all admin-write, service-role for jobs, public read only of published rows):
- `sources` — tool_id, url, kind, enabled, last_checked_at, last_success_at, consecutive_failures.
- `source_snapshots` — source_id, fetched_at, content_hash, extracted text (truncated, internal only).
- `updates` — tool_id, title, summary, why_it_matters, audience (investor/agent/both), evidence_level (`vendor_announced` | `editorially_checked` | `hands_on_tested`), source_url, source_published_date, checked_at, status (draft/approved/rejected), reviewed_by.
- `tool_facts` — tool_id, field (price_basis, requirements, limitation…), value, source_url, checked_at; stale flag computed from checked_at.
- `tasks` + `tool_tasks` — task-based finder ("write listing copy", "skip trace", "underwrite a rental").
- `watchlist_items` — user_id, tool_id or topic.
- `email_consents` — user/email, digest opt-in, consented_at, method, unsubscribed_at (separate from signup).
- `analytics_events` — event_id (client-generated, unique), name, session_id, user_id, is_test, created_at.

Operator controls: per-source enable/disable, global "pause collection" flag, manual re-run, failure alert (admin banner + count when a source fails 3x or a job fails), stale badges (fact >90 days unchecked; threshold your choice).

## What may automate vs. what needs review
- Candidate for auto-publish only after a pilot (e.g. 4 weeks, >=95% of drafts approved unedited): price amount changes on a vendor's own pricing page, new version/changelog entries, "checked on" date refresh when nothing changed. Always labeled `vendor_announced`.
- Always human review: "why it matters", any comparison or ranking, `editorially_checked` / `hands_on_tested` labels, security/privacy/compliance claims, financial or return claims, anything about MLS/fair-housing/licensing, sponsorship.
- Never generated: testing claims, rankings, customer results, "continuously monitored" wording beyond the real schedule.

## Monetization (hypothesis, not built now)
Free: updates feed, finder, tool pages, comparisons. Paid hypothesis later: tailored watchlist monitoring and deeper comparisons. Sponsorship later, clearly labeled. Not a news paywall.

## Phases, checkpoints and credit allocation
Credit use is usage-based; these are budget checkpoints to stop and report at, not guaranteed costs. Remaining expiring credits as stated by you: ~78.

Phase 0 — Separately gated security repair (~8). Only after your explicit approval:
- Base `profiles` row: readable/updatable only by its owner; admins read via `has_role`.
- Public author projection: a security-definer function (or view) returning only `display_name, avatar_url` for user_ids that have at least one review, used by `useReviews`. Column grants alone are not used because they cannot distinguish owner from public.
- Tests: anon cannot read `bio` or any profile without a review; owner reads own row; review author names still render. Rollback SQL written first.
- Also proposed separately: `/reset-password` currently lands on `/members` (404) — target choice is yours.

Phase 1 — Smallest useful preview build (~22). Front-end + read-only, no new tables, no jobs, no emails:
- Editorial homepage with Investor / Agent / Both selector (stored in the browser only).
- "What changed" section rendering manually entered updates from a hard-coded, reviewed list in code (5–10 real items you approve, each with source link, source date, checked date, evidence label).
- Evidence-label + stale-badge components reused on tool pages.
- Task finder v0: filter existing 9 tools by tasks you approve (static mapping).
- Truthful copy: no "continuous coverage", no rankings, no invented results.
- Acceptance: every update shows all three dates/labels; selector filters correctly; legacy URLs (`/toolbox/*`, `/skills/*`, `/tools/*`, `/go/*`) resolve; paid skill still unlocks for the paid test account.

Phase 2 — Pipeline + review queue (~30). Needs approval for each live migration and for scraping cost:
- Tables above (except consents/watchlists), admin Sources and Review Queue pages built on `AdminLayout`.
- One edge function, scheduled daily, over a 5–10 source allowlist; hash dedup, retries, failure counter, pause flag.
- AI drafting via the built-in AI service, capped per run (e.g. max 20 drafts/day); nothing publishes without approval.
- Acceptance: unchanged source creates no new draft; changed source creates exactly one; a failing source increments failures and shows an alert; paused flag stops the run; rejected drafts never appear publicly.

Phase 3 — Personalization, consent, analytics (~15):
- Save tools/topics (reuse `saved_tools`; add topics), "changes since you last visited" on a watchlist page.
- Digest opt-in with its own checkbox and record in `email_consents`; actual sending deferred until an email domain/provider is set up and quoted.
- `analytics_events` with unique event_id dedup, `is_test` set for admin/test accounts and localhost, events: selector_choice, update_open, finder_filter, tool_save, digest_optin, outbound_click.
- Acceptance: duplicate event_id stored once; admin sessions excluded from the dashboard; consent record exists only after the explicit checkbox.

Reserve ~3 for fixes. I stop and report at each phase end.

## Approvals needed
1. Phase 0 profile repair and reset-page target (separate from everything else).
2. The Phase 1 update list and task mapping (real content only).
3. Each live migration in Phase 2–3 (preview shares the live database).
4. Scraping source allowlist and connector usage cost.
5. Email provider/domain before any digest is sent.
6. Publish — only on your explicit word.

## Unknowns (stay unknown until quoted/measured)
Daily scraping cost, AI drafting cost per run, email sending cost, backend compute from schedules.

## Smallest useful preview build scope
Phase 1 only: homepage selector, a reviewed hard-coded "What changed" list with labels/dates, evidence/stale badges, static task finder over existing tools. No database, auth, payment, email or scheduling changes.
