## Homepage reorder + Skills-forward update

Keep all current styling, colors, fonts, nav, and footer untouched. Only changes below.

### 1. `src/pages/Index.tsx` — new section order

Reorder to: Hero → Skills (banner + cards) → Built for your specialty → Browse by tag → Featured this week → Footer (via AppLayout).

Replace `FeaturedTabsSection` usage with a new `FeaturedSection` (featured-only, no tabs). Replace `SkillsAnnouncementStrip` import with new `SkillsHomeSection`.

### 2. `src/components/home/Hero.tsx` — copy change

Replace the credibility paragraph text with:
"Built by a real estate operator with 12 years and hundreds of deals behind him — not a tech company, not a content creator."

No layout or style changes.

### 3. New `src/components/home/SkillsHomeSection.tsx`

- Renders the existing purple "Real estate skills for any AI — now live" banner (copied verbatim from `SkillsAnnouncementStrip`, keeping its gradient, glow blobs, badge, headline, body, and "Browse the skills" button).
- Below the banner, query published skills using the same Supabase call the Skills page uses:
  ```
  supabase.from("skills").select("id, name, slug, tagline, audience, file_url, access_level, price")
    .eq("is_published", true).order("sort_order").limit(4)
  ```
  (Use `useQuery` from `@tanstack/react-query` for caching consistency with the rest of the homepage.)
- Render up to 4 cards using the existing `SkillPreviewCard` component (same name, tagline, audience badge, download button + dialog as the Skills page — no visual divergence).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`, same max-width container as the banner (`max-w-[1200px]`, `px-6 lg:px-10`).
- Below the cards, a right-aligned `"Browse all skills →"` link to `/skills` using the muted small-link style already used elsewhere on the homepage (e.g. matches `BrowseByTagSection`'s "View all →").
- Hide the cards row gracefully when none are published yet (just show the banner + link), and show nothing extra while loading (no skeleton needed — keep it quiet).

### 4. New `src/components/home/FeaturedSection.tsx`

- Drop-in replacement for `FeaturedTabsSection` but **featured-only**, no tab switcher, no "Just launched".
- Section label: small uppercase eyebrow "Featured This Week" (match the visual weight of the current active tab — same `text-[12px] uppercase tracking-[0.1em] font-semibold` foreground color, with the same gradient underline accent below it for continuity).
- Renders up to 6 `ToolCard`s in the same `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` grid.
- Same `EmptyState` ("Curating now — check back this week.") when empty.
- `useJustLaunchedTools` is no longer called from the homepage.

### 5. No changes to

- `BuiltForSpecialtySection`, `BrowseByTagSection`, `Topbar`, `Footer`, `AppLayout`.
- `SkillsAnnouncementStrip.tsx` and `FeaturedTabsSection.tsx` files can stay in the repo unused (no deletions needed; safer to leave in case other pages reference them — verified Index is the only caller, but leaving them avoids surprise breakage).
- No database, RLS, or types changes — published skills are already publicly readable.

### Result

Homepage flow becomes: hero → live free skills (banner + 4 cards) → audience cards → tag grid → featured tools → footer. Dark theme, fonts, and color tokens unchanged.
