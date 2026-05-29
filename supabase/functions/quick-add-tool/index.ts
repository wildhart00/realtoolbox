import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_URL = "https://api.firecrawl.dev/v2/scrape";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, name } = await req.json();
    if (!url || !name) {
      return new Response(JSON.stringify({ error: "url and name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1) Firecrawl scrape (markdown + branding)
    // Retry Firecrawl up to 3 times on transient network errors
    let fcRes: Response | null = null;
    let fcData: any = null;
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        fcRes = await fetch(FIRECRAWL_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown", "branding"],
            onlyMainContent: true,
          }),
        });
        fcData = await fcRes.json();
        if (fcRes.ok) break;
        console.error(`Firecrawl attempt ${attempt} failed:`, fcRes.status, fcData);
        if (fcRes.status < 500 && fcRes.status !== 429) {
          throw new Error(`Firecrawl failed (${fcRes.status}): ${fcData?.error || "unknown"}`);
        }
      } catch (e) {
        lastErr = e;
        console.error(`Firecrawl attempt ${attempt} error:`, e);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
    if (!fcRes || !fcRes.ok) {
      throw new Error(
        `Firecrawl unreachable after 3 attempts: ${
          lastErr instanceof Error ? lastErr.message : `status ${fcRes?.status}`
        }`,
      );
    }

    // v2 SDK shape: top-level markdown/branding; REST may wrap in data
    const doc = fcData.data ?? fcData;
    const markdown: string = doc.markdown ?? "";
    const branding = doc.branding ?? {};
    // Skip obvious favicons so ToolLogo can fall back to Clearbit / apple-touch-icon
    const isFavicon = (u: string | null | undefined) =>
      !!u && (/\.ico($|\?)/i.test(u) || /favicon/i.test(u));
    const candidate =
      branding.images?.logo || branding.logo || branding.images?.ogImage || null;
    const logoUrl = isFavicon(candidate) ? null : candidate;
    const bannerColor =
      branding.colors?.primary || branding.colors?.accent || null;
    const heroImageUrl =
      branding.images?.ogImage || branding.images?.logo || null;

    // Truncate markdown to keep AI fast/cheap
    const content = markdown.slice(0, 8000);

    // 2) Lovable AI structured output
    const aiRes = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You write concise directory listings for AI tools aimed at real estate professionals. Be specific, factual, and avoid marketing fluff.",
          },
          {
            role: "user",
            content: `Tool name: ${name}\nWebsite: ${url}\n\nScraped page content:\n${content}\n\nReturn structured fields describing this tool.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "fill_tool_listing",
              description: "Fill the directory listing fields for this tool.",
              parameters: {
                type: "object",
                properties: {
                  tagline: {
                    type: "string",
                    description: "One short sentence, max 140 chars.",
                  },
                  description: {
                    type: "string",
                    description: "2-3 sentence summary for tool cards.",
                  },
                  full_description: {
                    type: "string",
                    description:
                      "1-2 paragraph in-depth overview for the tool detail page.",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-6 short lowercase tags.",
                  },
                  use_cases: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "3-5 specific use cases for real estate pros.",
                  },
                  key_features: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-6 concrete product features.",
                  },
                },
                required: [
                  "tagline",
                  "description",
                  "full_description",
                  "tags",
                  "use_cases",
                  "key_features",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "fill_tool_listing" },
        },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Settings > Workspace > Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      throw new Error(`AI gateway failed: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall =
      aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolCall) {
      console.error("No tool call in AI response", JSON.stringify(aiData));
      throw new Error("AI returned no structured output");
    }
    const parsed = JSON.parse(toolCall);

    return new Response(
      JSON.stringify({
        ...parsed,
        logo_url: logoUrl,
        banner_color: bannerColor,
        hero_image_url: heroImageUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("quick-add-tool error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
