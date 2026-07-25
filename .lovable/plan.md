## Homepage restructure for conversion

Goal: homepage explains + captures free signup + routes out. Selling stays on `/toolbox` and `/toolbox/investor`.

### Section order in `src/pages/Index.tsx`

```text
Hero
WhatThisIsSection       (NEW)
DealScreenStrip         (moved up, visually amplified)
InvestorArcSection      (unchanged)
OfferBand               (NEW — replaces PricingSection)
FeaturedTabsSection     (unchanged)
StacksHomeStrip         (unchanged)
BrowseSection + "Browse all N tools →"  (unchanged)
NewsletterCard          (added at bottom)
```

Remove `<PricingSection />` from `Index.tsx`. File stays on disk (still used by `/toolbox` etc. if referenced — I'll verify; if unused elsewhere, leave the file in place, just unimport).

### New: `src/components/home/WhatThisIsSection.tsx`

Tight explainer for someone who's never heard of an AI skill. Design tokens/components identical to existing home sections (`surface-card`, same eyebrow + display heading pattern as `InvestorArcSection`).

- Eyebrow: "What this actually is"
- Heading: "An AI skill is a complete set of operating instructions."
- Sub (1–2 lines): loads into ChatGPT, Claude, or Gemini and turns it into a real estate specialist that follows one job conservatively — no invented numbers.
- Three compact beats in a 3-col grid (icons from lucide, matching `HowToUseSteps` visual weight but lighter):
  1. Load it — drop the skill into your AI once.
  2. Paste your deal — address, price, rehab, rents.
  3. Get an operator-grade answer — conservative math, clear go/no-go.
- No CTA (the next section is the CTA).

### Amplified Deal Screen strip

Edit `src/components/home/DealScreenStrip.tsx` in place to carry more weight as the page's primary CTA:

- Wrap in a subtle gradient-bordered card (same gradient tokens used on the Investor pricing card — `hsl(239 84% 60%) → hsl(265 84% 60%)`) so it visually reads as the hero moment on the page.
- Larger heading size (~28–32px), slightly taller padding, keep the "Free forever" badge.
- Keep primary CTA button ("Get the free Deal Screen") and add a small secondary line under it: "No card. Create a free account." — reinforcing the offer.
- Link target unchanged (`/toolbox/deal-screen`).

### New: `src/components/home/OfferBand.tsx`

Replaces the three-card PricingSection with one horizontal routing band.

- Container: `surface-card` rounded-2xl, one row on desktop, stacks on mobile.
- Eyebrow "Own the toolbox" + one-line lede ("Buy once. Own it forever.").
- Three inline items separated by subtle dividers:
  - **Investor Toolbox** — `$79` founding (`$99` strikethrough) · "7 skills, one decision path"
  - **Complete** — `$149` · "Investor + Agent when it releases"
  - **Agent Toolbox** — muted, "Coming soon"
- CTAs at the end of the band:
  - Primary: `See what's inside →` → `/toolbox/investor` (gradient button, matches existing style)
  - Secondary: `Compare toolboxes` → `/toolbox` (ghost link)
  - Tertiary micro-link on the Investor row only: `Buy $79 →` calling existing `useCheckout().startCheckout("investor", "/")` so the direct-buy path still works.
- No feature lists, no check bullets — those live on the toolbox pages.

### Newsletter

Add `<NewsletterCard />` (already exists at `src/components/home/NewsletterCard.tsx`) at the bottom of `Index.tsx`.

### Topbar

"Start free" already lives in `Topbar.tsx` — leave as is (verify during build).

### Out of scope

- No changes to design tokens, fonts, colors, or shadcn components.
- No changes to `/toolbox`, `/toolbox/investor`, `/toolbox/deal-screen`, or checkout logic.
- No copy changes to Hero, Investor Arc, Featured, Stacks, or Browse.

### Verification

- `tsgo` typecheck.
- Visual check via Playwright screenshot of `/` at 1280 wide to confirm section order, that DealScreenStrip reads as the primary CTA, and OfferBand fits on one row on desktop / stacks cleanly on mobile.
