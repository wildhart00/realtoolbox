## Goal
Replace the hardcoded "What's Coming" placeholder section on /skills with a live grid that pulls real, published skills from the Supabase `skills` table.

## Changes

### 1. Update `SkillPreviewCard` (`src/components/skills/SkillPreviewCard.tsx`)
- Replace the current static props (`title`, `description`, `audience`) with the actual `skills` table fields: `name`, `tagline`, `audience`, `file_url`, `access_level`, `price`, `slug`.
- Remove the "Coming Soon" badge and the "Drop your email above to be notified when this drops" text.
- Render the audience badge (e.g. "For Agents") as before.
- Add a "Download" button:
  - On click, call the existing `increment_skill_download(skill_slug)` database function to bump the count.
  - Then trigger a direct file download from `file_url`.
  - For now every skill is free, so the button label is always "Download". The component will read `access_level` and `price` so a paid label (e.g. "$9.00") can be wired in later without further structural changes.
- Keep the existing `surface-card` dark card styling.

### 2. Wire up live data in `SkillsPage` (`src/pages/SkillsPage.tsx`)
- Add a `useState` + `useEffect` fetch from `supabase.from('skills')`:
  - Filter: `is_published === true`
  - Order: `sort_order` ascending
- Remove the local `const skills = [...]` hardcoded array.
- In the "What's coming" section:
  - Change `<SectionLabel>` text from "What's coming" to "Available skills"
  - Map the fetched rows to `<SkillPreviewCard>` instead of the static array.
  - Show a loading state while fetching.
- Leave every other section untouched: hero, how-it-works, email capture, submit callout, footer newsletter.

### 3. No database or storage changes
- The `skills` table, RLS policies, and `increment_skill_download` function already exist from earlier work. No new migrations or buckets are needed.

## Files to modify
- `src/components/skills/SkillPreviewCard.tsx`
- `src/pages/SkillsPage.tsx`