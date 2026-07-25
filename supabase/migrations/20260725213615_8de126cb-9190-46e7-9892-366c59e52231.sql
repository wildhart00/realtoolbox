DROP TABLE IF EXISTS public.premium_resources CASCADE;
DROP POLICY IF EXISTS "Members read premium resource files" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload premium resources" ON storage.objects;
DROP POLICY IF EXISTS "Admins update premium resources" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete premium resources" ON storage.objects;
-- bucket deletion handled via Storage API separately