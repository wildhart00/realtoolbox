
DROP POLICY IF EXISTS "Skill files are publicly readable" ON storage.objects;

CREATE POLICY "Skill files service role only"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'skill-files');

REVOKE SELECT (file_url) ON public.skills FROM anon;
