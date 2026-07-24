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

async function ensureProduct(app_key: string, name: string, description: string) {
  const found = await getStripe().products.search({
    query: `metadata['app_key']:'${app_key}'`,
    limit: 1,
  });
  if (found.data[0]) return found.data[0];
  return await getStripe().products.create({
    name,
    description,
    metadata: { app_key },
  });
}

async function ensureOneTimePrice(
  productId: string,
  lookup_key: string,
  unit_amount: number,
) {
  const existing = await getStripe().prices.list({
    lookup_keys: [lookup_key],
    limit: 1,
    active: true,
  });
  if (existing.data[0]) return existing.data[0];
  return await getStripe().prices.create({
    product: productId,
    unit_amount,
    currency: "usd",
    lookup_key,
    nickname: lookup_key,
    // No `recurring` -> one-time price
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) {
      return json({ error: "STRIPE_SECRET_KEY not set" }, 500);
    }

    const investor = await ensureProduct(
      "investor_toolbox",
      "Investor Toolbox",
      "The complete real estate investor skill pack — every investor skill, one-time purchase.",
    );
    const complete = await ensureProduct(
      "complete_toolbox",
      "Complete Toolbox",
      "Every RealToolbox skill — investor and agent — bundled. One-time purchase.",
    );

    const investorFounding = await ensureOneTimePrice(
      investor.id,
      "investor_toolbox_founding",
      7900,
    );
    const investorRegular = await ensureOneTimePrice(
      investor.id,
      "investor_toolbox_regular",
      9900,
    );
    const completeFounding = await ensureOneTimePrice(
      complete.id,
      "complete_toolbox_founding",
      14900,
    );

    return json({
      investor_toolbox: {
        product_id: investor.id,
        founding_price_id: investorFounding.id,
        regular_price_id: investorRegular.id,
      },
      complete_toolbox: {
        product_id: complete.id,
        founding_price_id: completeFounding.id,
      },
    });
  } catch (err) {
    console.error("stripe-bootstrap error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
