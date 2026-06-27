## Create `subscriptions` table

Add a new `public.subscriptions` table to track paid memberships. No existing tables are modified.

### Migration

Single migration that:

1. Creates `public.subscriptions` with columns:
   - `id` uuid PK, default `gen_random_uuid()`
   - `user_id` uuid NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE, UNIQUE
   - `stripe_customer_id` text
   - `stripe_subscription_id` text
   - `plan` text
   - `status` text NOT NULL default `'inactive'`, CHECK in (`inactive`, `active`, `trialing`, `past_due`, `canceled`)
   - `current_period_end` timestamptz
   - `created_at` timestamptz NOT NULL default `now()`
   - `updated_at` timestamptz NOT NULL default `now()`

2. Indexes on `stripe_customer_id` and `stripe_subscription_id`.

3. GRANTs:
   - `GRANT SELECT ON public.subscriptions TO authenticated;` (read-own-row only)
   - `GRANT ALL ON public.subscriptions TO service_role;` (for Edge Function webhooks)
   - No grants to `anon`.

4. Enable RLS.

5. Policies:
   - SELECT policy for `authenticated`: `auth.uid() = user_id`.
   - No INSERT/UPDATE/DELETE policies — all writes go through service role (which bypasses RLS) from Edge Functions.

6. Trigger: `BEFORE UPDATE` on `subscriptions` calling existing `public.update_updated_at_column()` to refresh `updated_at`.

### Out of scope (later steps)

No code changes, no Edge Functions, no Stripe wiring yet — this plan creates only the table, RLS, indexes, and trigger.
