## Plan: Email-capture modal for Deal Screen + early access

Build one reusable capture modal with two modes, wired to existing hero + stage cards + Deal Screen card CTA. Save to existing `newsletter_subscribers` table (already has `investor_stage`). No auth, no schema changes, no admin/payments/nav changes.

### 1. New component: `src/components/capture/CaptureDialog.tsx`
Reusable dialog built on existing `@/components/ui/dialog`, `Input`, `Label`, `Button` (variant `hero`) — matches existing dark/purple/serif theme.

Props:
- `open`, `onOpenChange`
- `mode`: `"free-skill" | "early-access"`
- `initialStage?`: `"first" | "active" | "scaling"` (pre-selects pill)
- `source`: short string for the `source` column (e.g. `"hero_deal_screen"`, `"stage_first"`, `"stage_active"`, `"stage_scaling"`, `"deal_screen_card"`)

UI:
- Heading: `"Get the free Deal Screen"` (mode A) or `"Join the early-access list"` (mode B)
- Email input (required, zod-validated like `SkillDownloadDialog`)
- "Where are you right now?" — 3 selectable pills (single-select, optional):
  - "Working on my first deal" → `first_deal`
  - "Actively flipping or investing" → `actively_investing`
  - "Scaling a team & operations" → `scaling`
- Submit button (`variant="hero"`)

Submit logic:
1. Validate email with zod.
2. `supabase.from("newsletter_subscribers").insert({ email, source, investor_stage })`. Treat unique-violation `23505` as success (already subscribed).
3. Mode A: fetch Deal Screen file URL — `supabase.from("skills").select("file_url").eq("slug","deal-screen").maybeSingle()` — then `window.open(file_url, "_blank", "noopener,noreferrer")`. Success state replaces form with: "Downloaded — load it into ChatGPT, Claude, or Gemini and start screening deals."
4. Mode B: Success state: "You're on the list — we'll email you when these tools go live."

Toast errors via `sonner` on failure (consistent with `SkillDownloadDialog`).

### 2. Wire triggers

**`src/components/home/Hero.tsx`** — convert "Start free — Deal Screen" `<Link>` into a button that opens `CaptureDialog` in mode `free-skill`, source `hero_deal_screen`. Leave "See the workflows →" link unchanged.

**`src/components/home/ChooseYourStageSection.tsx`** — replace each card's `<Link>`/`<a>` with a button that opens the dialog:
- First Deal → mode `free-skill`, initialStage `first`, source `stage_first`
- Actively Investing → mode `early-access`, initialStage `active`, source `stage_active`
- Scaling → mode `early-access`, initialStage `scaling`, source `stage_scaling`

**Deal Screen card CTA** — in `src/components/skills/SkillPreviewCard.tsx`, detect `slug === "deal-screen"` and open `CaptureDialog` (mode `free-skill`, source `deal_screen_card`) instead of the existing `SkillDownloadDialog`. All other skill cards keep current behavior unchanged.

### Technical notes
- No DB migration: `investor_stage` column already exists on `newsletter_subscribers`. Existing RLS policy "Anyone can subscribe" allows anon insert with email validation — compatible.
- Reads `skills.file_url` for `deal-screen` via the existing public `skills` SELECT policy.
- No changes to `SkillDownloadDialog`, admin, routes, nav, theme, fonts, or other skill cards.
- Files touched: new `CaptureDialog.tsx`; edits to `Hero.tsx`, `ChooseYourStageSection.tsx`, `SkillPreviewCard.tsx`.
