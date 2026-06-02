GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.tool_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_categories TO authenticated;
GRANT ALL ON public.tool_categories TO service_role;