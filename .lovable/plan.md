## Surfaces to change

### 1. `src/components/skills/SkillPreviewCard.tsx`
- Add `toolbox` to `SkillCardData` and pass through to `useSkillAccess({ access_level, toolbox })`.
- Add `useAuth` + `useNavigate` + a small `startCheckout(toolbox: "investor"|"complete")` helper that:
  - Signed-out → `navigate("/auth?mode=signup&next=/?checkout=<toolbox>")`.
  - Signed-in → invoke `create-checkout-session` with `{ toolbox, tier: "founding" }`, redirect to `data.url`; toast on error.
- Replace the "Get All-Access" locked-CTA with two buttons:
  - Primary: `Get the Investor Toolbox — $79` (for investor skills) or `Get the Agent Toolbox — coming soon` (agent skills — disabled).
  - Secondary text link: `Or the Complete Toolbox — $149`.
- Free (non-paid) skill: keep the `Start free` link to `/skills/:slug` (Deal-Screen free-account flow lives on the detail page).
- Owned/unlocked paid skill: unchanged (`Open skill` linking to detail page).
- Lock badge stays; change label from "All-Access" to "Locked".

### 2. `src/pages/SkillDetailPage.tsx`
Locked-paid state (`isPaid && locked`):
- Replace the "Get All-Access" block with a Toolbox purchase block. Copy:
  - Heading: `Own the ${requiredToolbox === 'investor_toolbox' ? 'Investor' : 'Agent'} Toolbox`.
  - Body: "One payment, lifetime updates. Every skill in this toolbox unlocks the moment you buy."
  - Primary: `Get the Investor Toolbox — $79 (founding, reg $99)` → `startCheckout("investor")`.
  - Secondary: `Or get the Complete Toolbox — $149` → `startCheckout("complete")`.
  - Tertiary link: `Browse other skills` (unchanged).
- Reuse the same `startCheckout` helper as in the card (signed-out → `/auth?mode=signup&next=/skills/<slug>?checkout=<toolbox>`; signed-in → invoke edge fn). Add a `useEffect` that auto-resumes checkout when the URL carries `?checkout=investor|complete` and the user is signed in (mirrors the PricingSection resume flow), then strips the param.

Free-skill Deal-Screen gate (`!isPaid`, i.e. Deal Screen):
- The "Copy skill" primary action currently opens `CaptureDialog` for anon users. Change: if `!user`, route to `/auth?mode=signup&next=/skills/${slug}?copy=1` instead of opening the dialog. Preserve the newsletter-list capture by using `mode="free-skill"` `source="deal_screen_free"` inside a lightweight helper: after successful auth-return, the existing `fetchAndCopySkill` runs (already gated server-side by the edge function). Since the edge function uses the caller's auth bearer if present but the Deal Screen is `access_level='free'`, content will flow.
- Also: on mount, if `?copy=1` and `user`, auto-run `fetchAndCopySkill` and strip the param.
- Warm-frame the button: rename `Copy skill` (locked-out state) to `Copy skill — free with account`.
- Ensure a `newsletter_subscribers` row gets written with `source: 'deal_screen_free'` on first-time signups from this flow. Add a small effect: when `?copy=1` triggers auto-copy for a signed-in user, insert into `newsletter_subscribers` with source `deal_screen_free` and their user email (ignore 23505 duplicates). This preserves list capture without CaptureDialog.
- Keep unlocked paid state unchanged (Copy skill + LLM links).

### 3. `src/components/home/PricingSection.tsx`
Rewrite the card grid into three toolbox cards + the resume flow:
- Card A — **Deal Screen (Free)**: $0 forever. CTA `Start free` → `/auth?mode=signup&next=/skills/deal-screen?copy=1` when logged out; when logged in, link straight to `/skills/deal-screen`. Bullet list stays as-is.
- Card B — **Investor Toolbox** (featured, gradient border): `$79 founding` with `$99` struck-through beside it. Bullets: "Every investor skill (7 at launch)", "Deal Analyzer & Underwriter", "Lifetime updates as new investor skills drop", "One payment — own it forever". CTA `Get the Investor Toolbox → $79` → `startCheckout("investor")`.
- Card C — **Complete Toolbox**: `$149 founding`. Bullets: "Every investor skill", "Agent Toolbox included free when it releases", "Lifetime updates on both", "One payment — own it forever". CTA `Get the Complete Toolbox → $149` → `startCheckout("complete")`.
- Remove monthly/annual toggle, remove `plan` state, remove `$39/mo`/`All-Access` language.
- Resume flow: change `?checkout=monthly|annual` to `?checkout=investor|complete`. Auto-trigger effect passes `{ toolbox: target, tier: "founding" }` to `create-checkout-session`.
- Headline copy: `Own the toolbox that fits how you invest.` Subhead: `Start free. Buy once. Own it forever — including every new skill we add.`
- Footer note: replace `Cancel anytime. Founding-member pricing won't last.` with `One-time payment. Founding-member pricing won't last.`

### 4. `src/pages/SkillsPage.tsx`
- Pass the additional `toolbox` field through: extend `SkillRow` and the `select(...)` to include `toolbox`, so `SkillPreviewCard` receives it. No copy changes on this page (hero/how-it-works/newsletter capture stay the same — none of them use subscription language).

### 5. `src/pages/WelcomePage.tsx`
Text-only sweep — no logic changes. Nothing here says "All-Access"/"membership" already; keep as-is.

### 6. `src/components/capture/CaptureDialog.tsx`
- No functional change. Verify no leftover subscription language (there isn't). Leave the free-skill fallback flow intact for any other free-skill uses; the Deal Screen path now bypasses it in favor of the auth-based free account.

## Wiring reused

- The `startCheckout` helper appears in three places (PricingSection, SkillPreviewCard, SkillDetailPage). Extract to a tiny `src/hooks/useCheckout.ts` returning `{ startCheckout, loading }` that encapsulates auth-redirect + edge-function invoke + toast handling. Reused by all three.
- `next=` targets are same-origin relative paths; matches existing `AuthPage` handling.

## Not touched this pass

Hero, Index, Topbar, Footer, InvestorArc, ChooseYourStage, SkillsHomeSection, SkillsAnnouncementStrip, NewsletterCard, MembersPage, PricingSection FAQ (none exists yet in-file). The user will do directory/nav next.

## Verification checklist to hand back

- **Signed out**: SkillPreviewCard (locked investor skill) → both CTAs bounce to `/auth?next=/?checkout=investor|complete`; after auth, PricingSection resume triggers Stripe. Deal-Screen card → `Start free` bounces to auth with `next=/skills/deal-screen?copy=1`; after auth the detail page auto-copies and writes the `deal_screen_free` subscriber row.
- **Free account, no purchase**: Deal-Screen detail page copies the skill; investor skill detail page shows locked purchase block with working `startCheckout`.
- **Investor purchaser**: investor skills show `Open skill` / `Copy skill` and copy works; Complete Toolbox card in Pricing still buyable if they want to upgrade; agent skills still locked.
- **Complete purchaser**: every paid skill unlocked.
