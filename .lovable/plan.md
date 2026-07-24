## Goal

RealToolbox.ai has two wings: (1) a curated **AI tools directory** (affiliate) and (2) **Toolboxes** — one-time purchase AI skill packs. Rebalance the homepage and navigation to present both, restore the directory's visibility, and finish the subscription-language sweep. Design tokens and components stay unchanged.

---

## 1. Hero — dual promise

Rewrite `src/components/home/Hero.tsx` (copy only, keep gradient/layout):

- Eyebrow: `For real estate investors & agents`
- H1: keep two-line pattern — e.g. *"The complete toolbox for real estate pros —"* + italic accent *"software you should know, AI skills that know the numbers."*
- Subhead: dual promise — discover the best real estate software/AI tools, and own operator-grade AI skill toolboxes built from 12+ years of real deals.
- Primary CTA → `#pricing` (scroll to Toolboxes): *"See the Toolboxes"*
- Secondary CTA → `/browse`: *"Browse the tool directory →"*
- Remove trailing credibility line's stale "deal analysis, lead conversion, pricing, follow-up, KPIs" phrasing; keep a shorter operator-built line that names the two wings.

## 2. Homepage section order

Rewrite `src/pages/Index.tsx` to this order:

```text
1. Hero
2. PricingSection            (Toolboxes — flagship offer, id="pricing")
3. InvestorArcSection        (supporting depth for the Investor Toolbox)
4. FeaturedTabsSection       (Featured + Just Launched from directory)
5. BrowseSection             (category rail + grid, home preview)
6. Deal Screen lead-magnet strip  (new small strip → /skills/deal-screen with free-account CTA)
7. NewsletterCard            (existing)
```

Fetch tools + categories in `Index.tsx` via existing `useTools`/`useCategories` and pass to Featured/Browse. Split tools into `featured` and `justLaunched` via existing flags (mirror how `BrowsePage` already reads them). Cap `BrowseSection` at ~12 cards on home with a "Browse all tools →" link to `/browse`.

**ChooseYourStageSection** and **SkillsHomeSection** / **SkillsAnnouncementStrip** are dropped from the homepage — their message is now absorbed by the rewritten PricingSection + InvestorArc. Files stay in the repo (no deletions) in case they're wanted elsewhere.

**New file `src/components/home/DealScreenStrip.tsx`**: compact one-row strip — "Free forever: the Deal Screen. Create a free account and run the numbers on any deal." → `/skills/deal-screen` (which already routes signed-out users through `/auth?next=...`).

## 3. Navigation

**`src/components/layout/Topbar.tsx`** — primary nav:
```text
Toolbox (→ /#pricing) · Browse Tools (→ /browse) · Resources · Blog
```
Keep "Start free" CTA button. Mobile menu mirrors this order and adds Integrations + Agents below the primary set.

**`src/components/layout/Footer.tsx`** — expand link columns:
- Product: Toolbox, Deal Screen (free), Skills
- Directory: Browse Tools, Categories, Integrations, Agents
- Company: Resources, Blog, Contact
- Legal bar unchanged.

## 4. Supporting section copy pass

- **InvestorArcSection**: tighten intro/CTA copy to "one-time toolbox" framing; no subscription words. Keep the 7-step visual.
- **PricingSection**: already correct — no structural change. Verify id="pricing" (it does) so Hero's primary CTA anchors.
- **SkillsAnnouncementStrip / SkillsHomeSection / ChooseYourStageSection**: not rendered on home anymore, but do a copy pass so `/skills` and any lingering references drop membership/subscription language ("KPI systems … push toward real monthly profit" → operator-safe rewrite that removes the ambiguous "monthly").

## 5. Full-site language sweep

Grep and rewrite all user-facing hits for: `All-Access`, `all access`, `membership`, `subscribe` (except newsletter), `$39`, `$390`, `/mo`, `monthly` (except admin affiliate history), `annual`, `trialing`, `trial`.

Known targets to check and rewrite as needed:
- `src/components/home/ChooseYourStageSection.tsx` — "real monthly profit" line
- `src/pages/WelcomePage.tsx`, `src/components/capture/CaptureDialog.tsx` — spot-verify (previously reported clean)
- `src/pages/SkillsPage.tsx`, `src/pages/SkillDetailPage.tsx` — FAQ / microcopy
- `src/pages/PrivacyPage.tsx`, `src/pages/TermsPage.tsx` — any subscription references
- `index.html` — title/description sweep in step 6

The final report will list every file touched.

## 6. SEO / head

**`index.html`**:
- Title: `RealToolbox.ai — Real estate AI tools directory + operator-grade AI toolboxes`
- Description: dual-positioning, ~150 chars. Reflects both directory and Toolboxes.
- Update `og:title`, `twitter:title`, `og:description`, `twitter:description` to match.

Internal linking: restored Topbar + Footer links make `/browse`, `/integrations`, `/agents`, `/resources`, `/blog`, `/skills` all reachable from the homepage. Verify each is linked from either nav or footer.

## 7. Verification

At the end I'll:
- List every file changed.
- Print the final top-to-bottom homepage section order.
- Confirm the language-sweep grep returns zero user-facing hits.

## Out of scope

- No backend, RLS, or edge function changes.
- No new pages.
- No component-token or design changes.
- File deletions avoided (unused-on-home sections stay in repo).
