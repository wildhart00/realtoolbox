## Homepage polish pass

Four scoped fixes. No new features, no design changes.

### 1. Investor Toolbox skill list copy
Replace the stale "deal analysis, underwriting, follow-up, KPIs" phrase everywhere it appears in user-facing surfaces with copy that reflects the actual 7 Investor Toolbox skills (buy box, deal screening, triage, input auditing, strategy selection, walk-away calls, full underwriting).

Files touched:
- `src/components/home/PricingSection.tsx` — Investor card description line (line 112). Complete card body already reads "Everything in Investor plus the Agent Toolbox" and doesn't repeat the stale list; leave as-is.
- `src/pages/SkillsPage.tsx` — meta description (line 75) and hero body copy (line 123): rewrite to the accurate 7-skill list.

`SkillsAnnouncementStrip.tsx` and `ChooseYourStageSection.tsx` mention "follow-up" / "KPI" but in the context of the *future Agent Toolbox* / stage-of-business narrative, not the Investor Toolbox contents. Leave those untouched.

### 2. Featured section adaptive layout
`src/components/home/FeaturedTabsSection.tsx` currently uses a fixed `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` which leaves large empty space with 1–2 cards. Change so the grid column count adapts to `list.length`:

- 1 card: single centered column, card capped at ~420px width, centered in the row.
- 2 cards: two-column centered pair on desktop, capped at ~840px total.
- 3–6 cards: current 3-up grid.

Implemented by choosing a `max-w` + `mx-auto` wrapper and column count based on `list.length`. Same treatment for `FeaturedSection.tsx` since it uses the identical grid.

### 3. Hero secondary CTA threshold
`src/components/home/Hero.tsx` line 41 currently renders `Browse the tool directory (${toolCount}) →` whenever `toolCount` is truthy. Change to render the count only when `toolCount >= 25`; below that show plain "Browse the tool directory →". Automatic — restores itself once the directory grows.

### 4. Category rail ordering + hide-empty
Two changes, both in the data layer so every surface (`BrowseSection` on home, `BrowsePage`, `CategoryPage` sidebar) benefits.

- **Ordering:** update `useCategories()` in `src/hooks/useDirectory.ts` to apply a client-side sort that puts real-estate-native categories first, then general-purpose ones, then everything else alphabetically. Uses an explicit priority list on category slug:

  ```text
  RE-native lead group (in order):
    deal-sourcing, deal-analysis, sales-marketing, listing-marketing,
    lead-generation, crm-pipeline, contracts-legal, commercial-real-estate,
    construction, property-management, customer-service, analytics-reporting,
    virtual-staging, interior-design, architectural-design, surveying
  General-purpose group (in order):
    image-generators, video-creation, 3d-modelling, chatbots, app-builders,
    website-builders, no-code-tools, ai-writers, copywriting,
    presentation-design, productivity, automation, research,
    machine-learning, phone-agents
  ```

  Any category not in either list falls to the end, sorted by name. Keeps the DB `sort_order` untouched.

- **Hide-empty on public surfaces:** the rail must exclude categories with zero published tools. Compute the counts from the `tools` prop already passed to `BrowseSection` and filter `categories` before handing to `CategoryRail`. Admin surfaces are untouched. On `CategoryPage`, all categories remain reachable by direct URL.

### Verification after build
- Homepage renders new copy on Investor card and skills hero.
- With current DB (7 published-covered categories), rail shows only those 7 in the new order; "All" remains first.
- Featured tab with 1 featured tool shows a single centered card, not a lopsided grid.
- Hero shows "Browse the tool directory →" (no number) because published count is ~7.

### Technical notes
- Category priority arrays live as a `const` in `useDirectory.ts` and are applied via `.sort()` with an index-based comparator.
- Hide-empty is derived in `BrowseSection` via `useMemo` counting `tools.flatMap(t => t.categories)`. No new query.
- Featured grid width caps use existing token spacing; no new tokens.
