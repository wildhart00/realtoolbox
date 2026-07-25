
## Goal

Two curated, editorial "Stack" pages that recommend real tools from the existing `tools` table, grouped by function, each with a first-person "Why this one" note and an affiliate CTA that routes through `/go/:slug` so clicks land in `click_events`. Fully admin-managed. Nothing seeded.

## Routes

- `/stacks/investor` — "The Investor Stack"
- `/stacks/agent` — "The Agent Stack"

## Database (one migration)

New enum + two tables in `public`:

- `stack_kind` enum: `investor`, `agent`.
- `stacks` (one row per stack, editable header content):
  - `kind stack_kind unique`, `title`, `subtitle`, `intro_md text`, `updated_at`.
  - Seeded on migration with the two rows (empty copy) so admin can just edit them.
- `stack_entries`:
  - `stack_kind`, `tool_id → tools.id`, `group_name text` (free text, admin-chosen from the six investor / five agent groups), `sort_order int`, `why_note text` (first-person blurb), timestamps.
  - Unique on `(stack_kind, tool_id)`.

Grants + RLS:
- `GRANT SELECT` to `anon` and `authenticated` on both tables (public read).
- Admin-only `INSERT/UPDATE/DELETE` via `has_role(auth.uid(), 'admin')`.
- `service_role` full.
- `updated_at` trigger reusing `public.update_updated_at_column()`.

## Public pages

New `src/pages/StackPage.tsx` used by both routes (kind from route). Uses `AppLayout`, existing tokens, and existing tool components.

Layout, top to bottom:
1. **Header block** — eyebrow ("The Investor Stack" / "The Agent Stack"), H1 from `stacks.title`, subtitle, short affiliate disclosure line rendered via new `<AffiliateDisclosure />` component.
2. **Intro paragraph** — markdown from `stacks.intro_md` (reuse the same lightweight md rendering already used on skill pages if available, else plain paragraph with line breaks).
3. **Function groups** — one section per non-empty group. Group order is fixed per stack (Investor: Deal Finding → Deal Analysis & Data → Skip Tracing & Outreach → CRM & Follow-Up → Project & Rehab Management → Back Office; Agent: CRM & Lead Gen → Listing Marketing → Transaction Management → Content & AI → Client Communication). Any group with zero entries is skipped. Within a group, entries render by `sort_order`.
4. **Tool card** — reuse existing `ToolCard` visuals via a thin `StackToolCard` wrapper that:
   - Shows logo + name + pricing badge (from `tools`).
   - CTA button linking to `/go/:slug` (opens in new tab, `rel="sponsored nofollow noopener"`).
   - Renders the `why_note` beneath the card body as a first-person quote block using existing typography tokens.
5. **Mid-page cross-promo band** — Investor page links to `/toolbox/investor`; Agent page opens the existing waitlist capture (`CaptureDialog` with the agent-toolbox source already used on `AgentToolboxPage`).
6. **Bottom email capture** — reuse `NewsletterCard` with a stack-specific `source` value.
7. **Footer disclosure** — full disclosure paragraph repeated once at bottom.

Empty state: if a stack has zero entries yet, show only the header/intro + cross-promo + newsletter, no group scaffolding.

## Reusable disclosure component

`src/components/affiliate/AffiliateDisclosure.tsx` — two variants:
- `inline` (short one-liner used at top of stack pages).
- `block` (boxed, slightly muted, for tool detail pages and stack page bottom).

Copy: "Some links are affiliate links — if you buy through them, RealToolbox earns a commission at no cost to you. Recommendations are based on real operator use, not commission rates."

Add the `block` variant to `ToolDetailPage` above the primary CTA area so it's site-wide available for tool pages as requested.

## Admin

New sidebar entry "Stacks" in `AdminLayout` (icon: `Layers`), routed at `/admin/stacks`.

`src/pages/admin/StacksAdmin.tsx`:
- Tabs: "Investor Stack" / "Agent Stack".
- Per tab:
  - Editable header form: `title`, `subtitle`, `intro_md` (textarea) with Save button.
  - Entries table grouped by `group_name`, sorted by `sort_order`:
    - Columns: drag handle / order number, tool (logo + name), group (select from the fixed list for that stack), why_note (textarea, inline edit), actions (edit / remove).
    - "Add tool" button opens a dialog with a searchable `tools` picker (reuse the same query pattern as existing admin), group select, why_note textarea, initial sort_order.
  - Order handled with simple up/down buttons or numeric input to keep it lightweight (no dnd dependency).

All writes go through the supabase client using admin RLS.

## Navigation and cross-links

- `Topbar.tsx`: add "Stacks" between "Toolbox" and "Browse Tools" on desktop, and in the mobile menu.
- `Footer.tsx`: add "Stacks" to the Directory column at the top of the list.
- Homepage directory section (`BrowseSection` area on `Index.tsx`): add a slim two-card strip above or below the tool grid linking to `/stacks/investor` and `/stacks/agent` with one-line pitches. Uses existing card tokens; no new design language.
- `ToolboxIndexPage` already links to toolboxes; no change needed there.

## SEO

Per-route head via `react-helmet-async` (install if not already present; check `main.tsx` for `HelmetProvider` and add it if missing):
- `/stacks/investor`: title "The Best Real Estate Investor Tool Stack (2026) — RealToolbox", description operator-voiced summary.
- `/stacks/agent`: title "The Best Real Estate Agent Tool Stack (2026) — RealToolbox".
- Canonical + `og:url` self-referencing each route on `https://realtoolbox.ai`.
- JSON-LD `ItemList` built from the visible entries (name, url = tool website, position).

Sitemap: project currently has no sitemap. Create `scripts/generate-sitemap.ts` per the sitemap knowledge, wired via `predev` / `prebuild` npm scripts, with `BASE_URL = "https://realtoolbox.ai"`, listing the existing public routes plus `/stacks/investor` and `/stacks/agent`. No `<lastmod>` (no authoritative per-page timestamp source).

## Click tracking

Existing `/go/:slug` `GoRedirectPage` already writes to `click_events`. The stack CTA points there — no changes needed to redirect logic. Add a query param like `?ref=stack-investor` / `?ref=stack-agent` so admin can filter later; `GoRedirectPage` will pass through unchanged.

## Files touched

New:
- `supabase/migrations/<ts>_stacks.sql` (via migration tool)
- `src/pages/StackPage.tsx`
- `src/pages/admin/StacksAdmin.tsx`
- `src/pages/admin/StackEntryDialog.tsx`
- `src/components/stacks/StackToolCard.tsx`
- `src/components/stacks/StacksHomeStrip.tsx`
- `src/components/affiliate/AffiliateDisclosure.tsx`
- `scripts/generate-sitemap.ts`

Modified:
- `src/App.tsx` — add `/stacks/investor`, `/stacks/agent`, `/admin/stacks` routes.
- `src/components/admin/AdminLayout.tsx` — add Stacks nav item.
- `src/components/layout/Topbar.tsx` — add Stacks link (desktop + mobile).
- `src/components/layout/Footer.tsx` — add Stacks to Directory column.
- `src/pages/Index.tsx` — insert `StacksHomeStrip` in the directory section.
- `src/pages/ToolDetailPage.tsx` — mount `<AffiliateDisclosure variant="block" />`.
- `src/main.tsx` — add `HelmetProvider` if not present.
- `package.json` — `predev` / `prebuild` script for sitemap.

## How you'll populate stacks after this ships

1. Sign in as admin → `/admin/stacks`.
2. Pick the "Investor Stack" tab. Edit title / subtitle / intro paragraph, Save.
3. Click "Add tool", search a tool from the directory, pick a group (Deal Finding, Deal Analysis & Data, etc.), write the first-person "Why this one" note, set order, Save.
4. Repeat for each recommendation. Reorder via the arrow buttons or the order number field.
5. Switch to "Agent Stack" tab and repeat with the agent function groups.
6. Public pages update immediately — empty groups stay hidden until you add entries.

No entries are seeded — the pages render header + cross-promo + newsletter until you add tools.
