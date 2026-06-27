## Add Stripe secrets and finish wiring

Approve this plan to switch to build mode so I can open the secure secrets form and run the bootstrap.

### Steps

1. **Request Stripe secrets** via the secure form:
   - `STRIPE_SECRET_KEY` — your Stripe secret key (`sk_test_...` to start in sandbox, or `sk_live_...` for live).
   - `STRIPE_WEBHOOK_SECRET` — the `whsec_...` Stripe shows after you register the webhook URL.

2. **Fix the webhook boot error.** Current logs show `Neither apiKey nor config.authenticator provided` because `Stripe` is constructed at module load with an empty key. I'll change `supabase/functions/stripe-webhook/index.ts` and `create-checkout-session/index.ts` to construct the Stripe client lazily inside the request handler (after secrets are set) so cold starts don't crash when the env var arrives.

3. **Register the webhook in Stripe** (you do this in the Stripe dashboard):
   - URL: `https://pcnsuyadfqrmythikwpa.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the resulting `whsec_...` into the `STRIPE_WEBHOOK_SECRET` field.

4. **Bootstrap products/prices.** Once `STRIPE_SECRET_KEY` is saved, I'll invoke the existing `stripe-bootstrap` function once to create the All-Access product with `all_access_monthly` ($39) and `all_access_annual` ($390) prices in your Stripe account (idempotent via `lookup_key`).

5. **Verify.** Confirm bootstrap returned both price IDs, then you can do a sandbox checkout from the Pricing section to confirm the webhook writes an `active` row into `public.subscriptions` and `/welcome` flips to "You're in."

### What you'll need handy
- Your Stripe secret key (from Stripe Dashboard → Developers → API keys).
- 2 minutes in the Stripe Dashboard to add the webhook endpoint after step 1, so we can paste the signing secret.
