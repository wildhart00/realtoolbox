## Goal

Add `screenshot_url`, `is_just_launched`, `just_launched_date` to `tools`, create a `tool-screenshots` storage bucket, wire admin UI for both, and schedule a daily auto-expire job. Existing `is_featured` / `featured_order` logic stays untouched.

## 1. Database migration

Single migration:

```sql
ALTER TABLE public.tools
  ADD COLUMN screenshot_url text,
  ADD COLUMN is_just_launched boolean NOT NULL DEFAULT false,
  ADD COLUMN just_launched_date timestamptz;

CREATE INDEX idx_tools_just_launched
  ON public.tools (just_launched_date DESC)
  WHERE is_just_launched = true;

-- Storage bucket: public read, admin write
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-screenshots', 'tool-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tool screenshots publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-screenshots');

CREATE POLICY "Admins upload tool screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tool screenshots"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tool screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tool-screenshots' AND has_role(auth.uid(), 'admin'));
```

No new tables → no extra GRANTs needed. Existing `tools` grants cover the new columns.

## 2. Admin — `ToolFormDialog.tsx`

- Extend `ToolRow` with `screenshot_url`, `is_just_launched`, `just_launched_date`.
- Add a **Screenshot** field: file `<input type="file" accept="image/*">` → `supabase.storage.from('tool-screenshots').upload(\`${slug}-${Date.now()}.${ext}\`, file, { upsert: true })` → `getPublicUrl()` → store in `screenshot_url`. Show current image preview with a "Remove" button (sets `screenshot_url = null`).
- Add a **Just Launched** toggle in the flag grid (next to Featured / Editor's pick / Verified / RE-only).
  - On save: if toggle ON and previously OFF → set `is_just_launched=true`, `just_launched_date=new Date().toISOString()`. If OFF → set `is_just_launched=false` (leave `just_launched_date` for audit, or null it — set to null for cleanliness).
- Include all three new fields in the `payload` for both insert and update.
- Do **not** touch existing `is_featured` / `featured_order` controls.

## 3. Admin — `ToolsAdmin.tsx`

In the **Flags** column, add a green `Just Launched` badge alongside the existing `Featured` badge so admins can see both at a glance. No other table changes.

## 4. Scheduled auto-expire

New edge function `supabase/functions/expire-just-launched/index.ts`:

```ts
const { error } = await admin.from('tools')
  .update({ is_just_launched: false })
  .lt('just_launched_date', new Date(Date.now() - 30*24*60*60*1000).toISOString())
  .eq('is_just_launched', true);
```

Uses `SUPABASE_SERVICE_ROLE_KEY`, returns counts. CORS headers, `verify_jwt = false` (default).

Schedule via `supabase--insert` (not migration — contains project-specific URL/key):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'expire-just-launched-daily',
  '0 3 * * *',  -- 03:00 UTC daily
  $$ SELECT net.http_post(
       url := 'https://pcnsuyadfqrmythikwpa.supabase.co/functions/v1/expire-just-launched',
       headers := '{"Content-Type":"application/json","apikey":"<ANON_KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
```

## 5. Out of scope

- The homepage "Just Launched" tab itself — not requested in this message, only the data model + admin + cron. I'll note it as a follow-up so the new flag actually surfaces on the homepage when you're ready.
- `ToolCard` / `FeaturedStrip` rendering of `screenshot_url` — also a follow-up unless you want it now.

## Order of execution

1. Run migration (schema + bucket + storage policies).
2. Write edge function + add cron via `supabase--insert`.
3. Edit `ToolFormDialog.tsx` and `ToolsAdmin.tsx`.

Want me to also include the homepage "Just Launched" tab and screenshot rendering in tool cards as part of this same build, or keep this scoped to schema + admin + cron only?
