
-- 1. Protect admin_notes from being read by submitters
-- Revoke column-level SELECT on admin_notes so only service_role can read it
REVOKE SELECT (admin_notes) ON public.submissions FROM authenticated, anon;

-- 2. Restrict tool-logos storage uploads to admins only
DROP POLICY IF EXISTS "Authenticated users upload tool logos" ON storage.objects;
CREATE POLICY "Admins upload tool logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tool-logos' AND public.has_role(auth.uid(), 'admin'));

-- 3. Lock down SECURITY DEFINER functions: revoke EXECUTE from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
