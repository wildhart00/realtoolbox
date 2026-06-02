DROP POLICY IF EXISTS "Published integrations viewable by everyone" ON public.integrations;

CREATE POLICY "Anyone can view published integrations"
ON public.integrations
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can view all integrations"
ON public.integrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));