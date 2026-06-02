DROP POLICY IF EXISTS "Published skills viewable by everyone" ON public.skills;

CREATE POLICY "Anyone can view published skills"
ON public.skills
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can view all skills"
ON public.skills
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));