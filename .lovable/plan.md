# Toolbox Product Pages

Build three new dedicated pages under `/toolbox`, redirect the legacy `/skills` routes, and repoint existing CTAs. Design system, tokens, and existing components (SkillPreviewCard, PricingSection styling, surface-card, gradient tokens) stay exactly as they are.

## Routes

Added in `src/App.tsx`:

- `/toolbox` — product index (new `ToolboxIndexPage`)
- `/toolbox/investor` — Investor Toolbox sales page (new `InvestorToolboxPage`)
- `/toolbox/agent` — Agent Toolbox coming-soon page (new `AgentToolboxPage`)
- `/toolbox/:slug` — skill detail (reuses existing `SkillDetailPage`)

Redirects (via `<Navigate replace>`):

- `/skills` → `/toolbox`
- `/skills/:slug` → `/toolbox/:slug` (preserves slug via a tiny wrapper component reading `useParams`)

Existing `SkillDetailPage` internal links (breadcrumbs, related-skill links) are updated to point at `/toolbox/:slug`.

## Pages

### `/toolbox` — `src/pages/ToolboxIndexPage.tsx`

- Hero: "The toolbox that fits how you invest." Short honest positioning line.
- Product row (3 cards, existing pricing card styling reused from `PricingSection`):
  - **Investor Toolbox** — $79 founding / ~~$99~~ · "Available now" · CTA button `Get the Investor Toolbox → $79` (calls `useCheckout('investor', '/toolbox')`) · secondary link `Learn more → /toolbox/investor`
  - **Complete Toolbox** — $149 founding · "Agent Toolbox included free when it releases" · CTA `Get the Complete Toolbox → $149` (calls `useCheckout('complete', '/toolbox')`)
  - **Agent Toolbox** — Coming soon · waitlist email input → inserts into `newsletter_subscribers` with `source: 'agent_toolbox_waitlist'` · success state with sonner toast
- Free entry strip: Deal Screen card with "Try before you buy" copy → `/toolbox/deal-screen` (auth-gated for copy through existing flow).
- Below products: full skill library grid using existing `SkillPreviewCard`, grouped by `toolbox` field (Investor / Agent / Free) with section headers. Fetches all published skills the same way `SkillsPage` does today.

### `/toolbox/investor` — `src/pages/InvestorToolboxPage.tsx`

Long-form sales page in the existing visual language:

1. **Headline block** — "Make your first safe deal decision without losing your shirt." Subhead framing operator-grade, conservative-by-design tone. Single primary CTA (`Get the Investor Toolbox — $79`) that calls `useCheckout('investor', '/toolbox/investor')`. Secondary "Try Deal Screen free" link.
2. **The 7-skill arc** — numbered timeline visual reusing tokens from `InvestorArcSection`: define your buy box → screen → triage → audit your inputs → pick your strategy → know when to walk → underwrite. Each step renders as a `SkillPreviewCard` linked to `/toolbox/:slug` (fetches all `is_published` skills where `toolbox = 'investor'`, ordered by `sort_order`).
3. **What you get** — checklist block:
   - 7 operator-grade skills
   - Universal setup guide
   - Lifetime updates as new investor skills drop
   - Copy-to-clipboard delivery
   - Works with ChatGPT, Claude, and Gemini
   - Connect directly to Claude/ChatGPT via our MCP integration
4. **Price + buy** — repeats the primary CTA with founding price note.
5. **FAQ** — accordion using existing shadcn `Accordion`:
   - What is a skill?
   - Which AI do I need?
   - Is this a subscription? (No — one payment, yours forever, updates included.)
   - Do I need a paid ChatGPT/Claude account?
   - How do I load a skill?
6. **Credibility footer line** — "Built and torture-tested by a 12-year operator. Conservative by design."

Auth-aware CTA: `useCheckout` already handles unauthenticated → `/auth?mode=signup&next=...`.

### `/toolbox/agent` — `src/pages/AgentToolboxPage.tsx`

Same layout template as investor page but in coming-soon state:

- Headline: "The agent toolbox is coming." Honest positioning.
- **What it will contain** section (no cards, list format since skills don't exist yet):
  listing descriptions · seller lead response · follow-up sequences · pricing narratives · objection handling · listing presentations · buyer consultations · offer & negotiation strategy
- **Waitlist capture** — email input → inserts into `newsletter_subscribers` with `source: 'agent_toolbox_waitlist'`. Handles `23505` duplicate gracefully like `SkillsPage`.
- **Note callout**: "Already bought the Complete Toolbox? You'll get the Agent Toolbox free the day it releases."
- Same FAQ block (adjusted for agent context).

## CTA repointing

- `src/components/layout/Topbar.tsx` — nav "Skills" → "Toolbox", `href: "/toolbox"`.
- `src/components/layout/Footer.tsx` — "Skills" link → "Toolbox" `/toolbox`; keep Deal Screen free link but point at `/toolbox/deal-screen`.
- `src/components/home/PricingSection.tsx` — pricing cards keep direct checkout CTAs; add a small "Learn more" secondary link under each toolbox card pointing at `/toolbox/investor` (investor + complete cards both link to `/toolbox/investor` for now; complete gets an extra "See Agent details" → `/toolbox/agent`).
- Any homepage skill-related "Learn more / Browse skills" CTA in `SkillsHomeSection` → `/toolbox`.
- `useCheckout` `nextPath` parameter values updated at call sites so post-auth resume lands back on the same toolbox page.

## Voice guardrails

All copy across the three new pages: operator-grade, honest, no hype, no income claims, no "get rich" framing. Credibility line ("Built and torture-tested by a 12-year operator. Conservative by design.") appears once per page, understated.

## Technical notes

- New files: `src/pages/ToolboxIndexPage.tsx`, `src/pages/InvestorToolboxPage.tsx`, `src/pages/AgentToolboxPage.tsx`. Optional small wrapper `SkillsSlugRedirect.tsx` that reads `useParams().slug` and renders `<Navigate to={\`/toolbox/${slug}\`} replace />`.
- No DB schema changes. `newsletter_subscribers` insert uses existing columns (`email`, `source`). No `investor_stage`.
- No new dependencies. Uses existing `SkillPreviewCard`, `useCheckout`, `useAuth`, shadcn `Accordion`, `Button`, `Input`, sonner, `AppLayout`.
- Old `SkillsPage.tsx` is left in place but no longer routed (safe to keep as reference; can be deleted in a follow-up).
- SEO: each new page sets `document.title` and meta description in a `useEffect`, matching the pattern used by `SkillsPage`.

## Deliverable at end of build

Reply lists the four created routes and confirms the two redirects (`/skills` and `/skills/:slug`) resolve correctly.
