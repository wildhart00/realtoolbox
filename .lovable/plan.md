The homepage already reflects most of this restructure from an earlier pass — PricingSection is gone, OfferBand is in place, DealScreenStrip is promoted above InvestorArc, and Hero + HowConnectionWorks + WhatThisIsSection lead the page. Two small deltas remain to match the spec exactly.

## Changes

1. `src/pages/Index.tsx` — reorder the lower half so Stacks sits after Browse, not before it:
   - Move `<StacksHomeStrip />` to render after the "Browse all N tools →" link, immediately before `<NewsletterCard />`.
   - No other component changes.

2. Verify OfferBand copy matches: "$79 founding · $149 Complete · Agent coming soon," primary CTA to `/toolbox/investor` ("See what's inside"), secondary direct-buy link. If copy has drifted, tighten to one line each. No visual/design-token changes.

Everything else (Hero, HowConnectionWorks, WhatThisIsSection, DealScreenStrip weight, InvestorArcSection, FeaturedTabsSection, BrowseSection, NewsletterCard, topbar "Start free") stays exactly as it is.

## Final section order (top to bottom)

a. Hero (MCP-led)
b. HowConnectionWorks
c. WhatThisIsSection
d. DealScreenStrip (primary CTA)
e. InvestorArcSection
f. OfferBand (compact routing band replacing PricingSection)
g. FeaturedTabsSection
h. BrowseSection (+ "Browse all N tools →" link)
i. StacksHomeStrip
j. NewsletterCard
