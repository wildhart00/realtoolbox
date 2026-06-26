## Plan: Add Pricing Section to Homepage

### Placement
Insert the new section in `src/pages/Index.tsx` between `<SkillsHomeSection />` and `<Footer />` (which contains `<NewsletterCard />`).

### New Component: `src/components/home/PricingSection.tsx`

**Header block**
- Small uppercase label: "MEMBERSHIP" (`text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold`)
- Large serif heading: "Start free. Upgrade when it pays for itself." (`font-display text-[28px] sm:text-[34px]`)
- Muted intro line: "Screen any deal for free, forever. When you're ready to underwrite for real and get your safe offer, everything unlocks for less than the cost of one bad assumption."

**Two pricing cards (grid `grid-cols-1 md:grid-cols-2 gap-4`, max-width container `max-w-[1100px]`)**

**Card 1 — Free**
- Uses `surface-card rounded-2xl` with subtle `border-foreground/[0.07]`
- Plan name: "Deal Screen"
- Price: "$0" large + "forever" small muted
- Line: "Run any deal through the operator math in seconds."
- Checklist (muted check icons):
  - Free Deal Screen — unlimited
  - Pat's Adjusted ARV Method
  - Works in ChatGPT, Claude, or Gemini
- Button: secondary/outline style — "Start free →" linking to `/auth`

**Card 2 — All-Access (visually emphasized)**
- Accent gradient treatment: `bg-gradient-to-br` from indigo to violet, or gradient border via a wrapper div with `p-[1px]` rounded-2xl and inner `surface-card`/`bg-background`
- Small top badge: "FOUNDING MEMBER" (gradient pill, white text)
- Plan name: "All-Access"
- Price: "$39" large + "/month" inline, with "or $390/year — 2 months free" below
- Line: "The full operator toolkit — every skill, plus new ones every month."
- Checklist:
  - Everything in Free
  - Deal Analyzer & Underwriter — your safe offer, underwritten
  - All 7 launch skills + the full decision arc
  - New skills added every month
  - Lock in this founding-member price for life
- Button: primary gradient (`bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]`) — "Get All-Access →" linking to `/auth`

**Footer line**
- Centered muted text: "Cancel anytime. Founding-member pricing won't last."

### Update `src/pages/Index.tsx`
- Import `<PricingSection />`
- Render it between `<SkillsHomeSection />` and the closing `</AppLayout>` (i.e., before `<Footer />` which contains the newsletter)

No other files touched.
