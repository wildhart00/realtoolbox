# Activate Auth & Expose What's Already Built

Goal: make the existing auth, saved tools, reviews, and `/members` features reachable, plus give you a way to become admin so you can use `/admin`.

## 1. Topbar user menu

Add a user menu to `src/components/layout/Topbar.tsx` (desktop + mobile):

**When signed out:**
- "Sign in" link → `/auth`
- Keep "Submit a Tool" button as-is

**When signed in:**
- Avatar dropdown (initials fallback) with:
  - Saved tools → `/members`
  - My reviews → `/members` (reviews tab)
  - Admin → `/admin` (only if user has `admin` role)
  - Sign out

Uses existing `useAuth` hook and `has_role` RPC. Built with the existing shadcn `DropdownMenu` + `Avatar` components, matching current Topbar styling (dark background, 13px nav text).

## 2. One-time admin promotion

Add a `/setup-admin` route (`src/pages/SetupAdminPage.tsx`) that:
- Requires the user to be signed in (redirects to `/auth` if not)
- Checks if **any** admin already exists in `user_roles`
  - If yes → show "An admin already exists. Contact them for access." and stop
  - If no → show a "Make me admin" button
- On click: inserts an `admin` role for the current user, then redirects to `/admin`

This is safe: it only works for the very first admin. After you claim it, the page becomes inert. We can delete the route file later, or leave it — it can't be abused.

**Technical detail:** the existing RLS on `user_roles` only lets admins insert roles. To allow the first-admin bootstrap, I'll add a `SECURITY DEFINER` RPC `claim_first_admin()` that inserts an admin role for `auth.uid()` **only if** the table has zero admin rows. The page calls this RPC.

## 3. Sign in / sign up flow tweaks

The existing `/auth` page already works. Two small fixes:
- After sign-in/sign-up redirect, default `next` to `/` instead of `/members` when coming from the topbar (so signing in from anywhere returns you to where you were, not to Members)
- No other changes to `AuthPage.tsx`

## 4. What this gives users

- **Bookmark tools** — heart icon on cards already wired up, now reachable via Saved tab
- **Write reviews** — review form already on tool detail pages, now reachable via My reviews tab
- **Submit a tool** — already works, but now they have an account to track submissions
- **Premium resources** — table & UI exist; you can drop PDFs into the `premium-resources` bucket whenever you're ready and they'll show up

## What I'm NOT doing (per your scope)

- No full admin dashboard (submissions review, content CMS, etc.) — that's Option C, separate decision
- No Google sign-in (can add later if you want — just say the word)
- No email template customization

## Files touched

- **edit** `src/components/layout/Topbar.tsx` — add user menu
- **edit** `src/pages/AuthPage.tsx` — change default `next` redirect
- **create** `src/pages/SetupAdminPage.tsx`
- **edit** `src/App.tsx` — add `/setup-admin` route
- **migration** — add `claim_first_admin()` RPC

## How you'll use it

1. I ship this
2. You go to `/auth`, sign up with your email
3. You visit `/setup-admin` once, click the button → you're admin
4. Avatar menu now shows "Admin" → click → run the Firecrawl refresh

Ready to build?