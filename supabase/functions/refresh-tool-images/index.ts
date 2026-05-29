// Admin-only: scrape each tool's website via Firecrawl, store screenshot in
// the tool-logos bucket, and update hero_image_url + banner_color (+logo_url).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL_URL = "https://api.firecrawl.dev/v2/scrape";
const BUCKET = "tool-logos";

interface Tool {
  id: string;
  slug: string;
  website_url: string;
  logo_url: string | null;
}

async function scrapeOne(apiKey: string, url: string) {
  const res = await fetch(FIRECRAWL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["screenshot", "branding"],
      onlyMainContent: true,
      waitFor: 2500,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  // v2 wraps in { success, data: {...} }
  return json.data ?? json;
}

async function uploadScreenshot(
  admin: ReturnType<typeof createClient>,
  slug: string,
  screenshotUrl: string,
): Promise<string | null> {
  try {
    const imgRes = await fetch(screenshotUrl);
    if (!imgRes.ok) return null;
    const blob = new Uint8Array(await imgRes.arrayBuffer());
    const path = `hero/${slug}-${Date.now()}.png`;
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) {
      console.error("upload failed", slug, error.message);
      return null;
    }
    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error("upload exception", slug, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const onlyMissing: boolean = !!body.onlyMissing;
    const toolIds: string[] | undefined = body.toolIds;
    const limit: number = Math.max(1, Math.min(50, Number(body.limit) || 8));
    const offset: number = Math.max(0, Number(body.offset) || 0);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    let countQuery = admin
      .from("tools")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    if (toolIds?.length) countQuery = countQuery.in("id", toolIds);
    if (onlyMissing) countQuery = countQuery.is("hero_image_url", null);
    const { count: totalCount } = await countQuery;

    let query = admin
      .from("tools")
      .select("id,slug,website_url,logo_url,hero_image_url")
      .eq("status", "published")
      .order("slug", { ascending: true })
      .range(offset, offset + limit - 1);
    if (toolIds?.length) query = query.in("id", toolIds);
    if (onlyMissing) query = query.is("hero_image_url", null);
    const { data: tools, error } = await query;
    if (error) throw error;

    const results: Array<{ slug: string; ok: boolean; error?: string }> = [];

    // Process sequentially to be gentle on Firecrawl credits/rate-limits.
    for (const tool of (tools ?? []) as Tool[]) {
      try {
        const data = await scrapeOne(FIRECRAWL_API_KEY, tool.website_url);
        const screenshot: string | undefined = data.screenshot ?? data.screenshotUrl;
        const branding = data.branding ?? {};
        const primary: string | undefined =
          branding.colors?.primary ??
          branding.colors?.background ??
          undefined;
        const brandLogo: string | undefined =
          branding.images?.logo ?? branding.logo ?? undefined;

        const update: Record<string, unknown> = {};
        if (screenshot) {
          const publicUrl = await uploadScreenshot(admin, tool.slug, screenshot);
          if (publicUrl) update.hero_image_url = publicUrl;
        }
        if (primary && /^#[0-9a-fA-F]{6}$/.test(primary)) {
          update.banner_color = primary;
        }
        if (!tool.logo_url && brandLogo) {
          update.logo_url = brandLogo;
        }

        if (Object.keys(update).length) {
          await admin.from("tools").update(update).eq("id", tool.id);
        }
        results.push({ slug: tool.slug, ok: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("scrape failed", tool.slug, msg);
        results.push({ slug: tool.slug, ok: false, error: msg });
      }
    }

    const ok = results.filter((r) => r.ok).length;
    return new Response(
      JSON.stringify({ processed: results.length, succeeded: ok, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
