## Goal
Update navigation structure and create a `resources` table to support upcoming MCPs, Skills, Agents, and Resources sections.

## Changes

### 1. Navigation update (`src/components/layout/Topbar.tsx`)
Replace current `navLinks` array with:
- Browse → `/`
- MCPs → `/mcps`
- Skills → `/skills`
- Agents → `/agents`
- Resources → `/resources`
- Blog → `/blog`
- Newsletter → `#newsletter` (keeps existing scroll behavior)

Keep existing scroll-to-top logic for `/` and newsletter scroll handler.

### 2. Route stubs (`src/App.tsx`)
Add four new routes pointing to a single shared placeholder page component (`src/pages/ComingSoonPage.tsx`) that reads the route and shows a clean "Coming soon" message with the section name (MCPs / Skills / Agents / Resources). One file, four routes — avoids four near-identical stubs.

### 3. Database — new `resources` table
Migration creates:
- `resources` table with: `id` (uuid pk), `title`, `slug` (unique), `type`, `description`, `access_level`, `file_url` (nullable), `cover_image_url` (nullable), `is_published` (bool default false), `created_at`, `updated_at`
- CHECK constraints on `type` (guide|prompt-library|template|video|download) and `access_level` (free|email-gated|premium)
- GRANTs: SELECT to anon + authenticated, ALL to service_role, full CRUD to authenticated (gated by RLS)
- RLS enabled with policies:
  - Public SELECT where `is_published = true`
  - Admins (via `has_role(auth.uid(), 'admin')`) full ALL access
- `updated_at` trigger using existing `update_updated_at_column()`

## Out of scope (next sends)
- Actual content/UI for MCPs, Skills, Agents, Resources pages
- Admin CRUD UI for resources
- Seeding any resources
