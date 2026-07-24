import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return _stripe;
}

type ToolboxInput = "investor" | "complete";
type Tier = "founding" | "regular";

function lookupKeyFor(toolbox: ToolboxInput, tier: Tier): string | null {
  if (toolbox === "investor") {
    return tier === "regular" ? "investor_toolbox_regular" : "investor_toolbox_founding";
  }
  if (toolbox === "complete") {
    // Only founding exists today
    return "complete_toolbox_founding";
  }
  return null;
}

function toolboxSlugFor(toolbox: ToolboxInput): string {
  return toolbox === "investor" ? "investor_toolbox" : "complete_toolbox";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;
    const email = claimsData.claims.email as string | undefined;

    const body = await req.json().catch(() => ({}));
    const toolboxRaw = body?.toolbox;
    const tierRaw = body?.tier;
    if (toolboxRaw !== "investor" && toolboxRaw !== "complete") {
      return json({ error: "invalid_toolbox", message: "toolbox must be 'investor' or 'complete'" }, 400);
    }
    const tier: Tier = tierRaw === "regular" ? "regular" : "founding";
    const toolbox: ToolboxInput = toolboxRaw;
    const lookup_key = lookupKeyFor(toolbox, tier);
    if (!lookup_key) return json({ error: "invalid_selection" }, 400);
    const toolbox_slug = toolboxSlugFor(toolbox);

    const origin = req.headers.get("origin") ?? "https://realtoolbox.ai";

    // Look up price by lookup_key
    const prices = await getStripe().prices.list({
      lookup_keys: [lookup_key],
      limit: 1,
      active: true,
    });
    const price = prices.data[0];
    if (!price) {
      return json({ error: `Price ${lookup_key} not found. Run stripe-bootstrap first.` }, 500);
    }

    // Service role: look up any existing Stripe customer for this user
    // (from either the deprecated subscriptions table or an existing purchase).
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let customerId: string | undefined;

    const { data: existingPurchase } = await admin
      .from("purchases")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();
    customerId = (existingPurchase?.stripe_customer_id as string | undefined) ?? undefined;

    if (!customerId) {
      const { data: existingSub } = await admin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();
      customerId = (existingSub?.stripe_customer_id as string | undefined) ?? undefined;
    }

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: price.id, quantity: 1 }],
      payment_intent_data: {
        metadata: {
          supabase_user_id: userId,
          toolbox_slug,
          tier,
        },
      },
      metadata: {
        supabase_user_id: userId,
        toolbox_slug,
        tier,
      },
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
