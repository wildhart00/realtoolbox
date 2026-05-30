## Goal
Replace `/resources` ComingSoon stub with a full directory page that reads from the `resources` Supabase table, filterable by type, with an empty state and a newsletter callout.

## Files

### New: `src/pages/ResourcesPage.tsx`
Wrapped in `AppLayout`, centered `max-w-[1200px]`. Sections:

1. **Hero**
   - Eyebrow chip: "RESOURCES"
   - H1 (`font-display`, 5–6xl, tracking-tight): "Tools for the serious real estate operator" — gradient accent on the last 2–3 words
   - Sub (`text-muted-foreground`, lg, max-w-3xl): supplied verbatim

2. **Filter row**
   - Pill buttons in a single flex-wrap row: `All · Guides · Prompt Libraries · Templates · Downloads · Videos`
   - Active pill: `bg-foreground text-background`; inactive: `bg-foreground/[0.04] border border-foreground/10 text-foreground/70 hover:bg-foreground/[0.08]`
   - Selection drives client-side filter on the fetched array (no refetch per click)

3. **Card grid**
   - `md:grid-cols-2 lg:grid-cols-3` (4-col at xl optional — keep 3 to match the rest of the site)
   - Loading: 6 skeleton cards (rounded-2xl, animated bg)
   - Empty state (no rows OR filter result empty):
     - Friendly card spanning full grid width: copy supplied verbatim, primary button "Subscribe to newsletter" → `Link to="/#newsletter"` (anchor to homepage newsletter section)
     - For filter-with-no-matches case, use a lighter variant: "No {type} yet — check back soon." with a "Clear filter" button

4. **Bottom callout**
   - Single featured callout: "Get resource drop alerts" / "Be the first to know when a new guide, template or prompt pack ships." / button → `/#newsletter`
   - Same visual treatment as the MCPs/Agents bottom callout (rounded-2xl, gradient border highlight)

### New: `src/components/resources/ResourceCard.tsx`
Props: `resource: ResourceRow`. Layout:
- Top: type badge (color-coded, see below) on its own row
- Title (`font-display`, text-xl, semibold, tracking-tight, line-clamp-2)
- Description (`text-[14px] text-muted-foreground leading-[1.6] line-clamp-3 min-h-[66px]`)
- Footer pinned to bottom: access badge on the left, CTA button on the right
- Optional `cover_image_url` rendered as a 16:9 image at top with `object-cover rounded-t-2xl`; if absent, render a subtle gradient banner using `bg-gradient-to-br from-foreground/[0.08] to-foreground/[0.02]` with the type icon centered

Type badge styles + labels + icons (Lucide):
- `guide` → "Guide" — `bg-accent/12 text-[hsl(229_94%_82%)] border-accent/25` — `BookOpen`
- `prompt-library` → "Prompt Library" — `bg-[hsl(265_84%_75%)/0.12] text-[hsl(265_84%_82%)] border-[hsl(265_84%_75%)/0.25]` — `Sparkles`
- `template` → "Template" — `bg-success/15 text-success border-success/25` — `FileText`
- `video` → "Video" — `bg-orange-400/12 text-orange-300 border-orange-400/25` — `Video`
- `download` → "Download" — `bg-yellow-400/12 text-yellow-300 border-yellow-400/25` — `Download`

Access badge styles + labels:
- `free` → "Free" — `bg-success/15 text-success border-success/25`
- `email-gated` → "Free with email" — `bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25`
- `premium` → "Premium" — `bg-foreground/[0.06] text-foreground/70 border-foreground/15`

CTA button (right-aligned in footer, uses existing `Button` component variants):
- `free` → label "Download", `variant="default"`, links external `file_url` (target=_blank, rel=noreferrer). If `file_url` is null, disabled with title "Coming soon".
- `email-gated` → label "Get with email", `variant="outline"`. For now, links to `/#newsletter` (form integration out of scope for this send).
- `premium` → label "Unlock", `variant="hero"`, links to `/#newsletter` as the conversion path (member/paywall flow not built yet).

### Data fetch
Inside `ResourcesPage`, use `@tanstack/react-query` (already in `App.tsx`):
```ts
useQuery({
  queryKey: ["resources", "published"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, slug, type, description, access_level, file_url, cover_image_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
```
Client-side filter by `type` based on the active pill. No RLS changes needed — existing policy already allows public SELECT where `is_published = true`.

### Routing: `src/App.tsx`
- `import ResourcesPage from "./pages/ResourcesPage.tsx"`
- Replace `/resources` route element from `<ComingSoonPage />` to `<ResourcesPage />`

### SEO
`useEffect` sets `document.title` to "Resources for Real Estate Pros — RealToolbox.ai" and meta description.

## Technical notes
- Newsletter anchor: the homepage already has a NewsletterCard section. Link target uses hash `/#newsletter`. Verify the existing section has `id="newsletter"`; if it doesn't, add the id to the section wrapper in `src/pages/Index.tsx` (or the NewsletterCard's parent). This is a one-line change and within scope.
- All colors via existing tokens. The purple `[hsl(265_84%_75%)]` is already used on MCPs/Agents pages.
- The `resources` table type is already in `src/integrations/supabase/types.ts` (regenerated after the foundation migration). Use the generated `Row` type if available.

## Out of scope
- No actual email-gating flow (the "Get with email" CTA points at newsletter for now)
- No premium paywall / Stripe — "Unlock" routes to newsletter signup
- No per-resource detail page; cards link to `file_url` directly or to newsletter
- No admin UI for managing resources in this send
