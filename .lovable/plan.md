# Plan

Scope: 4 focused changes. No schema/admin/auth/payments changes. Reuse existing `CaptureDialog`, surface styles, gradients, and typography.

## 1. Hero subhead copy (`src/components/home/Hero.tsx`)

Replace the existing `<p>` subhead text with exactly:

> "AI workflows built by a real estate operator, not a prompt writer. Load one into ChatGPT, Claude, or Gemini for operator-grade help with deals, leads, KPIs, and scaling — in minutes."

No other changes to Hero (CTA, badge, footnote, dialog wiring untouched).

## 2. Skill card upgrade (`src/components/skills/SkillPreviewCard.tsx`)

Expand `SkillCardData` to include `description: string | null` and keep `tagline`, `name`, `slug`, `access_level`, `price`, `file_url`. Update the two callers' `select(...)` strings to include `description`:
- `src/components/home/SkillsHomeSection.tsx`
- `src/pages/SkillsPage.tsx`

Card structure (reuses existing `surface-card`, accent badge, hero gradient button):
- Badge (top): `tagline` rendered uppercase in the existing accent badge style (replaces the current audience label).
- Title: `name` (existing display font).
- Body: `description` (existing muted body style); falls back to `tagline` if description missing.
- Footer action area depends on `access_level`:
  - **Free** (`access_level !== "paid"` or `price == 0`): primary "Start free" hero-gradient button → opens `CaptureDialog` in `free-skill` mode, `source="skill_card_<slug>"`.
  - **Paid**: card gets a subtle locked treatment — small `Lock` icon in the top-right of the card, slightly muted opacity on the title/body (e.g. `opacity-90`), price chip showing `$<price>` next to the button, and a "Join for early access" button → opens `CaptureDialog` in `early-access` mode with `initialStage` derived from `tagline` (map: "ACTIVELY INVESTING" → `active`, "SCALING" → `scaling`, else `first`). No Download button.
- Whole card wrapped so the body area is a `<Link to={`/skills/${slug}`}>`; the action button uses `onClick` with `e.stopPropagation()` + `e.preventDefault()` so it triggers the modal without navigating. Remove the legacy `isDealScreen` slug-special-case and the `SkillDownloadDialog` import (no longer needed here).

## 3. New skill detail page `/skills/:slug`

- New file `src/pages/SkillDetailPage.tsx`, wrapped in `AppLayout`. Add `<Route path="/skills/:slug" element={<SkillDetailPage />} />` to `src/App.tsx` immediately after the existing `/skills` route.
- Data: `useParams()` for slug; `useQuery` fetching `skills` row by slug with `is_published=true`.
- Layout (matches site dark/serif/purple):
  - Back link "← All skills" → `/skills`.
  - Header block: tagline accent badge, `font-display` H1 with `name`, muted `description` paragraph.
  - "How to use it" block: reuse the same three steps used in `SkillsPage` (Pick a workflow / Load it into your AI / Get operator-grade output) — extract them into `src/components/skills/HowToUseSteps.tsx` and import in both places so they stay in sync.
  - Conditional body:
    - **Free**: fetch the raw `.md` from `file_url` via `fetch().then(r=>r.text())` and render with `react-markdown` + `remark-gfm` inside a `prose prose-invert` container. Primary "Start free" button opens `CaptureDialog` (`free-skill`, source `skill_detail_<slug>`).
    - **Paid**: no markdown fetch. A "What's inside" card showing the `description` (use first ~2 sentences if long). Primary "Coming soon — Join for early access" button opens `CaptureDialog` (`early-access`, `initialStage` from tagline as in §2).
  - Document title + meta description set from skill name/description.
- Dependency: add `react-markdown` and `remark-gfm` (small, MIT). If preferred, fall back to a minimal inline renderer, but `react-markdown` keeps it clean. Confirm during build.

## 4. Stage cards "Learn more" link (`src/components/home/ChooseYourStageSection.tsx`)

Inside each stage card's footer row, keep the existing gradient button unchanged and add a secondary `<Link to="/skills">Learn more →</Link>` next to it using the existing subtle text-link styling (`text-[13px] text-foreground/70 hover:text-foreground`). Click on the link must not trigger the capture modal (it's an anchor, separate from the button).

## Files touched

- `src/components/home/Hero.tsx` (copy only)
- `src/components/skills/SkillPreviewCard.tsx` (rebuild card)
- `src/components/home/SkillsHomeSection.tsx` (select `description`)
- `src/pages/SkillsPage.tsx` (select `description`)
- `src/components/skills/HowToUseSteps.tsx` (new, shared)
- `src/pages/SkillDetailPage.tsx` (new)
- `src/App.tsx` (route)
- `src/components/home/ChooseYourStageSection.tsx` (add Learn more link)

## Out of scope

Schema, admin, auth, Stripe, theme/fonts/nav/footer, capture-modal internals, all existing routes.
