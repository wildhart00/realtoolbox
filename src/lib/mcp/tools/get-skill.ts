import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}


function userClient(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
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

function pathFromFileUrl(fileUrl: string): string | null {
  const m = fileUrl.match(/\/skill-files\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default defineTool({
  name: "get_skill",
  title: "Get skill",
  description:
    "Fetch a full skill by slug. Metadata and `overview` (marketing description) are public. For entitled callers (free skills, or paid skills where the signed-in user has purchased the matching toolbox or the Complete Toolbox), the actual skill markdown is returned in `content`. Otherwise `content` is omitted and a `locked` flag is set.",
  inputSchema: {
    slug: z.string().min(1).describe("The skill slug, e.g. 'deal-screen'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    // Use service role: file_url column is not readable by anon/authenticated.
    const supabase = adminClient();
    const { data: skill, error } = await supabase
      .from("skills")
      .select("slug,name,tagline,description,tier,access_level,price,overview,toolbox,file_url")
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

    // Strip file_url from the outbound shape regardless of state.
    const { file_url, ...meta } = skill as typeof skill & { file_url: string | null };

    let payload: Record<string, unknown>;
    if (unlocked) {
      let content: string | null = null;
      let content_error: string | null = null;
      const path = file_url ? pathFromFileUrl(file_url) : null;
      if (!file_url) {
        content_error = "no_file";
      } else if (!path) {
        content_error = "bad_file_url";
      } else {
        const { data: blob, error: dlErr } = await adminClient()
          .storage.from("skill-files")
          .download(path);
        if (dlErr || !blob) {
          content_error = "download_failed";
        } else {
          content = await blob.text();
        }
      }
      payload = { ...meta, content, ...(content_error ? { content_error } : {}) };
    } else {
      payload = {
        ...meta,
        locked: true,
        required_toolbox: requiredToolbox,
        unlock_hint:
          "Requires a one-time toolbox purchase. Sign in and buy the matching Toolbox at https://realtoolbox.ai to unlock.",
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
