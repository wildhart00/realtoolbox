# Performance audit — findings

I searched the codebase for `requestAnimationFrame`, `useFrame`, `setInterval`, `refetchInterval`, and every `animation:` / `@keyframes` / `animate-*` usage. **There are no JS RAF loops in this project.** The main-thread-busy behavior is caused entirely by CSS animations that never stop, plus one image-retry setTimeout that can re-fire indefinitely:

| # | Location | What's running forever |
|---|---|---|
| 1 | `src/components/tools/MeshGradientBanner.tsx` | 4 large blurred blobs (each `filter: blur(60px)`, `will-change: transform`) each with their own infinite `@keyframes` (19–26s). Rendered on every `/tools/:slug` page. Heavy compositor + main-thread paint each frame, never pauses even when scrolled off-screen. |
| 2 | `src/pages/SkillsPage.tsx` line 136 | `motion-safe:animate-float-slow` — infinite 5s transform loop on the hero card cluster. |
| 3 | `src/components/tools/ToolCard.tsx` lines 102–110 | mShots `onLoad` handler that `setTimeout(2500)` re-assigns `img.src` with a cache-buster whenever `naturalWidth < 50`. If the endpoint keeps returning the placeholder (as it does during warm-up), this retries **forever** per card — 12 cards on the home page can each be re-fetching every 2.5s indefinitely. Same pattern in `MeshGradientBanner.tsx` lines 88–96. |
| 4 | `src/App.css` `logo-spin` and `src/index.css` `pulse-dot` | Infinite CSS animations left over from the Vite template / earlier design. `logo-spin` targets `a:nth-of-type(2) .logo` (no matching DOM) and `.pulse-dot` isn't referenced anywhere. Dead CSS — safe to remove so it can't be re-introduced accidentally. |

React Query has no `refetchInterval`, no polling hooks elsewhere (only `WelcomePage`'s 3s post-checkout poll, which is intentional and short-lived). No framer-motion, no r3f `useFrame`.

# Fixes

## 1. `MeshGradientBanner.tsx` — gate the blob animation
- Wrap the animated blobs in a `useRef` + `IntersectionObserver` + `visibilitychange` hook (`useAnimationActive`, new file `src/hooks/useAnimationActive.ts`) that returns `true` only when the element is ≥10% visible **and** `document.visibilityState === "visible"` **and** `window.matchMedia("(prefers-reduced-motion: reduce)").matches === false`.
- When inactive, set each blob's inline `animationPlayState: "paused"` (keeps the last transform, no layout thrash) instead of unmounting.
- Cut blur cost: drop `filter: blur(60px)` to `blur(40px)` and remove `will-change: transform` (it forces a permanent GPU layer even when idle). Visual difference is negligible against the already-dark background.

## 2. `SkillsPage.tsx` float cluster
- Reuse the same `useAnimationActive` hook to toggle `animationPlayState` on the `animate-float-slow` container. Keeps the visual, drops the cost to zero when off-screen or the tab is hidden. `motion-safe:` already respects reduced-motion.

## 3. Cap image retry loops (`ToolCard.tsx`, `MeshGradientBanner.tsx`)
- Track retry count in a `useRef` (max **2 retries**, ~2.5s apart). After that, advance to the next fallback stage (`fallback` mesh art) instead of continuing to re-request. Attach an AbortController-style guard so unmounted cards don't re-fire.

## 4. Remove dead infinite CSS
- Delete `logo-spin` block and the `.card` / `.logo` / `.read-the-docs` rules in `src/App.css` (all Vite-template leftovers, not used).
- Delete the `pulse-dot` keyframes + class in `src/index.css` (unused).

## 5. Verify
Playwright script under `/tmp/browser/perf/`:
1. Load `/`, wait for `load`, then use `performance.getEntriesByType('longtask')` via `PerformanceObserver` for 3 seconds and assert no long tasks > 50ms after t+1500ms.
2. Repeat on `/tools/<slug>` (the MeshGradientBanner route).
3. Scroll banner off-screen and re-check — CPU idle should hold.
4. Screenshot both pages before/after to confirm the design is unchanged.

## Technical notes
- Compositor-friendly transforms still cost main-thread time because `filter: blur()` forces the browser to re-rasterize the blurred layer every frame at the animated scale. Pausing via `animationPlayState` is enough; we don't need to convert the animations away from CSS.
- All animations already respect `prefers-reduced-motion` after this change (MeshGradientBanner already had a `@media (prefers-reduced-motion: reduce)` rule; the new hook also honors it, so JS-driven pause and CSS-driven pause agree).
- No design tokens, colors, layouts, or copy change.

## Files touched
- **new** `src/hooks/useAnimationActive.ts`
- `src/components/tools/MeshGradientBanner.tsx`
- `src/components/tools/ToolCard.tsx`
- `src/pages/SkillsPage.tsx`
- `src/App.css`
- `src/index.css`
