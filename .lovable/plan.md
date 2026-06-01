# Email-gated skill downloads

## 1. Database — new `skill_subscribers` table

Migration creates:
- `id uuid pk default gen_random_uuid()`
- `email text not null` (with format check)
- `skill_slug text not null`
- `source text not null default 'skill_download'`
- `created_at timestamptz not null default now()`
- Unique constraint on `(email, skill_slug)` so re-downloads upsert cleanly

GRANTs: `INSERT` to anon + authenticated, `ALL` to service_role, `SELECT` to authenticated (gated by admin RLS policy).

RLS:
- Anyone may insert when email matches a basic regex and `skill_slug` is non-empty.
- Only admins may read.

## 2. New `SkillDownloadDialog` component

`src/components/skills/SkillDownloadDialog.tsx` — shadcn `Dialog` styled with the dark premium theme.
- Heading: "Get the skill", subtext referencing the skill name.
- Single email input with zod validation (trim, email, max 255).
- Submit button "Download".
- On submit: `upsert` into `skill_subscribers` on conflict do nothing (swallow unique violations), call `increment_skill_download` RPC, open `file_url` in a new tab, close dialog, show success toast.

## 3. Update `SkillPreviewCard`

Replace the direct-download `handleDownload` with `setOpen(true)`. Render `<SkillDownloadDialog>` controlled locally and pass `slug`, `name`, `file_url`. Keep Download icon and paid-label scaffolding untouched.

## Files
- New migration (table + grants + RLS)
- New `src/components/skills/SkillDownloadDialog.tsx`
- Edit `src/components/skills/SkillPreviewCard.tsx`

No changes to `SkillsPage` sections, hero, or footer newsletter.