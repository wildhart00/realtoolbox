# RealToolbox.ai — investor-first evolution (plan only, nothing auto-applied)

## Recommended architecture (one)
Keep the current site, routes, Stripe one-time purchases and entitlements exactly as they are. Add **one guided "First-Pass Deal Check" page** at a new URL (`/toolbox/deal-screen/check`) that runs **entirely in the browser** on numbers the user types (or a built-in synthetic sample deal). No file uploads, no AI model calls, no new paid tier. Output = a checklist of assumptions, each tagged *user-entered / derived / unknown*, with simple rule-based flags (e.g. rehab budget missing, ARV source not stated, rent not verified). Results can be saved only as an opt-in email of the summary to the user (reuses the existing newsletter capture), not a stored "deal" record.

Why: delivers the hosted Deal Screen the September remix promised without hosted AI cost, without storing customer documents, and without letting a one-time purchase turn into unlimited AI. Hosted AI is a later, separately priced decision once unit economics are known.

## Verified current state (read this turn)
- Routes: `/toolbox/:slug` skill detail, `/toolbox/investor`, `/resources/*`, `/how-it-works`, `/auth`, `/reset-password`. No `/members` route exists.
- `ResetPasswordPage` sends users to `/members` after a reset — that lands on the 404 page.
- `profiles` SELECT policy is `USING (true)` for everyone; table includes `bio`. Reviews only need `display_name` + `avatar_url` (confirmed in `useReviews`).
- Tests: Vitest set up, only `example.test.ts` exists.
- Reusable: `CaptureDialog` (email + investor stage), `freeDealScreenPath()` signup routing, `useEntitlements`, `SkillDetailPage` layout, `ResourceArticleLayout`, `GuardrailCards`, `HowToUseSteps`, `/resources/verifying-comps` and `/offer-checklist` pages, `AppLayout`, design tokens.

## Phase 1 — Security proposal, auth route, truthful positioning (budget cap ~18 credits)
Needs your approval for each item before it runs:
1. **Profiles exposure (approval required).** Replace the open SELECT with: users read their own full row; anon/authenticated get column-level SELECT on `user_id, display_name, avatar_url` only (same pattern used for `skills.file_url`). Reviews keep working; `bio` stops being public. Verify with an anonymous request that `bio` is refused and a tool page still shows reviewer names.
2. **Password reset landing (approval required).** Change `/members` target to `/welcome` (existing page). `MembersPage.tsx` stays as backlog, untouched.
3. **Truthful copy.** Audit hero, toolbox, skill detail and OfferBand for claims of hosted screening, saved deals, or numbers not backed by data; replace with what exists today. Deliver a list of exact before/after lines for your sign-off first.

## Phase 2 — One working outcome flow (budget cap ~35 credits)
- New page `/toolbox/deal-screen/check`: 4-step form (property & strategy, purchase/rehab, exit or rent assumptions, sources for each number).
- Pure TypeScript rules module produces flags + "unknowns" list; each line shows its source label. No market data, comps or return promises — only arithmetic on user inputs (e.g. max offer at user's chosen rule) clearly labeled as such.
- "Load sample deal" button with obviously synthetic numbers labeled "Example — not a real property".
- Optional "Email me this summary" via existing `CaptureDialog` (source `deal-check`).
- Link in from existing Deal Screen skill page and homepage `DealScreenStrip`; existing URLs unchanged.
- Unit tests for each rule (concrete inputs → expected flag).

## Phase 3 — Original workflow content, conversion, QA (budget cap ~20 credits)
- Two workflow pages under `/resources/` (e.g. "Checking an ARV before you offer", "Rehab budget sanity check"), each ending in the Deal Check and the free signup. Written from method, not invented results.
- Sitemap + meta updates for new pages only.
- Playwright pass: signed out, signed in free, signed in with a paid toolbox — confirm paid skills still unlock and nothing regressed.

Total cap ~73 of ~78; ~5 held for fixes. Credit use is usage-based, so these are budget caps to stop at, not guaranteed costs; I will report at each phase end and pause before exceeding a cap.

## Isolating drafts from the live database
- Phase 2 and 3 are front-end only (no schema change) and can be built in a **draft branch**, which has its own isolated backend, previewed, then accepted.
- Phase 1 policy change is the only live-DB change; it ships as one reversible migration with a written rollback (restore the previous policy).
- No publish without your explicit "publish".

## Instrumentation
- Reuse `newsletter_subscribers.source` values: `deal-check`, `workflow-arv`, `workflow-rehab`.
- Count step completion in the existing project analytics (page views per step URL hash); no new tracking table.
- Measured: Deal Check starts, completions, email opt-ins, signup clicks, toolbox page visits from the check.

## Acceptance criteria
- Anonymous request cannot read `profiles.bio`; reviews still show names/avatars.
- Password reset ends on a real page, not 404.
- Deal Check works with zero network calls to AI/model endpoints; every output line shows a source label; sample deal clearly labeled synthetic.
- Rule tests pass; existing paid entitlements unlock the same skills before and after.
- No new testimonials, customer names, market stats or return figures anywhere.
- All existing indexed URLs still resolve.

## Approvals needed from you
1. Profiles policy change (Phase 1.1).
2. Reset landing page target (1.2).
3. Copy before/after list (1.3).
4. Draft-branch use for Phase 2–3, and final accept/publish.

## Smallest first build brief
Phase 1 items 1–2 only: one migration (profiles column-level read) + one-line reset redirect fix, verified by an anonymous query and a reset-flow click-through. Nothing else changes.
