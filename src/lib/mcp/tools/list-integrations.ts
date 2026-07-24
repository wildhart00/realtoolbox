import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_integrations",
  title: "List integrations",
  description:
    "List published integrations in the RealToolbox.ai directory (MCP servers and other tools that connect AI assistants to real estate workflows). Optionally filter by category.",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Optional category slug: property-data, crm, communication, productivity, content-creation, automation, developer."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("integrations")
      .select("name,slug,tagline,category,difficulty,setup_url")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { integrations: data ?? [] },
    };
  },
});
