## Root cause

All three MCP tool calls fail synchronously (~0.3ms, `stack: "supabase"`) inside `createClient(...)`. The tools read `process.env.SUPABASE_PUBLISHABLE_KEY`, but the Supabase Edge Function runtime only auto-injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL`. Custom secrets prefixed with `SUPABASE_` cannot be set by users, so `SUPABASE_PUBLISHABLE_KEY` is `undefined` at runtime and `createClient(url, undefined)` throws "supabaseKey is required." before any DB call runs.

This is why even public `search_skills` fails — it's not gating, it's client construction.

## Fix

Swap every tool to `SUPABASE_ANON_KEY`, which the runtime always injects. RLS behavior is identical (anon key + optional user Bearer for RLS-scoped reads).

Files to edit:
- `src/lib/mcp/tools/search-skills.ts`
- `src/lib/mcp/tools/get-skill.ts` (both `anonClient` and `userClient`)
- `src/lib/mcp/tools/get-my-purchases.ts`
- `src/lib/mcp/tools/list-integrations.ts` (same pattern, keep consistent)

Change: `process.env.SUPABASE_PUBLISHABLE_KEY!` → `process.env.SUPABASE_ANON_KEY!`

## Deploy + verify

1. Regenerate manifest with `app_mcp_server--extract_mcp_manifest` (rebundles the emitted function source).
2. Deploy the `mcp` edge function.
3. Verify via `supabase--curl_edge_functions` against `/functions/v1/mcp`:
   - **search_skills** (unauth + authed) → returns skill list.
   - **get_my_purchases** (authed as the signed-in test user `9d2644e1…`) → `owned_toolboxes: ["investor_toolbox"]`.
   - **get_skill** for an investor paid skill authed as that user → returns `overview`; anonymous call returns `locked: true`.
4. Check `edge_function_logs` for `mcp` → expect `outcome: "ok"` on each `tool.invoked` line.

No schema or entitlement-logic changes; the purchases table and gating code are correct — only the Supabase client env var name is wrong.