## Goal

Gate Paid skills so only subscribers (status `active` or `trialing`) can retrieve the skill content. Free skills stay open. Cards and detail pages remain publicly visible — only the action (download/copy) is locked.

## Backend (source of truth)

1. **Lock down the `skill-files` storage bucket**
   - Flip `skill-files` from public to private via `supabase--storage_update_bucket`.
   - This invalidates the existing public `file_url`s — they will no longer be directly fetchable. That's the point.

2. **New edge function: `get-skill-content`** (`verify_jwt = false`, CORS enabled, validates JWT in code)
   - Input: `{ slug: string }`.
   - Loads skill row with service role: must be `is_published = true`.
   - If `access_level = 'free'`: return signed URL (or raw text) for `file_url`.
   - If `access_level = 'paid'`:
     - Require Authorization header → validate via `supabase.auth.getUser(token)`.
     - Look up `subscriptions` row for that `user_id`; allow only if `status IN ('active','trialing')`.
     - On allow: generate short-lived signed URL from the private `skill-files` bucket (parse storage path from `file_url`) and return `{ signedUrl, content }` (fetch text server-side and return it, so the client never needs bucket access).
     - On deny: 403 `{ error: 'subscription_required' }`.
   - Also increments `download_count` via existing `increment_skill_download` RPC on success.

3. **Public read of `skills` table stays as-is** — cards/detail still render metadata for everyone. We just stop exposing `file_url` as the access mechanism.

## Frontend

4. **`useSubscription` hook** — already exists, reuse. Add a tiny `useSkillAccess(skill)` helper that returns `{ locked: boolean, reason: 'free'|'subscribed'|'needs_sub' }`.

5. **`SkillPreviewCard.tsx`** (used on Skills page, homepage hero, SkillsHomeSection)
   - Free skill → unchanged ("Start free").
   - Paid + not subscribed → `Lock` icon + small "All-Access" badge; primary button becomes **"Get All-Access"** linking to `/#pricing` (Pricing section anchor on home).
   - Paid + subscribed → small "Unlocked" badge; primary button **"Copy skill"** that calls the edge function and copies returned content.
   - Remove the existing `CaptureDialog` "early access" path for paid skills (replaced by real gating).

6. **`SkillDetailPage.tsx`**
   - Overview/description still render for everyone.
   - Free: keep existing email-capture + copy flow (calls the edge function for `free` content too, so we have one path).
   - Paid + not subscribed: replace "Coming soon — Join for early access" with `Get All-Access` button → `/#pricing`, plus locked notice ("Members-only skill. Unlocks with All-Access.").
   - Paid + subscribed: show "Copy skill" + LLM links; copy action calls `get-skill-content` edge function (no direct fetch of `file_url`).

7. **Pricing anchor** — add `id="pricing"` to `PricingSection` so `/#pricing` scrolls there. The existing `?checkout=` resume flow stays.

## Files to add / edit

- `supabase/functions/get-skill-content/index.ts` (new)
- `supabase--storage_update_bucket` for `skill-files` → private
- `src/hooks/useSkillAccess.ts` (small new helper)
- `src/components/skills/SkillPreviewCard.tsx` (gating + button states)
- `src/pages/SkillDetailPage.tsx` (gating + edge-function-based copy)
- `src/components/home/PricingSection.tsx` (add `id="pricing"`)

## Test matrix

- Logged out + Free skill → copy works.
- Logged out + Paid skill → card/detail visible, button = "Get All-Access", direct call to edge function returns 401/403, no `file_url` fetch possible (bucket private).
- Logged in, no sub + Paid skill → same as logged out (button → pricing), edge function returns 403.
- Logged in, active sub + Paid skill → "Copy skill" works via edge function; `download_count` increments.

## Notes

- No schema migrations required (subscriptions table already exists).
- Existing `CaptureDialog` "early-access" mode stays available but is no longer triggered from paid skill cards.
- Security: skill markdown is never served from a public URL after this change; access is gated on every request by the edge function reading `subscriptions` with the service role.
