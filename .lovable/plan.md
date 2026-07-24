## Fixes

### 1. `src/lib/mcp/tools/get-skill.ts` (MCP tool)

- Drop `file_url` from the `select(...)` and from every response shape.
- Add a service-role client (`process.env.SUPABASE_SERVICE_ROLE_KEY`) used only to download from the private `skill-files` bucket. Keep the anon client for the metadata read and the user-scoped client for the purchases check.
- For entitled callers (free skills, or paid skills where the caller owns the matching toolbox or `complete_toolbox`):
  - Look up the storage path from the skill's `file_url` server-side (never returned), using the same `/skill-files/(.+)$` parsing as `get-skill-content`.
  - Download the object via service role, read as text, and return it in a new `content` field.
  - Keep `overview` (marketing markdown) and all other metadata as separate fields.
  - If the skill has no file or download fails, return `content: null` with a `content_error` note; metadata/overview still flow.
- For locked callers: unchanged shape — metadata + `overview` + `locked: true` + `required_toolbox` + `unlock_hint`, no `content`, no `file_url`.
- Update the tool description to reflect that `content` is the real skill markdown and `overview` is marketing copy.

### 2. `supabase/functions/get-skill-content/index.ts` (website "Copy skill")

Re-read confirms this function already downloads the file from the `skill-files` bucket via service role and returns its text as `content` — it does NOT return the overview. No change needed here; the website's Copy button is already correct.

### 3. Manifest

Regenerate `.lovable/mcp/manifest.json` via `app_mcp_server--extract_mcp_manifest` after editing the tool.

## Verification

- Ask the user to retry `get_skill` in Claude for (a) a free skill, (b) an owned paid skill, (c) a locked paid skill, and confirm: no `file_url` in any response; `content` present only in a+b and contains the real skill markdown (not the overview blurb).
