import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_my_purchases",
  title: "Get my purchases",
  description:
    "Return the signed-in user's RealToolbox.ai toolbox purchases (owned toolboxes and purchase history). Requires an authenticated caller.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data, error } = await supabase
      .from("purchases")
      .select("toolbox_slug, status, purchased_at")
      .eq("user_id", ctx.getUserId())
      .eq("status", "paid");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const purchases = data ?? [];
    const owned_toolboxes = purchases.map((p) => p.toolbox_slug as string);
    const payload = { owned_toolboxes, purchases };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
