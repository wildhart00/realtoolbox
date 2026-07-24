## Goal
Run a complete test purchase of the Investor Toolbox in Stripe test mode and verify the entitlement flows through to the app and MCP.

## Step 1 — Bootstrap Stripe products ✅ DONE
Stripe test products/prices are now created:
- Investor Toolbox founding: `price_1TwgrZQPyf47Aq8AeeqSqe9a`
- Investor Toolbox regular: `price_1TwgrZQPyf47Aq8AQHqlnwcT`
- Complete Toolbox founding: `price_1TwgraQPyf47Aq8A0ufP3rVg`

## Step 2 — Create a checkout session
Use the `create-checkout-session` edge function with `toolbox=investor_toolbox`. This returns a Stripe Checkout URL.

## Step 3 — Pay with a Stripe test card
Open the checkout URL in an incognito/private window and use Stripe's standard test card:
- Card number: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

## Step 4 — Verify the purchase row
After checkout succeeds, the `stripe-webhook` edge function records a row in the `public.purchases` table for your user with `toolbox_slug = 'investor_toolbox'` and `status = 'paid'`.

## Step 5 — Check /welcome
Visit `/welcome?checkout=investor_toolbox` (or let the success URL redirect you). The page should show the Investor Toolbox as purchased.

## Step 6 — Verify skill gating
Open a paid skill detail page while logged in as the same user. The "Get All-Access" button should now be replaced with the normal copy/download actions.

## Step 7 — Verify MCP entitlement
Call the MCP `get_my_purchases` tool as the same user. It should return `["investor_toolbox"]`. Then call `get_skill` for a paid skill — it should return the full content instead of a locked preview.

## Notes
- Use a real email address at checkout so the webhook can map the Stripe customer to a Lovable Cloud user account.
- If you want me to run any of these steps for you (e.g., trigger the checkout session or inspect the purchases table), just say the word.