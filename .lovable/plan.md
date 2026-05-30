## 1. Data layer — `src/hooks/useDirectory.ts`

Add `useJustLaunchedTools()` mirroring `useFeaturedTools()`:

```ts
.eq("status", "published")
.eq("is_just_launched", true)
.order("just_launched_date", { ascending: false })
.limit(6)
```

Keep `useFeaturedTools()` exactly as-is.

## 2. Types — `src/lib/types.ts`

Add to `Tool`:
- `screenshot_url: string | null`
- `is_just_launched: boolean`
- `just_launched_date: string | null`

## 3. Replace `FeaturedStrip` with `FeaturedTabsSection`

New file `src/components/home/FeaturedTabsSection.tsx`, takes `featured` + `justLaunched`. Same outer container (`max-w-[1100px]`, current px/py).

Header becomes a tab row:

```
┌─────────────────────────────────────────────┐
│ ✨ Featured This Week   🚀 Just Launched   │  ← buttons
│ ──────────                                  │  ← gradient underline under active
└─────────────────────────────────────────────┘
```

- Buttons: `text-[13px] font-semibold uppercase tracking-[0.08em]`, active = `text-foreground` with a 2px gradient underline (`bg-gradient-to-r from-[hsl(239_84%_67%)] to-[hsl(265_84%_67%)]`), inactive = `text-foreground/50 hover:text-foreground/80`.
- Underline is an absolutely-positioned `<span>` per button with smooth `transition-all`.
- No pill, no background — clean text tabs.
- Grid below: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` of `ToolCard` (the upgraded one), limit 6.
- Empty state per tab: centered text card with `"Curating now — check back this week."`

Delete `FeaturedStrip` usage in `Index.tsx`, swap in `<FeaturedTabsSection featured={featured} justLaunched={justLaunched} />`. Drop the old "View all →" link (replaced by tabs).

`FeaturedStrip.tsx` can be deleted (no other consumers — confirmed via grep earlier in the session via the codebase listing; I'll re-grep before deleting to be safe).

## 4. `ToolCard` redesign — `src/components/tools/ToolCard.tsx`

New layout (card padding removed from outer, kept on lower content area so screenshot bleeds to edges):

```
┌───────────────────────────────┐
│                               │
│       SCREENSHOT 16:9         │  rounded-t-2xl, overflow-hidden
│   ░░░ dark gradient bottom ░░ │  pointer-events-none overlay
├───────────────────────────────┤
│ ◐ Logo  Name        [Pricing] │  px-5 pt-4
│ Two-line description…         │  px-5
│ #tag #tag #tag                │  px-5 pb-5
└───────────────────────────────┘
```

Screenshot resolution + fallback handled by a new tiny subcomponent `<ToolScreenshot tool={tool} />`:

```ts
const [stage, setStage] = useState<'screenshot'|'hero'|'mshots'|'fallback'>(
  tool.screenshot_url ? 'screenshot' : tool.hero_image_url ? 'hero' : 'mshots'
);

const src =
  stage === 'screenshot' ? tool.screenshot_url! :
  stage === 'hero'       ? tool.hero_image_url! :
  stage === 'mshots'     ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(tool.website_url)}?w=1280&h=720` :
  null;

// onError: advance to next stage; eventually 'fallback' renders a gradient-blob
// logo banner reusing the same colors as MeshGradientBanner (simplified, no screenshot inset).
```

mshots quirk: an `onLoad` that detects `naturalWidth < 50` (placeholder) advances to `fallback` after a short retry (same pattern as `MeshGradientBanner`).

Fallback gradient: uses `getBrandPalette(domainFromUrl(tool.website_url))` to render two blurred blobs + centered logo — visually consistent with existing detail page banner but card-sized.

Dark overlay: `<div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0b0f]/85 to-transparent pointer-events-none" />` inside the screenshot frame.

Card outer: `group rounded-2xl overflow-hidden surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base` (existing hover preserved).

Logo: drops from 40px → 32px, sits inline with name + `PricingBadge` (right-aligned via `ml-auto`). Category label stays under the name. Tags row stays the same.

## 5. Where it lands

`ToolCard` is used by `ToolGrid`, which is the only consumer (homepage browse, category pages, search). The new `FeaturedTabsSection` will also use `ToolCard` directly (3-up grid). One change ripples everywhere — no per-page edits needed.

I'll verify via `rg "ToolCard"` before editing, and confirm no page passes a `compact` variant that would break with a taller card.

## 6. Out of scope

- No DB migration (columns already exist).
- No admin changes.
- `FeaturedStrip.tsx` deletion only after grep confirms no remaining imports.

## Order of execution

1. `rg` to confirm ToolCard / FeaturedStrip consumers.
2. Update `types.ts`.
3. Add `useJustLaunchedTools` in `useDirectory.ts`.
4. Rewrite `ToolCard.tsx` + new `ToolScreenshot` subcomponent (inline in same file).
5. Create `FeaturedTabsSection.tsx`, wire into `Index.tsx`, delete `FeaturedStrip.tsx`.
6. Visual QA in preview.
