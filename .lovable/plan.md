## Confirmed
- Local HEAD: `6aa8dfc` — "fix: remove dead /members links from the signed-in menus" ✓
- `src/lib/mcp/index.ts` and generated `supabase/functions/mcp/index.ts` carry identical `instructions` text, so the bundle already reflects the latest source.

## Steps
1. Deploy the `mcp` edge function via `supabase--deploy_edge_functions` (`function_names: ["mcp"]`) so connected MCP clients receive the updated `instructions` string on their next handshake.
2. Run `preview_ui--publish` to ship the frontend at commit `6aa8dfc`.
3. Report the published URL and confirm the `mcp` function redeploy succeeded.

No code changes.