## Verification result

- **WelcomePage** — aligned with the one-time-purchase model. No changes needed.
- **CaptureDialog** — aligned. No changes needed.
- **Codebase sweep** — one user-visible violation remains.

## Fix

**`src/pages/OAuthConsentPage.tsx` (lines ~142–143)**

Current copy:
> "This connection does not bypass your account's permissions or subscription limits. Paid skills remain gated by your All-Access status."

Replace with one-time-purchase language, e.g.:
> "This connection does not bypass your account's permissions. Paid skills remain gated by the Toolboxes you own."

Copy-only edit, no structural or logic changes.

## Non-issues (intentionally left alone)

- Newsletter "Subscribe" CTAs on `ResourcesPage` and `PrivacyPage` — refer to the email newsletter, not a paid subscription product.
- Admin `SubscribersAdmin`, `Dashboard`, `newsletter_subscribers` / `skill_subscribers` table references — backend/admin only.
- `AffiliatesAdmin` "monthly history" — affiliate earnings history, unrelated to the retired plan.
- `stripe-webhook` legacy `subscription` branches — inert compatibility code with deprecation comments.
- Legacy `subscriptions` table migration + generated `types.ts` — historical, not user-facing.
- Supabase auth `data.subscription.unsubscribe()` — SDK API, not copy.
