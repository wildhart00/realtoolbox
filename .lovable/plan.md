## Goal
Slim the homepage down to Featured/Just Launched tabs only and move the full category-sidebar + tool-grid directory experience to a dedicated `/browse` page. Wire search + nav to it. Make `/category/:slug` and `/specialty/:slug` share the same browse layout.

## Changes

### 1. New `/browse` page — `src/pages/BrowsePage.tsx`
Reuses the existing `BrowseSection` component (which already contains `CategoryRail` + `ToolGrid` + count + sort dropdown — exactly the layout that lives on the homepage today).

- Loads `useTools()` + `useCategories()`.
- Reads `?q=` from the URL on mount and pushes it into `SearchContext` (so the existing search bar + `BrowseSection` filter logic just work).
- Reads `?cat=` (optional) to pre-select a category in the rail.
- Page header: small `BROWSE` eyebrow + h1 "All tools" + dynamic count subline.
- Renders `<BrowseSection tools={tools} categories={categories} />` wrapped in `AppLayout`.

Minor enhancement to `BrowseSection`:
- Accept an optional `initialCategory` prop and an optional `lockCategory` prop (used by `/category/:slug` and `/specialty/:slug` to hide the rail and pre-filter).
- Add a "Newest first" option (currently has "Most relevant / Newest / A–Z" — already covered, just rename label to "Newest first").
- Default sort becomes `newest` when no search query is active (per spec "ordered by created_at desc"); falls back to relevance when a query is present.

### 2. Homepage cleanup — `src/pages/Index.tsx`
Remove `<BrowseSection />` and the divider above it. Remove the unused `useTools`/`useCategories` calls (keep `useTools().length` only if Hero still needs the count — it does, so keep `useTools()` for the count).

Final order: Hero → FeaturedTabsSection → BrowseByTagSection → BuiltForSpecialtySection → SkillsAnnouncementStrip → NewsletterCard.

### 3. Homepage search bar — `src/components/home/Hero.tsx`
Change the input from a controlled `SearchContext` input to a local-state input with an `onSubmit` (wrap in `<form>`) that calls `navigate('/browse?q=' + encodeURIComponent(query))`. Pressing Enter or clicking the search icon navigates.

### 4. Routing — `src/App.tsx`
Add `<Route path="/browse" element={<BrowsePage />} />`.

### 5. Nav link — `src/components/layout/Topbar.tsx`
Change `{ name: "Browse", href: "/" }` → `{ name: "Browse", href: "/browse" }`. Update `handleHomeClick` usage so it no longer applies to the Browse link (only the logo). Active-state logic updated to highlight Browse on `/browse`, `/category/*`, and `/specialty/*`.

### 6. Category & Specialty pages share browse layout
- `src/pages/CategoryPage.tsx`: replace the current bespoke grid with `<BrowseSection tools={allTools} categories={categories} initialCategory={slug} lockCategory />` so the rail is hidden and only that category's tools are shown — keeps sort dropdown, count, search filtering, and the screenshot card design consistent. Keeps the existing page header (category name + count).
- `src/pages/SpecialtyPage.tsx`: same pattern but pre-filters the `tools` prop by tag before passing in, and passes `lockCategory` to hide the rail. Sort dropdown + count remain.

### 7. Verification
After build:
- `/` shows only: Hero, Featured tabs, Browse by Tag, Built for Specialty, Skills strip, Newsletter.
- `/browse` shows full directory with sidebar, all 60 tools by default.
- `/browse?q=foo` lands with the search prefilled and filtered.
- Sidebar category clicks update grid without route change.
- `/category/automation` shows only automation tools with the same card design.
- `/specialty/investors` shows only investor-tagged tools with the same card design.
- Nav "Browse" link goes to `/browse` and is highlighted on `/browse`, `/category/*`, `/specialty/*`.
- Mobile: rail becomes horizontal pill row (already handled by `CategoryRail`).

## Out of scope
- Moving newsletter into footer (explicitly deferred).
- Re-tagging tools.
- Changing `ToolCard`, `BrowseByTagSection`, `BuiltForSpecialtySection`, or `FeaturedTabsSection`.
