import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function pathFromFileUrl(fileUrl: string): string | null {
  // Matches both .../object/public/skill-files/<path> and .../object/skill-files/<path>
  const m = fileUrl.match(/\/skill-files\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    if (!slug || slug.length > 200) return json({ error: "invalid_slug" }, 400);

    const { data: skill, error: skillErr } = await admin
      .from("skills")
      .select("slug, access_level, file_url, is_published")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (skillErr) return json({ error: "lookup_failed" }, 500);
    if (!skill) return json({ error: "not_found" }, 404);
    if (!skill.file_url) return json({ error: "no_file" }, 404);

    const isPaid = skill.access_level === "paid";

    if (isPaid) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) {
        return json({ error: "auth_required" }, 401);
      }
      const token = authHeader.slice("Bearer ".length);
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser(token);
      if (userErr || !userData?.user) return json({ error: "auth_invalid" }, 401);

      const { data: sub } = await admin
        .from("subscriptions")
        .select("status")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      const status = sub?.status ?? "inactive";
      if (status !== "active" && status !== "trialing") {
        return json({ error: "subscription_required" }, 403);
      }
    }

    const path = pathFromFileUrl(skill.file_url);
    if (!path) return json({ error: "bad_file_url" }, 500);

    const { data: blob, error: dlErr } = await admin.storage
      .from("skill-files")
      .download(path);
    if (dlErr || !blob) return json({ error: "download_failed" }, 500);

    const content = await blob.text();

    // Best-effort download count
    try {
      await admin.rpc("increment_skill_download", { skill_slug: slug });
    } catch (_) { /* ignore */ }

    return json({ content });
  } catch (e) {
    console.error("get-skill-content error", e);
    return json({ error: "internal" }, 500);
  }
});
