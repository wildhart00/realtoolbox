CREATE TABLE public.skill_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  skill_slug text NOT NULL,
  source text NOT NULL DEFAULT 'skill_download',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_subscribers_email_skill_unique UNIQUE (email, skill_slug)
);

GRANT INSERT ON public.skill_subscribers TO anon, authenticated;
GRANT SELECT ON public.skill_subscribers TO authenticated;
GRANT ALL ON public.skill_subscribers TO service_role;

ALTER TABLE public.skill_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe for a skill"
ON public.skill_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND email <> ''
  AND email ~* '^[^@]+@[^@]+\.[^@]+$'
  AND length(email) <= 255
  AND skill_slug IS NOT NULL
  AND skill_slug <> ''
);

CREATE POLICY "Admins read skill subscribers"
ON public.skill_subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_skill_subscribers_skill_slug ON public.skill_subscribers (skill_slug);
CREATE INDEX idx_skill_subscribers_created_at ON public.skill_subscribers (created_at DESC);