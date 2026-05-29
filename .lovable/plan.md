# Sync Notion with current RealToolbox state

Goal: Update the RealToolbox.ai Notion page (`35690958-a71e-8197-814f-ce3c5b89df17`) so another AI agent can read it and have a complete picture of the app — features, routes, backend schema, integrations, and admin workflows.

## What I'll add / refresh on the Notion page

I'll add (or replace) a structured **"Project Snapshot — 5/29/2026"** section with the following blocks:

### 1. Product overview
- One-paragraph description of RealToolbox.ai
- Live URLs: realtoolbox.ai, www.realtoolbox.ai, Lovable preview
- Tech stack: React 18 + Vite + Tailwind + shadcn/ui, Lovable Cloud (Supabase) backend, GitHub-synced

### 2. Public features (with routes)
- `/` Home — Hero, Featured strip, Category rail, Browse section, Newsletter
- `/category/:slug` — Category browse pages
- `/tool/:slug` — Tool detail (founder bio, key features, use cases, reviews, save)
- `/blog` — Blog index + posts
- `/submit` — Public tool submission form
- `/members` — Premium resources (auth-gated)
- `/auth`, `/reset-password` — Authentication
- `/go/:slug` — Affiliate click-tracking redirect

### 3. Admin features (`/admin/*`)
- Dashboard, Tools (with ToolFormDialog), Categories, Submissions review, Reviews, Subscribers, Blog editor, Analytics, **Affiliates** (programs + monthly earnings), Maintenance, Setup admin

### 4. Featured tools workflow
- How `is_featured` + `featured_order` drive the homepage strip
- Where to edit (Admin → Tools)

### 5. Backend schema (Lovable Cloud)
Table-by-table summary of: `tools`, `categories`, `tool_categories`, `submissions`, `reviews`, `saved_tools`, `profiles`, `user_roles` (admin/member), `blog_posts`, `newsletter_subscribers`, `click_events`, `premium_resources`, `affiliate_programs`, `affiliate_earnings` — including key columns and RLS posture (public-read vs admin-only vs owner-only).

### 6. Auth & roles
- Email/password auth, `profiles` auto-created on signup
- `user_roles` table with `admin` / `member` enum
- `has_role()` security-definer function used by all RLS policies
- `claim_first_admin()` RPC for bootstrap

### 7. Storage buckets
- `tool-logos` (public), `avatars` (public), `blog-images` (public), `premium-resources` (private)

### 8. Edge functions & integrations
- `refresh-tool-images` edge function
- Firecrawl connector (FIRECRAWL_API_KEY)
- Lovable AI Gateway available (LOVABLE_API_KEY)
- GitHub sync active

### 9. Known next actions
Carry forward open items from the existing Next Actions list, marking what's done.

## How I'll do it

One `mcp_notion_xvlm2--notion-update-page` call using `replace_content` with `allow_deleting_content: false` so the "🚀 Full Execution Plan" child page is preserved. I'll fetch the page first to get the exact current markdown for the `old_str` anchor.

## Out of scope

- No code changes
- Won't touch the child "Full Execution Plan" page
- Won't add screenshots or embeds (text-only snapshot for agent consumption)