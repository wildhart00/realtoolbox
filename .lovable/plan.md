## Plan

1. **Inventory and map every object in `skill-files`**
   - Use the current storage object list as the source of truth.
   - Include every object in the bucket, including the published `setup-guide` file and older orphaned skill files.
   - Generate fresh, non-predictable destination paths using a random folder segment plus random filename suffix.

2. **Copy first, then update database references**
   - Copy each existing object to its new randomized path inside the same private bucket.
   - Update every `skills.file_url` value that points at an affected old object so it points at the new object path.
   - Confirm `setup-guide` is updated the same way because it is stored in `skill-files`.

3. **Delete old storage objects**
   - After the database points at the new paths, delete the old objects from storage.
   - Keep a local audit log of `old_path -> new_path` mappings for verification and reporting.

4. **Verify anonymous access with actual counts**
   - Pick a published paid skill that has a rotated file.
   - Run **25 unauthenticated requests** against the paid skill’s **old public object URL**.
   - Run **25 unauthenticated requests** against that paid skill’s **new public object URL**.
   - Report exact counts by status/content result, for example: `old path: 0 content / 25 blocked`, `new path: 0 content / 25 blocked`, with the actual HTTP distribution.

5. **Verify entitled delivery still works**
   - Confirm `get-skill-content` resolves the rotated `file_url` from the database and returns full markdown for an entitled purchaser.
   - Confirm MCP `get_skill` resolves the rotated `file_url` and returns `content` for an entitled caller.
   - If the current preview session is not an entitled purchaser, I’ll complete the storage/security verification and report that the final purchaser/MCP check needs an entitled login session before it can be truthfully confirmed.

6. **Report results**
   - Provide the exact anonymous request counts for old and new paths.
   - Confirm the number of storage objects rotated and the number of skill rows updated.
   - Confirm whether `setup-guide` was included.