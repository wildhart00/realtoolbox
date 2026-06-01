## Refine Skills hero floating card cluster

Edit only `src/pages/SkillsPage.tsx` — the hero's right-column visual. No other files change. Card markup, copy, two-column layout, and `motion-safe:animate-float-slow` stay.

### 1. Restagger on a clean diagonal (no badge/title/button overlap)

Currently Card B sits at `top-[150px] left-[110px]` which overlaps Card A's badge and Download button. Each card is ~`w-[320px]` and ~210px tall.

New positions (back card upper-left, front card lower-right, overlap only at one corner):
- **Card A (back — Listing Description Writer):** `top-0 left-0`
- **Card B (front — Offer & Negotiation Strategist):** `top-[170px] left-[180px]`

This leaves Card A's badge/title/button fully visible above Card B, and Card B sits lower-right with only its top-left corner kissing Card A's bottom-right corner.

### 2. Scale to ~85% of grid-card size

Real grid cards are full width of a 3-col cell (~380px at 1200px container). 85% ≈ 272px.

- Both cards: change `w-[320px] p-[22px]` → `w-[272px] p-[18px]`
- Titles: `text-xl` → `text-[17px]`
- Tagline: `text-[14px]` → `text-[13px]`
- Download pill: `text-[13px] py-2 px-3.5` → `text-[12px] py-1.5 px-3`, icon `h-4 w-4` → `h-3.5 w-3.5`

### 3. Opposing tilts

- Card A: `-rotate-[4deg]` → `-rotate-[5deg]`
- Card B: `rotate-[3deg]` → `rotate-[4deg]`

### 4. Visible violet/indigo brand glow

Replace the single glow div with a stronger, larger, more visibly purple radial:

```tsx
<div
  aria-hidden
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             h-[520px] w-[520px] rounded-full blur-3xl
             bg-[radial-gradient(closest-side,hsl(265_84%_70%/0.55),hsl(229_94%_75%/0.30)_45%,transparent_75%)]"
/>
```

Bump container `h-[460px]` → `h-[500px]` so the glow has room and isn't clipped on top/bottom.

### 5. Prevent right-edge clipping

- Right column container: add `overflow-visible` and remove any `w-full` clipping. Verify Card B's right edge (`left-[180px] + 272px = 452px`) fits within the 45% column (~495px at 1200px container, minus gap). It does.
- Add `pr-2` safety padding on the cluster wrapper so the +4deg rotation doesn't push the corner past the column.
- Keep `pointer-events-none` on the cluster.

### Acceptance check (visual)

- Card A's badge, title, tagline, and Download button are all fully visible.
- Card B sits down-and-right of Card A, overlapping only at the corner.
- Purple glow is clearly visible behind both cards, soft-edged, not a hard shape.
- Nothing clips the right edge at `lg` (1024px) or `xl` (1280px).
- Float animation still applies to the cluster wrapper.
