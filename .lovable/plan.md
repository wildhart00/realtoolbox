## Goal

Make every tool card logo look as crisp as Bardeen's — no more dim, washed-out marks on the dark cards.

## Why the current logos look bad

- ReSimpli/ListedKit's `logo_url` came from Firecrawl branding, which sometimes returns a small/transparent dark mark.
- `ToolLogo` tries `customUrl` first, then Clearbit, then a tiny Google favicon. If the custom URL "loads" (even badly), Clearbit never gets a chance.
- All logos render directly on the dark card background, so dark-on-transparent logos disappear.

## Changes

### 1. Smarter logo source order (`src/components/tools/ToolLogo.tsx`)

New priority:
1. `customUrl` (only if it looks like a real brand asset — not a 16/32px favicon)
2. `https://logo.clearbit.com/{domain}` — best square brand icons
3. `https://{domain}/apple-touch-icon.png` — usually 180px, full-color app icon
4. `https://www.google.com/s2/favicons?domain={domain}&sz=128`
5. Letter initial fallback

Heuristic for "skip customUrl": URL contains `favicon`, ends in `.ico`, or query/path indicates ≤32px.

### 2. Light tile background for logos that need it

Wrap the `<img>` so dark/transparent logos sit on a subtle white tile (like an iOS app icon):

- Default tile: `bg-white/95` with a tiny inner shadow, same rounded radius as today.
- Applied to ALL logos by default — Bardeen-style colorful icons still look great on white, and dark monochrome logos finally pop.
- Keeps the existing outer border so it matches the card aesthetic.

### 3. Quick Add edge function tweak (`supabase/functions/quick-add-tool/index.ts`)

When Firecrawl's `branding.images.logo` is missing or obviously a favicon, fall back in this order before returning `logo_url`:
1. `branding.images.logo`
2. `branding.logo`
3. `branding.images.ogImage` (often a full brand graphic)
4. `null` → let `ToolLogo` resolve via Clearbit/apple-touch-icon at render time

## Files touched

- `src/components/tools/ToolLogo.tsx` — reorder sources, add favicon heuristic, add light tile.
- `supabase/functions/quick-add-tool/index.ts` — better logo selection fallback.

## Out of scope

- No manual logo upload field (can add later if needed).
- No changes to ToolCard/FeaturedStrip layout — fix is contained to the logo component.

## Verification

- Refresh the home page and confirm ReSimpli, ListedKit, and other previously-dim logos now render clearly on a light tile.
- Bardeen and other already-good logos should still look great (just on a white tile instead of dark).
