## Skills page layout polish

Pure presentation changes in `src/pages/SkillsPage.tsx` and `src/components/skills/SkillPreviewCard.tsx`. No content, copy, data, or business logic changes.

### 1. Center last-row cards in the skills grid
In `SkillsPage.tsx`, swap the `grid md:grid-cols-3` wrapper around `SkillPreviewCard` for a `flex flex-wrap justify-center` container. Give each card a fixed responsive basis so it matches the previous 3-up width:
- wrapper: `flex flex-wrap justify-center gap-4 md:gap-5`
- each card item: `w-full md:w-[calc((100%-1.25rem*2)/3)]` (accounts for the `md:gap-5` = 1.25rem between 3 columns)

This keeps 3 per row on desktop, 1 per row on mobile, and centers any leftover cards on the last row.

### 2. Equal-height cards with pinned Download button
In `SkillPreviewCard.tsx`:
- Root: already `flex flex-col` — add `h-full` so it fills the flex item.
- Add `flex-1` to the tagline `<p>` (already has `flex-1`) and, when there is no tagline, render a `<div className="flex-1" />` spacer so the button still gets pushed down.
- Button stays at the end; remove `self-start` is not necessary — keep current `self-start` so it stays left-aligned but anchored at the bottom via the flex spacer.

Cards in the same flex row will stretch to equal height by default (`align-items: stretch`), so buttons line up.

### 3. Reorder sections
Move the entire "Email capture" `<section>` from its current position (after how-it-works, before the grid) to sit immediately after the "Available skills" `<section>` and before the "Submit callout" section. No copy changes.

New order: Hero → How it works → Available skills → Email capture → Submit callout.

### 4. Even vertical spacing
Normalize section padding. Currently sections mix `pt-16 lg:pt-24 pb-12`, `pb-20`, and `pb-24`. Standardize on:
- Hero section: `pt-16 lg:pt-24 pb-16`
- All middle sections (steps, skills grid, email capture): `pb-16`
- Final section before footer (submit callout): `pb-20`

This removes the oversized gap created by the current `pb-20` + next section's intrinsic top spacing, while preserving a slightly larger breathing room before the footer.

### Files touched
- `src/pages/SkillsPage.tsx` — grid wrapper classes, section reorder, padding normalization.
- `src/components/skills/SkillPreviewCard.tsx` — add `h-full`, ensure flex spacer so button pins to bottom.

No DB, no new components, no copy edits.