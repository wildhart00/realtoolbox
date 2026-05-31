
-- 1. Skills table
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

-- 2. Grants
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;

-- 3. RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published skills viewable by everyone"
  ON public.skills FOR SELECT
  USING (is_published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage skills"
  ON public.skills FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. updated_at trigger
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Download counter function
CREATE OR REPLACE FUNCTION public.increment_skill_download(skill_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
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

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-files', 'skill-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Skill files are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skill-files');

CREATE POLICY "Admins upload skill files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'skill-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update skill files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'skill-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete skill files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'skill-files' AND has_role(auth.uid(), 'admin'));
