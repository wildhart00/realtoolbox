-- Fix 1: tighten click_events INSERT policy
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.click_events;

CREATE POLICY "Anyone can log clicks"
ON public.click_events
FOR INSERT
TO anon, authenticated
WITH CHECK (tool_id IS NOT NULL AND tool_slug IS NOT NULL AND tool_slug != '');

-- Fix 2: tighten newsletter_subscribers INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND email != ''
  AND email ~* '^[^@]+@[^@]+\.[^@]+$'
);