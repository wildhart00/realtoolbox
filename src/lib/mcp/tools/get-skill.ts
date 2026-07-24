import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function anonClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function userClient(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

function requiredToolboxFor(skillToolbox: string | null | undefined) {
  if (skillToolbox === "investor") return "investor_toolbox";
  if (skillToolbox === "agent") return "agent_toolbox";
  return null;
}

export default defineTool({
  name: "get_skill",
  title: "Get skill",
  description:
    "Fetch a full skill by slug. Metadata is public. The `overview` (full markdown skill content) is included for free skills, or for paid skills only when the signed-in user has purchased the toolbox that unlocks it (or the Complete Toolbox). Otherwise a `locked` flag is returned.",
  inputSchema: {
    slug: z.string().min(1).describe("The skill slug, e.g. 'deal-screen'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    const supabase = anonClient();
    const { data: skill, error } = await supabase
      .from("skills")
      .select("slug,name,tagline,description,tier,access_level,price,overview,file_url,toolbox")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!skill) return { content: [{ type: "text", text: `No skill with slug '${slug}'.` }], isError: true };

    const isPaid = skill.access_level === "paid";
    const requiredToolbox = requiredToolboxFor(skill.toolbox);
    let unlocked = !isPaid;

    if (isPaid && requiredToolbox && ctx.isAuthenticated()) {
      const { data: purchases } = await userClient(ctx)
        .from("purchases")
        .select("toolbox_slug, status")
        .eq("user_id", ctx.getUserId())
        .eq("status", "paid");
      const owned = new Set((purchases ?? []).map((p: { toolbox_slug: string }) => p.toolbox_slug));
      unlocked = owned.has("complete_toolbox") || owned.has(requiredToolbox);
    }

    const payload = unlocked
      ? skill
      : {
          ...skill,
          overview: null,
          file_url: null,
          locked: true,
          required_toolbox: requiredToolbox,
          unlock_hint:
            "Requires a one-time toolbox purchase. Sign in and buy the matching Toolbox at https://realtoolbox.ai to unlock.",
        };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
