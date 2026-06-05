# RealToolbox.ai — Copy + positioning reskin

Pure copy/section changes. No nav, routes, theme, components, auth, payments, or skill data touched.

## 1. Homepage hero — `src/components/home/Hero.tsx`

Replace existing copy only (keep section layout, badge, search form structure, fonts, colors):

- Eyebrow pill: `FOR REAL ESTATE INVESTORS & OPERATORS` (replaces current "{count} curated tools — updated weekly")
- H1: `Build and scale a real estate business with AI that knows the numbers.` (keep current font/sizing; italic gradient treatment on "AI that knows the numbers")
- Subhead: `Ready-to-run AI workflows for real estate investors, flippers, and the agents who want to think like them — deal analysis, lead conversion, KPIs, and scaling, built from real operator experience, not generic prompts. Drop one into ChatGPT, Claude, or Gemini and get operator-grade output in minutes.`
- Replace the search input row with two CTAs:
  - Primary button (existing dark/foreground button style) → links to `/skills`: `Start free — Deal Screen`
  - Secondary text link → anchors to the new stages section / `/skills`: `See the workflows`
- Differentiator line under the buttons (small muted): `ChatGPT doesn't know how a flip gets underwritten or why your follow-up isn't converting. These do — because an operator built them.`
- Remove the current credibility line (replaced by differentiator).

## 2. "How it works" strip — `src/pages/SkillsPage.tsx` (the 3-step grid)

Update only the three step `title` / `subtext` strings; keep numbers, icons, card layout:

1. `Pick a workflow` — `Choose the one for the job in front of you.`
2. `Load it into your AI` — `ChatGPT, Claude, Gemini, or any assistant. Copy it in, or save it once.`
3. `Get operator-grade output` — `The numbers and judgment of someone who's run the deals.`

## 3. NEW homepage section — "Choose your stage"

New file `src/components/home/ChooseYourStageSection.tsx`. Built from the same `surface-card` pattern used in `BuiltForSpecialtySection` so it visually matches.

- Eyebrow: `Choose your stage`
- H2 (serif display): `Built for every stage of the climb.`
- Subtext: `Wherever you are, there's a lane — and it grows with you.`
- 3-card grid (`grid-cols-1 md:grid-cols-3 gap-4`), each card has tag pill, title, body, and CTA button styled like existing purple-gradient/foreground buttons.

| Tag | Title | Body | Button |
|---|---|---|---|
| FIRST DEAL | Doing your first deal | Screen deals, learn the numbers, and dodge rookie mistakes with workflows that think like a seasoned investor. | Start free → `/skills` |
| ACTIVELY INVESTING | Flipping or renting now | Tighten deal analysis, lead conversion, and follow-up so more deals close. | Join for early access → scroll to email form |
| SCALING | Building a business | KPI systems, sales process, hiring, and ops workflows to push toward real monthly profit. | Join for early access → scroll to email form |

Insert in `src/pages/Index.tsx` between `Hero` and `BuiltForSpecialtySection`.

## 4. Email signup — add optional "Where are you right now?"

Schema migration (additive, non-breaking):

```sql
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS investor_stage text;
```

No policy / grant / column-removal changes. Existing insert policy already permits the new column.

UI: add the optional question to `src/pages/SkillsPage.tsx`'s waitlist form (the existing signup that writes to `newsletter_subscribers`). Pill-button single-select above the email input:

- Label: `Where are you right now? (optional)`
- Options: `Working on my first deal` / `Actively flipping or investing` / `Scaling a team & operations`
- Selected value (or `null`) included in the existing `supabase.from("newsletter_subscribers").insert({...})` call as `investor_stage`.
- Form submits and succeeds with the field blank — no required validation added.

`NewsletterCard.tsx` (homepage footer-area subscribe) is left unchanged — it writes to a different `subscribers` table and the brief specifies one signup form.

## 5. Skills page hero — `src/pages/SkillsPage.tsx`

Replace only the hero text block; floating card cluster, layout, and skill grid below stay identical:

- Eyebrow chip: `OPERATOR-GRADE WORKFLOWS`
- H1: `AI workflows for real estate investors.` (keep gradient treatment on a phrase, e.g. "real estate investors")
- Subhead: `Each one turns your AI into a specialist for one money task — deal analysis, lead conversion, pricing, follow-up, KPIs — built from real flipping and rental experience. Copy it into your AI and go.`

Also update `document.title` / meta description to match the new positioning.

## Out of scope / explicitly unchanged

Nav, routes, footer, theme tokens, fonts, skill cards + Supabase queries, auth, Stripe, storage, `BuiltForSpecialtySection`, `BrowseByTagSection`, `FeaturedSection`, `NewsletterCard`.
