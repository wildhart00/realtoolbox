## Problem

The previous security fix revoked the entire table-level `SELECT` on `public.skills` from `anon` and `authenticated` in order to hide `file_url`. Verified via `information_schema.role_table_grants` and `column_privileges`: only `sandbox_exec` has any privilege on `skills`. That killed every read path that goes through the anon/authenticated key, including MCP `get_skill` (returns "permission denied for table skills"). Listing pages still render only because their queries currently succeed against cached data or a different code path — the hole is broader than reported.

## Fix

### Migration

Restore SELECT on every column of `public.skills` **except `file_url`** for both `anon` and `authenticated`. This is what the original security fix intended — protect only the storage-path column, not the whole table.

```sql
-- Grant SELECT on all non-sensitive columns to anon and authenticated
GRANT SELECT (
  id, name, slug, tagline, description, audience, tier, access_level, price,
  download_count, is_published, sort_order, overview, toolbox,
  created_at, updated_at
) ON public.skills TO anon, authenticated;

-- service_role keeps ALL (includes file_url) — already granted, but assert:
GRANT ALL ON public.skills TO service_role;
```

`file_url` is deliberately omitted, so `SELECT file_url FROM skills` as anon/authenticated still fails. INSERT/UPDATE/DELETE remain governed by existing RLS policies + table grants (admin path unaffected; admins are `authenticated` and go through admin UI which relies on RLS + service role where needed — verify in step below).

### Server-side code — file_url reads must use service role

`supabase/functions/get-skill-content/index.ts` already uses `admin` (service role) to read `file_url` — no change.

`src/lib/mcp/tools/get-skill.ts` currently selects `file_url` via `anonClient()`. That will now fail (column not granted). Switch that single select to `adminClient()` so it can read `file_url` server-side. Public metadata is fine either way, but consolidating on admin for this one query is simplest and doesn't leak anything — `file_url` is stripped from the outbound payload before response (already the case at line 78/103).

Everything else in `get-skill.ts` stays: entitlement check still uses `userClient(ctx)`, download still uses `adminClient()`.

`src/lib/mcp/tools/search-skills.ts` does not select `file_url` — unchanged.

### Client-side code

The four client selects (`ToolboxIndexPage`, `InvestorToolboxPage`, `SkillDetailPage`, `SkillsHomeSection`, plus `SkillPreviewCard`) were already narrowed in the prior turn to exclude `file_url`. No further changes.

### Verification (all five, executed live)

1. Anon direct storage fetch of a paid skill file → expect 400/403.
2. Anon `select file_url from skills` via PostgREST → expect permission-denied on column.
3. Anon select of public columns (`slug,name,tagline,access_level,...`) → expect 200 with rows.
4. Authenticated entitled user calling MCP `get_skill` for a paid skill → expect `content` populated in structured output.
5. Authenticated non-purchaser calling MCP `get_skill` for a paid skill → expect `locked: true`, no `content`.

Report each result with status code / response shape.

## Files touched

- New migration (grants only).
- `src/lib/mcp/tools/get-skill.ts` — swap the initial skill lookup from `anonClient()` to `adminClient()`. The regenerated `supabase/functions/mcp/index.ts` bundle picks this up automatically.

## Out of scope

- No changes to storage policies (the earlier fix locked `skill-files` to service_role — correct, keep).
- No admin UI changes.
- No RLS policy changes on `skills`.
