# Tool Detail Page Refresh

## 1. Website screenshot in banner (`MeshGradientBanner.tsx`)

Replace the centered logo over the mesh gradient with a layout that mirrors your reference: gradient stays as ambient background, but a real **screenshot of the tool's website** sits in front as a framed browser-style card.

- Source the screenshot from a free, no-key thumbnail service: **WordPress mShots** (`https://s.wordpress.com/mshots/v1/{encoded-url}?w=1600&h=900`). It's CORS-free, reliably caches, and used widely for this exact pattern. Fallback to the current logo-only design if the image fails to load (`onError` handler).
- Frame: rounded-xl, subtle white "browser chrome" bar with three traffic-light dots, drop shadow, soft border. Logo + tool name chip overlays the bottom-left corner of the screenshot so brand identity stays visible.
- Bump banner height from `200px` → `320px` desktop / `220px` mobile so the screenshot reads at a glance.
- Keep mesh gradient blobs + grid behind the screenshot card for depth.
- `loading="lazy"`, explicit width/height to avoid CLS.

## 2. Reorder + compress detail page (`ToolDetailPage.tsx`)

Goal: get the most important info (tagline, CTA, **use cases**) above the fold on a typical 1366×768 desktop and a 390×844 phone.

New section order in the main column:
1. About {tool.name}  *(kept, trimmed visual weight)*
2. **Real estate use cases**  ← moved up
3. **Key features & benefits**  ← moved below use cases
4. Reviews
5. Related tools

Above-the-fold tightening:
- Reduce banner-to-title spacing (`pt-6 pb-5` → `pt-4 pb-3`).
- Tighten body section top padding (`py-10 lg:py-12` → `py-6 lg:py-8`).
- Trim the About block's bottom margin and cap visible paragraphs (show first paragraph at full size; subsequent paragraphs render but with tighter leading) so the use-cases header pulls up.
- Use-cases list: reduce vertical gap between items (`space-y-3.5` → `space-y-2.5`) and slim the number badge.

Mobile order stays identical (single column already stacks About → Use cases → Features), so the same reorder benefits both breakpoints. The sidebar continues to render below content on mobile.

## Files touched
- `src/components/tools/MeshGradientBanner.tsx` — add screenshot layer + browser frame, keep gradient fallback.
- `src/pages/ToolDetailPage.tsx` — swap order of Features / Use cases sections, tighten spacing.

## Technical notes
- mShots URL pattern: `https://s.wordpress.com/mshots/v1/${encodeURIComponent('https://' + domain)}?w=1600&h=900`. First request may return a placeholder while WP generates the shot — handle via `onLoad` + `naturalWidth < 50` retry once after 2s, then fall back to logo-only banner.
- No DB or types changes. No new dependencies.
