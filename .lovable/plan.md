## Security fix: lock down paid skill files

### Problem
- `storage.objects` has a policy "Skill files are publicly readable" allowing anon SELECT on `bucket_id = 'skill-files'`. The bucket is private, but this policy still exposes files via `/object/skill-files/...` to anyone with the anon key.
- `skills.file_url` is anon-readable and selected by four client components, leaking exact storage paths to logged-out visitors.

### Migration (single migration)
1. `DROP POLICY "Skill files are publicly readable" ON storage.objects;`
2. Create replacement scoped to service_role:
   ```sql
   CREATE POLICY "Skill files service role only"
   ON storage.objects FOR SELECT
   TO service_role
   USING (bucket_id = 'skill-files');
   ```
   (Edge functions `get-skill-content` and `mcp` use the service role key — unaffected.)
3. Revoke `file_url` from anon on `public.skills`:
   ```sql
   REVOKE SELECT (file_url) ON public.skills FROM anon;
   ```
   Keep `authenticated` grant intact (admin UI still needs it; entitlement gating happens server-side in edge functions).

### Client code changes (remove `file_url` from selects)
Purely a select-list narrowing — no logic changes. `file_url` is not read by these components (they call `get-skill-content` for actual content).

- `src/pages/ToolboxIndexPage.tsx:44` — drop `file_url` from select.
- `src/pages/InvestorToolboxPage.tsx:70` — drop `file_url` from select.
- `src/pages/SkillDetailPage.tsx:51` — drop `file_url` from select. Also confirm the component doesn't reference `skill.file_url` elsewhere; if it does (e.g. to decide lock state), replace with `access_level`-based check.
- `src/components/home/SkillsHomeSection.tsx:19` — drop `file_url` from select (already not in select list — verify; if `SkillPreviewCard` needs it, remove there too).

Note: `SkillFormDialog.tsx` (admin) legitimately uses `file_url` — leave untouched; admin users are `authenticated` and retain the grant.

### Verification (in build mode, after migration approved)
a. Anonymous storage fetch of a paid file → expect 400/403:
   ```
   curl -H "apikey: <ANON>" "<SUPABASE_URL>/storage/v1/object/skill-files/<paid-skill-path>"
   ```
b. Signed-in purchaser: call `get-skill-content` with their JWT for a paid skill → expect `{ content: "..." }`.
c. MCP `get_skill` for an entitled user → `content` field populated in structured output.

Report all three results back with status codes and content presence.

### Out of scope
- No changes to `get-skill-content` or `mcp` edge functions (they already use service role).
- No admin UI changes.
- No design/UX changes.
