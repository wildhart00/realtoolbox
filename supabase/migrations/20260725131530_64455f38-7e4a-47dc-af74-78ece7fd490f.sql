
REVOKE ALL ON public.skills FROM anon;

GRANT SELECT (
  id, name, slug, tagline, description, overview, audience,
  tier, access_level, price, toolbox, download_count,
  is_published, sort_order, created_at, updated_at
) ON public.skills TO anon;
