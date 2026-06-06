# Plan: Skill detail redesign + CTA repointing

## 1) Hero subhead (`src/components/home/Hero.tsx`)

Replace only the `<p>` subhead with:

> "Ready-to-run AI workflows for real estate investors, flippers, and ambitious agents — built from real operator experience, not generic prompts. Load one into ChatGPT, Claude, or Gemini and get operator-grade output on deals, leads, KPIs, and scaling in minutes."

Also change the "Start free — Deal Screen" button from `onClick={() => setOpen(true)}` to a `<Link to="/skills/deal-screen">` styled identically. Remove the now-unused `CaptureDialog` import and `open` state from this file.

## 2) Admin: add Overview field

**Migration** — add one nullable column:

```sql
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS overview text;
```

(No grants/RLS changes — column is additive on an existing table.)

**`src/pages/admin/SkillFormDialog.tsx`** — add `overview: string | null` to `SkillRow` and `empty`. Add a new `<Textarea>` labeled "Overview (markdown)" with help text "Benefit-focused detail content shown on the skill's detail page." placed directly under the existing Description field. No other admin changes.

Regen note: `src/integrations/supabase/types.ts` is auto-generated; the form already uses `as any` casts on `.from("skills")`, so no manual type edit needed.

## 3) Skill detail page redesign (`src/pages/SkillDetailPage.tsx`)

Fetch additionally selects `overview`. `SkillRow` type gains `overview: string | null`.

**Remove** the existing "full .md" rendering branch and the `useQuery` that fetches `file_url` markdown for display. Remove `ReactMarkdown` usage for the file body — but keep `ReactMarkdown`+`remarkGfm` to render the Overview field.

**New page structure** (reusing existing surface-card / prose / typography styles):

- Back link (kept).
- Header: tagline badge, `<h1>` name, full description paragraph (kept).
- **Overview section**: heading "Overview" + `<ReactMarkdown>` of `skill.overview`. If `overview` is empty/null, render the description text only (no markdown), no duplicate heading.
- **"How to set it up for continuous use"** section, identical content for every skill — a numbered list with the exact 4 steps from the brief, including the ChatGPT/Claude/Gemini sub-bullets under step 3. Plain styled list inside a `surface-card`.
- **Action area**:
  - **Free**: primary "Copy skill" button + three secondary buttons "Open ChatGPT" / "Open Claude" / "Open Gemini" that `window.open(url, "_blank", "noopener")` to `https://chatgpt.com`, `https://claude.ai/new`, `https://gemini.google.com`. Style the LLM buttons as the existing subtle outline/ghost style used elsewhere.
  - **Paid**: a single "Coming soon — Join for early access" button only. No copy / LLM buttons.
- Remove the "How to use it" `HowToUseSteps` block from this page (replaced by the new continuous-use steps). `HowToUseSteps` stays in the codebase for `SkillsPage.tsx`.

**Copy-skill flow** (free only):

- "Copy skill" opens the existing `CaptureDialog` in `free-skill` mode (no logic change in the dialog).
- A new `onSuccess?: () => void` prop is added to `CaptureDialog` and fired after a successful submission in `free-skill` mode. Existing call sites pass nothing → no behavior change for them.
- On the detail page, `onSuccess` runs: `fetch(skill.file_url).then(r=>r.text())` → `navigator.clipboard.writeText(text)` → set local `copied=true` and show a toast/inline "Copied!" confirmation next to the button for ~3s. The skill text is never rendered to the DOM.
- Guard for missing `file_url` / clipboard errors with a toast error.

Document title / meta description logic unchanged.

## 4) CTA routing

- **Hero "Start free — Deal Screen"** → `<Link to="/skills/deal-screen">` (see §1).
- **`src/components/home/ChooseYourStageSection.tsx`**:
  - First Deal card primary button → `/skills/deal-screen`.
  - Actively Investing / Scaling primary buttons keep their existing capture-modal "Join for early access" behavior (unchanged — these are the paid-stage CTAs from prior work).
  - "Learn more →" links repoint per stage:
    - First Deal → `/skills/deal-screen`
    - Actively Investing → `/skills/deal-analyzer-underwriter`
    - Scaling → `/skills/kpi-constraint-finder`
- **Deal Screen `SkillPreviewCard`**: free-card "Start free" button currently opens the capture modal. Change the free-card primary action to navigate to `/skills/${slug}` instead of opening the modal. (Card body click already navigates there; this just aligns the button.) Paid-card "Join for early access" button is unchanged. Remove the now-unused `CaptureDialog` mount for the free branch; keep it for the paid branch.

## Files touched

- `src/components/home/Hero.tsx` — copy + CTA link
- `src/components/home/ChooseYourStageSection.tsx` — Learn-more hrefs + First Deal primary CTA
- `src/components/skills/SkillPreviewCard.tsx` — free CTA becomes a link
- `src/components/capture/CaptureDialog.tsx` — add optional `onSuccess` callback
- `src/pages/SkillDetailPage.tsx` — full redesign per §3
- `src/pages/admin/SkillFormDialog.tsx` — add Overview textarea
- Migration: add `skills.overview text` nullable column

## Out of scope

Auth, Stripe, nav, footer, theme, other routes, capture-modal internals beyond the new `onSuccess` hook, `SkillsPage.tsx` styling, the `skills` schema beyond the single new column.
