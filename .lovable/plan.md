# RealToolbox.ai — Full Redesign Plan

Frontend rebuild only for visuals/layout. Backend stays on Lovable Cloud; a few **additive** migrations are needed because the spec references fields/tables that don't exist yet. No existing tables, RLS, auth, or buckets are dropped or renamed.

## Schema gap → additive migration

Spec assumes fields the current schema doesn't have. Proposed additions (nothing destructive):

- `tools`: add `affiliate_url text`, `banner_color text default '#1a1f2e'`, `featured_order int default 0`, `re_only boolean default true`, `tags text[] default '{}'`, `status text default 'published'` (so we can filter; existing rows default to published)
- New table `click_events` (tool_id, tool_slug, referrer, user_agent, created_at) — public insert, admin select
- New table `newsletter_subscribers` (email unique, source, created_at) — public insert, admin select
- Reuse existing `pending_tools` for the Submit form (no new table needed; maps cleanly)
- Reuse existing `reviews` table for tool reviews
- Keep `is_featured` as the source of truth for "Featured this week"; add `featured_order` for ordering

Removed from UI only (data kept): `is_verified`, `is_editors_pick`, Members Hub, pay-to-list/`wants_featured`.

## Design system overhaul

Rewrite `src/index.css` tokens + `tailwind.config.ts`:

- Dark-only. Drop `.dark` toggle, set dark values as `:root`.
- Tokens: `--background 0a0b0f`, foreground/muted/tertiary per spec, indigo accent gradient `#6366f1 → #8b5cf6`, success `#34d399`, card/border alphas per spec.
- Fonts: load Fraunces (display) + DM Sans (body) via Google Fonts in `index.html`; map to `font-display` / `font-sans` in Tailwind.
- Utilities: `bg-grain` (SVG noise data URI), `glow-indigo` / `glow-teal` ambient orbs, `bg-gradient-accent`.
- All Tailwind classes use semantic tokens — no hex in components.

## Routing

Keep `BrowserRouter` structure. Final routes:

```
/                    new Home (hero + featured + browse + newsletter)
/tools/:slug         new Tool Detail
/category/:slug      reuses Home browse, pre-filtered
/blog, /blog/:slug   kept as-is visually retokenized
/submit              redesigned Submit form
/auth, /reset-password  retokenized only
/go/:slug            NEW — logs click_event, redirects to affiliate_url||website_url
```

Remove `/members` route + nav link + footer link.

## Components to build / replace

```
src/components/
  layout/
    Topbar.tsx           rebuilt: logo + center nav (Browse·MCPs·Skills·Blog·Newsletter)
                         + green pulse "Updated weekly" + Submit button
    Footer.tsx           rebuilt: 3-col, no Members Hub
    AppLayout.tsx        drop CategorySidebar (sidebar lives inside Home only)
    AmbientBackground.tsx NEW: two glow orbs + grain overlay
  home/
    Hero.tsx             pill badge + Fraunces H1 w/ italic line + search
    FeaturedStrip.tsx    3-col compact cards, pulls is_featured ordered by featured_order
    BrowseSection.tsx    172px CategoryRail + ToolGrid + sort dropdown
    CategoryRail.tsx     dynamic from categories table
    NewsletterCard.tsx   KIT-style; writes newsletter_subscribers w/ source='homepage'
  tools/
    ToolCard.tsx         rebuilt to spec (logo via Clearbit, fallbacks, pricing chip)
    ToolGrid.tsx         auto-fill minmax(248px), 14px gap, empty state
    PricingBadge.tsx     free/freemium/paid variants
    ToolLogo.tsx         Clearbit → Google favicon → initial fallback
  detail/
    ToolHeroBanner.tsx   200px gradient banner, grid overlay, floating logo
    ToolTitleRow.tsx     title + tagline + chips + Visit Website CTA → /go/:slug
    AboutSection.tsx     Fraunces H2 + paragraphs from description
    FeaturesList.tsx     green-check cards
    UseCasesList.tsx     numbered indigo gradient circles
    ReviewsSection.tsx   list + empty state + write-review (auth gated)
    RelatedTools.tsx     3-col same-category
    DetailSidebar.tsx    sticky 220px info card
  submit/
    SubmitForm.tsx       writes pending_tools
```

## Data layer

- `src/hooks/useDirectory.ts`: extend with `useFeaturedTools()`, `useToolBySlug()`, `useRelatedTools()`, `useCategoriesFromTools()`. Filter all reads by `status='published'`.
- Search: client-side filter across name/tagline/description/category/tags (existing SearchProvider).
- `/go/:slug` page: insert into `click_events` then `window.location.replace`.

## Logo strategy

`ToolLogo` component:
1. If `tool.logo_url` present → use it
2. Else `https://logo.clearbit.com/${domain}` (derive domain from `website_url`)
3. `onError` → Google favicons `sz=128`
4. Final `onError` → initial-letter tile (existing gradient util)

## Newsletter wiring

Default: insert into new `newsletter_subscribers` table with `source='homepage'`. If user later provides a KIT form ID, swap to KIT embed — leaving a `// TODO: KIT form id` marker. (Will confirm with user during build if they want KIT now.)

## Out of scope / explicitly NOT changing

- Supabase client file, auth flow logic, storage buckets, existing RLS
- Blog content/schema
- Admin tooling

## Review checkpoint

After build: deliver Home (`/`) and Bardeen detail (`/tools/bardeen`) for review before any polish pass. (Assumes a Bardeen row exists; if not, I'll seed one via `supabase--insert` using data from the attached `realtoolbox-v4.jsx`.)

## Open questions before I build

1. **Seed data**: should I import the tool list from `realtoolbox-v4.jsx` into the `tools` table so the redesign has real content? (Otherwise the new UI will render whatever is currently in the DB, which may be sparse.)
2. **Newsletter**: use the new `newsletter_subscribers` table now, or do you want to paste a KIT form/embed code so I wire directly to Kit.com?
3. **Auth pages + Blog**: retokenize to dark only (quick), or leave styling untouched this pass?
