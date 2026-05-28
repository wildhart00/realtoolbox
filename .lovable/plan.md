## Animated mesh gradient banner

Replace the current radial+linear gradient on the tool detail banner with a slow, looping multi-blob mesh gradient. Each blob is colored from the tool's brand color + a complementary hue, so every tool feels unique. The logo sits centered on a frosted-glass card to pop against the motion behind it.

### What changes

1. **`src/lib/brandColor.ts`** — add a helper alongside `getBrandColor`:
   - `getBrandPalette(domain)` returns `{ base, complement, accent }` (3 hex colors). Complement = hue + 180°, accent = hue + 40°, both kept in the 70–90% sat / 50–65% light range.

2. **New component `src/components/tools/MeshGradientBanner.tsx`**:
   - 200px tall, `rounded-2xl`, `overflow-hidden`, `relative`.
   - 4 absolutely-positioned blurred blobs (`filter: blur(60px)`, `opacity` ~0.7) using the 3 palette colors + a dark anchor.
   - Each blob animates `translate` + `scale` on its own offset keyframe loop (18–26s, `ease-in-out`, infinite) so the gradient drifts continuously without jank.
   - A faint SVG grid overlay (kept from current design) and a subtle dark vignette at the bottom edge for legibility.
   - Children slot: renders the centered frosted-glass logo card (`bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl`) holding `<ToolLogo size={96}>`.
   - Keyframes defined inline via a `<style>` tag scoped to the component (unique animation names) — avoids touching the global Tailwind config.
   - `prefers-reduced-motion`: blobs become static (no animation) but still rendered.

3. **`src/pages/ToolDetailPage.tsx`**:
   - Swap the existing banner block (the `radial-gradient` + `linear-gradient` div and the inline logo card) for `<MeshGradientBanner domain={toolDomain} tool={tool} />`.
   - Keep the title/tagline/badges row underneath exactly as it is now.

### Visual feel

- Slow, premium drift — think Linear/Vercel/Stripe marketing banners, not a lava lamp.
- Brand color clearly dominant; complement adds depth so it never looks like a flat wash.
- Logo card stays crisp and readable on every tool.

### Out of scope

- No external screenshot APIs, no canvas/WebGL.
- No changes to `banner_color` in the database — color still derived from `getBrandColor(domain)`.
- No changes to other pages or the tool card grid.
