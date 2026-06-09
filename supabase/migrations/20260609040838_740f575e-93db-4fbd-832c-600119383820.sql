
-- 1) Tighten click_events insert policy with length limits
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.click_events;
CREATE POLICY "Anyone can log clicks"
ON public.click_events
FOR INSERT
WITH CHECK (
  tool_id IS NOT NULL
  AND tool_slug IS NOT NULL
  AND tool_slug <> ''
  AND (user_agent IS NULL OR length(user_agent) <= 512)
  AND (referrer IS NULL OR length(referrer) <= 2048)
);

-- 2) Restrict public read of resources by access_level
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.resources;

CREATE POLICY "Anon can view free published resources"
ON public.resources
FOR SELECT
TO anon
USING (is_published = true AND access_level = 'free');

CREATE POLICY "Authenticated can view published resources"
ON public.resources
FOR SELECT
TO authenticated
USING (is_published = true);
