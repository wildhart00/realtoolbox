-- Restrict has_role SECURITY DEFINER function: anonymous users cannot call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Remove broad SELECT policy on storage.objects for the public blog-images bucket.
-- The bucket is public, so direct file URLs continue to work via the Storage public
-- endpoint; dropping this policy prevents authenticated/anon clients from listing all
-- objects in the bucket.
DROP POLICY IF EXISTS "Public read blog-images" ON storage.objects;