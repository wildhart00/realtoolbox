import Stripe from "npm:stripe@17";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return _stripe;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) {
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create the All-Access product (idempotent by metadata key)
    const products = await stripe.products.search({
      query: "metadata['app_key']:'all_access'",
      limit: 1,
    });
    let product = products.data[0];
    if (!product) {
      product = await stripe.products.create({
        name: "All-Access",
        description: "Full operator toolkit — every real estate skill, plus new ones every month.",
        metadata: { app_key: "all_access" },
      });
    }

    const ensurePrice = async (
      lookup_key: string,
      unit_amount: number,
      interval: "month" | "year",
    ) => {
      const existing = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1, active: true });
      if (existing.data[0]) return existing.data[0];
      return await stripe.prices.create({
        product: product!.id,
        unit_amount,
        currency: "usd",
        recurring: { interval },
        lookup_key,
        nickname: lookup_key,
      });
    };

    const monthly = await ensurePrice("all_access_monthly", 3900, "month");
    const annual = await ensurePrice("all_access_annual", 39000, "year");

    return new Response(
      JSON.stringify({
        product_id: product.id,
        monthly_price_id: monthly.id,
        annual_price_id: annual.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("stripe-bootstrap error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
