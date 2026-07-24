## Scope

Backend + data model only. No changes to `PricingSection`, homepage sections, nav, or public copy. Public-page rewiring is a separate follow-up.

## 1. Database migration

One migration, in order:

1. **New `purchases` table** (mirrors `subscriptions` security pattern)
   - `id uuid pk default gen_random_uuid()`
   - `user_id uuid not null` (references `auth.users` via app convention, no FK)
   - `toolbox_slug text not null check (toolbox_slug in ('investor_toolbox','agent_toolbox','complete_toolbox'))`
   - `stripe_customer_id text`, `stripe_session_id text unique`, `stripe_payment_intent_id text`
   - `amount_cents integer`, `currency text default 'usd'`
   - `status text not null default 'paid'` (`'paid' | 'refunded'`)
   - `purchased_at timestamptz not null default now()`
   - `created_at`, `updated_at timestamptz` + `update_updated_at_column` trigger
   - Unique `(user_id, toolbox_slug)` so re-purchase upserts cleanly
   - GRANT `SELECT` to `authenticated`; GRANT ALL to `service_role`. No `anon`.
   - RLS enabled. Policy: `SELECT` where `user_id = auth.uid()`. No `INSERT/UPDATE/DELETE` policies (service role only, bypasses RLS).

2. **`skills.toolbox` column**
   - `alter table public.skills add column toolbox text check (toolbox in ('investor','agent'))`
   - `update public.skills set toolbox = 'investor' where is_published = true` (covers the 7 published skills; free skills keep `access_level='free'` and still get a toolbox tag so paid siblings map cleanly).

3. **Deprecate, don't drop `subscriptions`** — leave table, RLS, and trigger untouched. Add a `comment on table public.subscriptions is 'Deprecated 2026-07 — historical only. Entitlements now live in public.purchases.'`.

## 2. Stripe edge functions

### `stripe-bootstrap` (rework)
- Provision three one-time products/prices, idempotent via `metadata.app_key` and `lookup_key`. Test mode (uses existing `STRIPE_SECRET_KEY`).
- Products:
  - `investor_toolbox` — "Investor Toolbox"
  - `complete_toolbox` — "Complete Toolbox"
- Prices (all `recurring: undefined`, one-time):
  - `investor_toolbox_founding` — $79 (7900), active
  - `investor_toolbox_regular` — $99 (9900), active (kept for later swap)
  - `complete_toolbox_founding` — $149 (14900), active
- No Agent Toolbox product yet.
- Response returns product + price IDs for verification.

### `create-checkout-session` (rework)
- Input: `{ toolbox: 'investor' | 'complete', tier?: 'founding' | 'regular' }` (default `founding`).
- Map to `lookup_key`: `investor` → `investor_toolbox_founding` / `investor_toolbox_regular`; `complete` → `complete_toolbox_founding`.
- Reuse existing auth check + Stripe customer lookup off `subscriptions.stripe_customer_id` (so returning users keep one Stripe customer) — write the resolved customer id into `purchases` on webhook, don't backfill `subscriptions`.
- `mode: "payment"`, `line_items: [{ price, quantity: 1 }]`, `payment_intent_data.metadata` + session `metadata` carry `supabase_user_id` and `toolbox_slug` (`investor_toolbox` | `complete_toolbox`).
- `success_url: /welcome?session_id={CHECKOUT_SESSION_ID}`, `cancel_url: /#pricing` (unchanged).

### `stripe-webhook` (rework)
- Signature verification block unchanged.
- New handler for `checkout.session.completed`:
  - Only act when `session.mode === 'payment'` and `session.payment_status === 'paid'`.
  - Resolve `user_id` from `client_reference_id` → `metadata.supabase_user_id` → customer metadata (same fallback chain as today).
  - Resolve `toolbox_slug` from `session.metadata.toolbox_slug`.
  - Upsert into `purchases` on conflict `(user_id, toolbox_slug)` with `stripe_session_id`, `stripe_payment_intent_id`, `stripe_customer_id`, `amount_cents = session.amount_total`, `status = 'paid'`, `purchased_at = now()`.
- Keep `customer.subscription.updated|deleted` and the legacy `checkout.session.completed` subscription branch present but inert (early-return with a log) so any lingering test events don't 500. `subscriptions` table is not written to anymore.

### `get-skill-content` (rework gate)
- Load skill including `toolbox`.
- Free skills: unchanged.
- Paid skills: after `auth.getUser`, query `purchases` (service role) for the user's rows where `status = 'paid'`. Grant if any row's `toolbox_slug === 'complete_toolbox'` OR (`skill.toolbox === 'investor'` AND row `investor_toolbox`) OR (`skill.toolbox === 'agent'` AND row `agent_toolbox`). Otherwise `403 { error: 'purchase_required', required_toolbox: <slug> }`.
- Download-count increment stays.

## 3. Frontend hooks + MCP

### New `src/hooks/useEntitlements.ts`
- Replaces `useSubscription` for gating. `useSubscription` file stays (historical), but nothing new imports it.
- Fetches `purchases` rows for `user.id` (RLS scopes automatically) + realtime channel on `purchases` filtered by `user_id`.
- Returns:
  ```ts
  { loading, ownedToolboxes: Set<'investor_toolbox'|'agent_toolbox'|'complete_toolbox'>,
    hasInvestor: boolean, hasAgent: boolean, hasComplete: boolean,
    canAccess(toolbox: 'investor'|'agent'): boolean, refetch }
  ```
- `canAccess('investor') = hasComplete || hasInvestor`; `canAccess('agent') = hasComplete || hasAgent`.

### `src/hooks/useSkillAccess.ts` (rework)
- Signature becomes `useSkillAccess({ access_level, toolbox })`.
- Free → `{ locked: false, reason: 'free' }`.
- Paid → `canAccess(toolbox)` from `useEntitlements`; locked reason is `'needs_purchase'` with `requiredToolbox` returned so callers can surface the right CTA later. `isPaid` still returned so existing card code compiles until the public-page pass rewrites CTAs.

### MCP tools (`src/lib/mcp/`)
- Delete `tools/get-my-subscription.ts`. Add `tools/get-my-purchases.ts` returning `{ owned_toolboxes: string[], purchases: [{ toolbox_slug, purchased_at, status }] }` via the user-scoped client (RLS enforced).
- `tools/get-skill.ts`: select `toolbox` too; replace the `subscriptions` lookup with the same purchase check as the edge function. `unlock_hint` copy updated to reference a one-time toolbox purchase, not All-Access.
- `src/lib/mcp/index.ts`: swap the tool import + registration; update `instructions` string to describe toolboxes.

### `src/pages/WelcomePage.tsx`
- Read `purchases` via `useEntitlements` (plus a one-shot `session_id` lookup if the query param is present — query `purchases` by `stripe_session_id` through a small RLS-safe select to name the exact toolbox just bought).
- Render the purchased toolbox name + which skills it unlocks. Fallback UI if entitlements are still loading or empty (webhook race).

## 4. Untouched (explicitly)

- `src/components/home/PricingSection.tsx` — still calls `create-checkout-session` with `{ plan: monthly|annual }`, which will now 400. That's expected; the public-page pass rewires it. Do not edit copy.
- Nav, footer, homepage sections, `SkillPreviewCard`, `SkillDetailPage`, `SkillsHomeSection`, `CaptureDialog`.
- `subscriptions` table, its RLS, `useSubscription.tsx` hook file.

## 5. Technical details

- Migration ordering: `purchases` table + grants + RLS + policy + trigger, then `skills.toolbox` column + backfill, then `comment on subscriptions`.
- Webhook idempotency: `stripe_session_id` is unique; upsert on `(user_id, toolbox_slug)` so a retry of the same event is a no-op. If two different toolboxes are purchased, they're separate rows.
- No refund handling in this pass (out of scope). `status` column exists so a later pass can flip to `'refunded'`.
- Edge functions redeploy automatically after edits; no manual step.

## 6. How you'll test end-to-end (deliverable after build)

After the code lands I'll give you exact commands, but the flow will be:

1. **Bootstrap products.** Call `stripe-bootstrap` once — I'll do this via edge-function curl and paste back the returned price IDs. Verify in Stripe test dashboard.
2. **Purchase.** Sign in on the preview, hit `create-checkout-session` with `{ toolbox: 'investor' }` (I'll temporarily invoke it from a devtools snippet since `PricingSection` still uses the old shape). Complete Stripe test checkout with card `4242 4242 4242 4242`.
3. **Webhook.** After redirect, tail `stripe-webhook` logs to confirm `checkout.session.completed` processed. Query `purchases` — one row for that user with `toolbox_slug='investor_toolbox'`, `status='paid'`, `stripe_session_id` set.
4. **Welcome page.** `/welcome?session_id=...` renders "Investor Toolbox" as purchased.
5. **MCP gate.** Call MCP `get_skill` with a paid `investor` skill slug as the same signed-in user → returns full `overview`. Sign out (or use a different account without a purchase) → returns `locked: true` with the new toolbox hint. Call `get_my_purchases` → shows `['investor_toolbox']`.
6. **Complete toolbox.** Repeat step 2 with `{ toolbox: 'complete' }` on a fresh test user; confirm `get_skill` unlocks both investor and (future) agent skills.

## Files touched

- `supabase/migrations/<ts>_toolbox_purchases.sql` (new)
- `supabase/functions/stripe-bootstrap/index.ts` (rewrite)
- `supabase/functions/create-checkout-session/index.ts` (rewrite)
- `supabase/functions/stripe-webhook/index.ts` (rewrite handler bodies, keep signature block)
- `supabase/functions/get-skill-content/index.ts` (swap gate)
- `src/hooks/useEntitlements.ts` (new)
- `src/hooks/useSkillAccess.ts` (rework signature)
- `src/lib/mcp/index.ts` (swap tool)
- `src/lib/mcp/tools/get-my-purchases.ts` (new)
- `src/lib/mcp/tools/get-my-subscription.ts` (delete)
- `src/lib/mcp/tools/get-skill.ts` (swap gate + select `toolbox`)
- `src/pages/WelcomePage.tsx` (render purchased toolbox)
