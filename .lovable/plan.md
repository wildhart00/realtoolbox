## Skills — database + storage only

Scope: one migration. No page/UI/nav changes.

### 1. Table `public.skills`

Columns as specified. Validation via CHECK constraints on `audience`, `tier`, `access_level` (immutable, safe — no time-based checks).

```sql
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  audience text NOT NULL CHECK (audience IN ('agent','investor','both')),
  tier text NOT NULL CHECK (tier IN ('quick_tool','workflow','business_system')),
  access_level text NOT NULL CHECK (access_level IN ('free','paid')),
  price numeric NOT NULL DEFAULT 0,
  file_url text,
  download_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 2. GRANTs (required for Data API)

```sql
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
```

### 3. RLS

- Enable RLS.
- `SELECT` policy (public): `is_published = true OR has_role(auth.uid(),'admin')`.
- `ALL` policy (authenticated): `has_role(auth.uid(),'admin')` for both USING and WITH CHECK.

### 4. `updated_at` trigger

Reuse existing `public.update_updated_at_column()` — attach `BEFORE UPDATE` trigger on `skills`.

### 5. Function `increment_skill_download(skill_slug text)`

`SECURITY DEFINER`, `search_path = public`, atomic update returning new count. Only increments rows where `is_published = true`. Returns `integer` (or `NULL` if no match).

```sql
CREATE OR REPLACE FUNCTION public.increment_skill_download(skill_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_count integer;
BEGIN
  UPDATE public.skills
    SET download_count = download_count + 1
    WHERE slug = skill_slug AND is_published = true
    RETURNING download_count INTO new_count;
  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_skill_download(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_skill_download(text) TO anon, authenticated;
```

Note: the linter will flag "Signed-In Users Can Execute SECURITY DEFINER Function" — this is intentional (downloads happen pre-login) and will be documented in project memory.

### 6. Storage bucket `skill-files`

- Create public bucket `skill-files`.
- Policies on `storage.objects`:
  - Public SELECT where `bucket_id = 'skill-files'`.
  - Admin-only INSERT/UPDATE/DELETE where `bucket_id = 'skill-files' AND has_role(auth.uid(),'admin')`.

### Out of scope
No pages, components, routes, nav, or edits to existing tables.
