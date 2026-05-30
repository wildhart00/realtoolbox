## Rework MCPs → Integrations

Replace the hardcoded `/mcps` page with a database-driven `/integrations` section, plus admin CRUD and seed data.

### 1. Database & storage

New migration adds:

- Table `public.integrations`
  - `id uuid pk default gen_random_uuid()`
  - `name text not null`
  - `slug text not null unique`
  - `tagline text not null`
  - `category text not null` (free text, validated in app to: `property-data`, `crm`, `communication`, `productivity`, `content-creation`, `automation`, `developer`)
  - `logo_url text`
  - `setup_url text not null`
  - `difficulty text not null default 'easy'` (`easy` | `medium` | `advanced`)
  - `sort_order integer not null default 0`
  - `is_published boolean not null default false`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()` + trigger
- GRANTs: `select` to `anon` + `authenticated`, full to `authenticated` (gated by RLS) and `service_role`
- RLS:
  - Public select where `is_published = true` (admins see all)
  - Admin all (insert/update/delete) via `has_role(auth.uid(), 'admin')`
- Storage bucket `integration-logos` (public read, admin write policies on `storage.objects`)
- Seed 6 rows (all `is_published = true`, ascending sort_order):
  1. Gmail — communication — easy — `https://claude.com/blog/connectors`
  2. Google Calendar — productivity — easy — `https://claude.com/blog/connectors`
  3. Notion — productivity — easy — `https://www.notion.so/help/notion-mcp`
  4. Zapier — automation — easy — `https://zapier.com/mcp`
  5. Higgsfield — content-creation — medium — `https://higgsfield.ai`
  6. BatchData — property-data — medium — `https://batchdata.io`

### 2. Public `/integrations` page

New `src/pages/IntegrationsPage.tsx`:

- Hero with the exact headline, subheadline, and small note text from the request
- Category filter pill bar (All + 7 categories) — client-side filtering of the fetched list
- Card grid (reuses spacing/styling tokens from current MCPCard) with:
  - Logo from `logo_url`; fallback = neutral rounded tile tinted by category color (no home icon)
  - Name, tagline, category pill, difficulty pill (green/yellow/orange via existing token palette)
  - "Learn how to connect →" anchor → `setup_url` in new tab
  - Hover: subtle translate + indigo accent border (matches current cards)
- Bottom CTA: "Know an integration we should add? Submit it →" linking to `/submit`
- New `IntegrationCard.tsx` component

Data fetched via `supabase.from('integrations').select().eq('is_published', true).order('sort_order').order('name')` using react-query.

### 3. Routing & nav

- `src/App.tsx`: add `/integrations` route; change `/mcps` route to a redirect component (`<Navigate to="/integrations" replace />`) for SEO continuity
- `src/components/layout/Topbar.tsx` (and any mobile menu / footer Quick column): rename "MCPs" → "Integrations", point to `/integrations`
- Delete old hardcoded `src/pages/MCPsPage.tsx` and `src/components/mcps/MCPCard.tsx` (no longer referenced)

### 4. Admin `/admin/integrations`

- New `src/pages/admin/IntegrationsAdmin.tsx`: table list (name, category, difficulty, published toggle, sort_order, edit, delete) — mirrors the pattern of `ToolsAdmin`
- New dialog `IntegrationFormDialog.tsx`: fields for all columns, logo upload to `integration-logos` bucket, publish switch, difficulty + category selects
- Register route in `App.tsx` under the `/admin` layout
- Add "Integrations" item to `AdminLayout.tsx` sidebar (Plug icon)

### 5. SEO

- Page `<title>` "Integrations for Real Estate AI — RealToolbox.ai"
- Meta description summarizing the integrations directory
- Single H1 ("Integrations")

### Technical notes

- `src/integrations/supabase/types.ts` regenerates automatically after the migration runs
- Category color map lives in the new card component (HSL tokens already in `index.css` palette)
- No detail pages, no new edge functions
- Difficulty + category validation enforced in the admin form (select inputs), not as DB check constraints, to keep future categories easy to add
