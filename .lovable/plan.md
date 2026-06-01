
## Skills hero — add right-side floating card visual

Pure presentation change in `src/pages/SkillsPage.tsx` plus one tiny keyframe addition in `tailwind.config.ts`. No copy, data, or business-logic changes.

### 1. Hero becomes a two-column row on `lg+`

In `SkillsPage.tsx`, wrap the existing hero contents in a grid:

- Outer hero `<section>` keeps `mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-16`, and gains `lg:min-h-[640px]` so the floating cluster never gets clipped.
- New inner wrapper: `grid gap-12 lg:grid-cols-[55fr_45fr] lg:items-center`.
- Left column: the existing `max-w-3xl` text block (badge + h1 + subhead) — unchanged copy. Drop `max-w-3xl` on `lg+` so it can breathe inside its 55% column; keep `max-w-2xl` on mobile.
- Right column: the new visual. Hidden below `lg` via `hidden lg:block` so mobile stays exactly as today (text full-width, no extra vertical bulk).

### 2. The floating card cluster (right column)

A relatively-positioned container roughly `h-[460px]` that holds:

**Background glow** — absolutely-positioned blurred radial blob centered behind the stack:
- ~`h-[420px] w-[420px]`, `rounded-full`, `blur-3xl`, `opacity-60`
- `bg-gradient-to-br from-[hsl(229_94%_82%)]/35 via-[hsl(265_84%_75%)]/25 to-transparent` — same indigo→violet pair already used by "any AI" and `bg-gradient-accent`.

**2 decorative skill cards** — built inline (display-only, not from DB) to exactly mirror `SkillPreviewCard`:
- Classes: `rounded-2xl p-[22px] surface-card w-[320px]`.
- Header: same audience pill — `text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]` reading `FOR AGENTS`.
- Title (`font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight mt-4`) + tagline (`mt-2 text-[14px] text-muted-foreground leading-[1.6]`).
- A muted faux-button row at the bottom (matching the real "Download" button silhouette) so the card visually balances — no real onClick, `pointer-events-none` on the whole cluster so it's purely decorative.

Content:
1. "Listing Description Writer" — "MLS-ready listing copy in your voice."
2. "Offer & Negotiation Strategist" — "Build, present, and negotiate from strength."

**Stack / depth**:
- Both absolutely positioned inside the container.
- Card A (back): `top-4 left-0 -rotate-[4deg] z-10 shadow-2xl shadow-black/40`.
- Card B (front): `top-24 left-24 rotate-[3deg] z-20 shadow-2xl shadow-black/50 ring-1 ring-foreground/10`.
- Add `animate-float-slow` on the wrapper for the drift (see §3).

### 3. Subtle floating motion

Add one keyframe + animation in `tailwind.config.ts`:

```ts
keyframes: {
  "float-slow": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%":      { transform: "translateY(-6px)" },
  },
},
animation: {
  "float-slow": "float-slow 5s ease-in-out infinite",
},
```

Apply `motion-safe:animate-float-slow` to the cards-cluster wrapper so `prefers-reduced-motion: reduce` users get a static stack automatically (Tailwind's built-in `motion-safe:` variant — no extra CSS).

### Files touched

- `src/pages/SkillsPage.tsx` — hero grid + right-column visual JSX.
- `tailwind.config.ts` — add `float-slow` keyframe + animation.

No new components, no new dependencies, no DB, no changes to steps/grid/email-capture/submit sections or to `SkillPreviewCard`.
