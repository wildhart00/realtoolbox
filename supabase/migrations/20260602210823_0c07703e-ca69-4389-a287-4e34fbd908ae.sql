GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;