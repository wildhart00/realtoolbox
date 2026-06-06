## Three small fixes

### 1. Footer order swap
In `src/components/layout/Footer.tsx`, move the NewsletterCard band above the 3-column link block so the page footer reads:
1. Newsletter band
2. 3-column links (Brand, Quick Links, By Stage)
3. Legal bar (copyright / Privacy / Terms)

No other footer changes.

### 2. Skills page hero subhead
In `src/pages/SkillsPage.tsx`, change:
> "Each one turns your AI into a specialist for one money task — deal analysis, lead conversion, pricing, follow-up, KPIs — built from real flipping and rental experience. Copy it into your AI and go."

to:
> "Each one turns your AI into a specialist for one specific job — deal analysis, lead conversion, pricing, follow-up, KPIs — built from real flipping and rental experience. Copy it into your AI and go."

### 3. Stage card "Learn more" links
In `src/components/home/ChooseYourStageSection.tsx`, point all three "Learn more" links to `/skills` instead of `/skills/{slug}`. Keep each primary button unchanged (First Deal → /skills/deal-screen, Actively Investing / Scaling → capture modal).