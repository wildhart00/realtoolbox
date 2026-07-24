We'll walk through a single test-mode purchase end-to-end. I'll drive the backend steps; you just click and confirm. We do ONE step at a time — after each, you tell me what happened and we move on.

## Step 1 — Confirm you're signed in (you)
On the preview site, check the top-right corner. You should see your account (not a "Sign In" button). Reply: "signed in as <email>".

## Step 2 — I create a Stripe test checkout session (me)
I'll call `create-checkout-session` for the **Investor Toolbox ($79 founding)** using your logged-in session. I'll paste back a `checkout.stripe.com/...` URL.

## Step 3 — You pay with the test card (you)
Open the URL from Step 2 in the **same browser where you're logged in**. Use Stripe's test card:

```text
Card:  4242 4242 4242 4242
Exp:   any future date (e.g. 12/34)
CVC:   any 3 digits (e.g. 123)
ZIP:   any 5 digits (e.g. 12345)
```

Complete checkout. Stripe redirects you to `/welcome?session_id=...` on the site.

## Step 4 — Confirm the Welcome page unlocks (you)
On `/welcome` you should see a green check and "Investor Toolbox — You're in." Reply with what you see. If it's still spinning after ~10 seconds, tell me and I'll check the webhook.

## Step 5 — I verify the purchase landed in the database (me)
I'll query the `purchases` table for your user and confirm a row with `toolbox_slug = 'investor_toolbox'` and `status = 'paid'`.

## Step 6 — You confirm skill gating unlocked (you)
Visit `/skills`, open any Investor skill, and confirm the "Get All-Access / locked" state is gone and the content/copy action works.

## Step 7 — MCP gate check (optional, me)
If you want, I'll hit the MCP `get_my_purchases` and `get_skill` tools as your user and confirm they return the unlocked content.

---

**Right now, only do Step 1** and reply. I'll take Step 2 as soon as you confirm.
