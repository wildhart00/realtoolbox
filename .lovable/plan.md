Styling + copy cleanup on the Agents page. No structural changes.

## 1. `src/pages/AgentsPage.tsx`

- Change hero pill `"Works with Claude"` → `"Works with any AI"` in the `heroPills` array.
- Replace both card grids with the Skills-page flex-wrap pattern so the last row centers and cards equalize via `w-full md:w-[calc(...)]` wrappers:
  - Agent platforms (3-col target): `<div className="flex flex-wrap justify-center gap-4 md:gap-5">` with each card wrapped in `<div className="flex w-full md:w-[calc((100%-1.25rem*2)/3)] lg:w-[calc((100%-1.25rem*2)/3)]">` (the inner card already stretches via `flex flex-col` + `h-full`).
  - Workflows (2-col target): same pattern with `md:w-[calc((100%-1.25rem)/2)]`.
- The wrapper uses `flex` so child cards fill height; add `h-full` to the card roots.

## 2. `src/components/agents/AgentPlatformCard.tsx`

- Add `h-full` to the root `<div>` so it fills the flex wrapper.
- Card is already `flex flex-col` with `mt-auto` on the footer row — the `Visit` link already sits at the bottom. No further change needed for pinning.
- `Visit` anchor already has `target="_blank" rel="noopener noreferrer"` — already satisfies item 3, no change required.

## 3. `src/components/agents/WorkflowCard.tsx`

- Add `h-full` to the root `<div>` (already `flex flex-col`).
- Wrap the `View Guide` link container with `mt-auto` (currently `mt-5`) so it pins to the bottom across rows.

No copy, section order, or link destinations change beyond the one pill rename.
