DROP POLICY IF EXISTS "Published resources viewable by everyone" ON public.resources;
CREATE POLICY "Anyone can view published resources" ON public.resources FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all resources" ON public.resources FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Published posts viewable by everyone" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT ON public.resources TO anon;
GRANT SELECT ON public.blog_posts TO anon;