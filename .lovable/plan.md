# All-Access Stripe Subscriptions

Heads up on one thing before the plan: I checked your project and there is no existing Stripe connection yet — only Google Search Console, Notion, Twilio, and Firecrawl. So we'll be wiring Stripe up fresh using your own Stripe account (BYOK), which is exactly what your requirements describe (your secret key + webhook signing secret, our edge functions, our `subscriptions` table).

Lovable normally recommends the seamless built-in Stripe integration, but your spec is explicit about using your own keys, your own webhook, and writing directly to the `subscriptions` table you just created — so BYOK is the right call here.

## What I'll build

### 1. Stripe products & prices
I'll create a small one-shot edge function `stripe-bootstrap` that, when you hit it once, uses your `STRIPE_SECRET_KEY` to create:
- Product: **All-Access**
- Price: **$39 / month** (recurring, `lookup_key = all_access_monthly`)
- Price: **$390 / year** (recurring, `lookup_key = all_access_annual`)

It's idempotent via `lookup_key`, so re-running won't create duplicates. You won't have to touch the Stripe dashboard for products.

### 2. Checkout edge function — `create-checkout-session`
- Requires a logged-in Supabase user (validates JWT via `getClaims`).
- Accepts `{ plan: "monthly" | "annual" }`.
- Looks up the price by `lookup_key`.
- Reuses an existing `stripe_customer_id` from the `subscriptions` row if present; otherwise creates a Stripe Customer with `metadata.supabase_user_id = <uid>` and the user's email.
- Creates a Checkout Session with:
  - `mode: "subscription"`
  - `client_reference_id = <supabase user id>`
  - `subscription_data.metadata.supabase_user_id = <uid>` (so the webhook can map subscription events back even without a session)
  - `success_url = {origin}/welcome?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url = {origin}/#pricing`
- Returns `{ url }`.

### 3. Frontend wiring
- `PricingSection.tsx` "Get All-Access" button:
  - If logged out → `navigate("/auth?next=/checkout?plan=monthly")`.
  - If logged in → call `create-checkout-session` and `window.location.href = url`.
  - I'll also add a small toggle (Monthly / Yearly) on the All-Access card so users can pick a plan; defaults to monthly to keep your current layout.
- New `/welcome` page: simple "You're in" confirmation that polls the `subscriptions` table for up to ~10s waiting for the webhook to flip status to `active`/`trialing`, then links to the skills.
- After login on `/auth`, honor a `next` param so users land back at checkout.

### 4. Webhook edge function — `stripe-webhook`
- Configured with `verify_jwt = false` in `supabase/config.toml` (public endpoint, signed by Stripe).
- Reads the raw body, verifies `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` using `stripe.webhooks.constructEventAsync` (required in Deno).
- Handles:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Resolves `supabase_user_id` from (in order): `session.client_reference_id`, `session.metadata.supabase_user_id`, `subscription.metadata.supabase_user_id`, then falls back to Customer `metadata.supabase_user_id`.
- Uses the **service role key** to upsert into `public.subscriptions` keyed on `user_id` (your unique constraint), writing `stripe_customer_id`, `stripe_subscription_id`, `plan` (derived from the price lookup_key), `status`, `current_period_end`.
- Status mapping → allowed enum values:
  - `active` → `active`
  - `trialing` → `trialing`
  - `past_due` / `unpaid` → `past_due`
  - `canceled` / `incomplete_expired` → `canceled`
  - everything else (incomplete, paused, etc.) → `inactive`
- Returns 200 quickly; logs errors with enough context to debug from `edge_function_logs`.

### 5. Access gating (single source of truth)
- New hook `useSubscription()` in `src/hooks/useSubscription.tsx`:
  - Reads the current user's row from `public.subscriptions` via the existing RLS SELECT policy (`auth.uid() = user_id`).
  - Exposes `{ isActive, status, plan, currentPeriodEnd, loading }` where `isActive = status === 'active' || status === 'trialing'`.
  - Subscribes to realtime updates on that row so the UI flips immediately when the webhook lands.
- All paid gating in the app reads from this hook only. Nothing in localStorage, no client writes — the table is service-role-write only, exactly per your spec.

## Technical details

**New files**
- `supabase/functions/stripe-bootstrap/index.ts` — one-shot product/price creator (idempotent via `lookup_key`).
- `supabase/functions/create-checkout-session/index.ts` — JWT-guarded checkout session creator.
- `supabase/functions/stripe-webhook/index.ts` — signature-verified webhook → service-role upsert.
- `src/hooks/useSubscription.tsx` — single source of truth for paid status.
- `src/pages/WelcomePage.tsx` — post-checkout landing.

**Edits**
- `src/components/home/PricingSection.tsx` — wire the button + add monthly/annual toggle.
- `src/pages/AuthPage.tsx` — honor `?next=` param post-login.
- `src/App.tsx` — register `/welcome` route.
- `supabase/config.toml` — add `[functions.stripe-webhook] verify_jwt = false`.

**Stripe SDK in Deno**: `import Stripe from "npm:stripe@17"`, instantiated with `httpClient: Stripe.createFetchHttpClient()`. Webhook verification uses `await stripe.webhooks.constructEventAsync(...)` because Deno's crypto is async.

**Plan derivation in webhook**: read `subscription.items.data[0].price.lookup_key` → `'all_access_monthly'` or `'all_access_annual'` → stored in `subscriptions.plan`.

## Answers to your three end-of-task questions (preview)

1. **Products/prices**: I'll create them automatically via the `stripe-bootstrap` function. You just hit it once after deploy (I'll give you the curl command and an admin button). No dashboard work needed.

2. **Secrets you need to add** (I'll prompt for these via the secure form):
   - `STRIPE_SECRET_KEY` — your Stripe secret key (`sk_test_...` for sandbox, `sk_live_...` for live).
   - `STRIPE_WEBHOOK_SECRET` — the `whsec_...` shown when you create the webhook endpoint in Stripe.
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already present in your edge function environment, so I don't need anything else from you.

3. **Webhook URL to register in Stripe** (dashboard → Developers → Webhooks → Add endpoint):
   `https://pcnsuyadfqrmythikwpa.supabase.co/functions/v1/stripe-webhook`
   Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the resulting signing secret into `STRIPE_WEBHOOK_SECRET`.

## Order of operations after you approve
1. I write the three edge functions, the hook, the welcome page, and the pricing wiring.
2. I request `STRIPE_SECRET_KEY` (you can start with a test key).
3. You run `stripe-bootstrap` once → products + prices created in Stripe.
4. You register the webhook URL in Stripe → paste the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Test a checkout end-to-end with Stripe's test card `4242 4242 4242 4242`; confirm the `subscriptions` row flips to `active` and `useSubscription().isActive` goes true.
