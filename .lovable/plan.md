## Plan: Add "The Investor Arc" section to homepage

### What we're building
A new homepage section placed directly below the Hero and above "Choose your stage". It shows a 7-step horizontal timeline of skills that form a continuous investor decision path, with the free Deal Screen step highlighted.

### Changes

1. **New component** `src/components/home/InvestorArcSection.tsx`
   - Small uppercase label: "THE INVESTOR ARC"
   - Large serif heading: "Seven skills. One decision path."
   - One muted intro line explaining the system.
   - Horizontal step-flow of 7 nodes (numbered cards), connected with arrows/lines, wrapping on smaller screens.
   - Each node: number, short title, one-line description.
   - Step 2 (Deal Screen) gets a "FREE" badge and subtle accent ring to stand out.
   - Centered "Browse all seven skills →" link in accent color below the flow.
   - Uses existing design tokens: `font-display`, `text-muted-foreground`, `surface-card`, accent gradients, same max-width and padding as other homepage sections.

2. **Update** `src/pages/Index.tsx`
   - Import and render `<InvestorArcSection />` between `<Hero />` and `<ChooseYourStageSection />`.

### Design details
- Background: transparent (inherits dark page background, same as other sections).
- Container: `max-w-[1100px]` with `px-6 lg:px-10 py-14 lg:py-16 mx-auto` (matching existing homepage section spacing).
- Step cards: `surface-card` style with `rounded-2xl`, compact padding.
- Connectors: simple SVG or CSS-based arrows/lines between cards on desktop; gracefully stack/wrap on mobile.
- Generous gap between cards and rows; no crowding.