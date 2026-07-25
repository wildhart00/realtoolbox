GRANT SELECT (
  id, name, slug, tagline, description, audience, tier, access_level, price,
  download_count, is_published, sort_order, overview, toolbox,
  created_at, updated_at
) ON public.skills TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;