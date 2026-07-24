import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_skills",
  title: "Search skills",
  description:
    "Search or browse published real estate AI skills in the RealToolbox.ai library. Returns skill metadata (name, slug, tagline, tier, access_level, price). Use get_skill to retrieve full content for a specific skill.",
  inputSchema: {
    query: z
      .string()
      .optional()
      .describe("Optional search text matched against skill name, tagline, and description."),
    tier: z
      .string()
      .optional()
      .describe("Optional tier filter (e.g. 'free', 'pro')."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, tier, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("skills")
      .select("slug,name,tagline,description,tier,access_level,price,download_count")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(limit ?? 20);
    if (tier) q = q.eq("tier", tier);
    if (query && query.trim()) {
      const t = query.trim();
      q = q.or(`name.ilike.%${t}%,tagline.ilike.%${t}%,description.ilike.%${t}%`);
    }
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { skills: data ?? [] },
    };
  },
});
