
-- Remove broad SELECT policies on public buckets that allow listing all files.
-- Files in public buckets are still directly accessible via their public URLs.
DROP POLICY IF EXISTS "Tool logos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
