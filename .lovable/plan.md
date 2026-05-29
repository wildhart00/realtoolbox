## Fix post-signup UX on `/auth`

Make it obvious that the user must confirm their email before signing in.

### Changes to `src/pages/AuthPage.tsx`

1. Add a new `mode` value `"check-email"` and a `pendingEmail` state.
2. In `handleSignUp`, on success: set `pendingEmail = email`, switch to `mode = "check-email"` (instead of `setMode("signin")`). Keep the toast.
3. Render a "Check your email" panel when `mode === "check-email"`:
   - Heading: "Confirm your email"
   - Body: "We sent a confirmation link to **{pendingEmail}**. Click the link to activate your account, then come back and sign in."
   - Note about checking spam / link expiry
   - **Resend email** button → `supabase.auth.resend({ type: 'signup', email: pendingEmail })` with loading state + toast
   - **Back to sign in** link → switches to `signin` tab
4. In `handleSignIn`, detect the `"Email not confirmed"` error from Supabase and instead of a plain toast, show an inline alert above the form with a **Resend confirmation email** button (reuses the same resend handler).

### Files touched

- **edit** `src/pages/AuthPage.tsx` — only file changed

No DB, no auth-config, no new routes.
