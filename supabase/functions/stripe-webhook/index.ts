import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return _stripe;
}

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (_admin) return _admin;
  _admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  return _admin;
}

async function resolveUserId(opts: {
  session?: Stripe.Checkout.Session;
  subscription?: Stripe.Subscription;
  customerId?: string;
}): Promise<string | null> {
  if (opts.session?.client_reference_id) return opts.session.client_reference_id;
  const sMeta = opts.session?.metadata?.supabase_user_id;
  if (sMeta) return sMeta;
  const subMeta = opts.subscription?.metadata?.supabase_user_id;
  if (subMeta) return subMeta;
  const customerId =
    opts.customerId ??
    (typeof opts.session?.customer === "string" ? opts.session.customer : opts.session?.customer?.id) ??
    (typeof opts.subscription?.customer === "string"
      ? opts.subscription.customer
      : opts.subscription?.customer?.id);
  if (customerId) {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!("deleted" in customer) || !customer.deleted) {
      const uid = (customer as Stripe.Customer).metadata?.supabase_user_id;
      if (uid) return uid;
    }
  }
  return null;
}

function isValidToolboxSlug(v: unknown): v is "investor_toolbox" | "agent_toolbox" | "complete_toolbox" {
  return v === "investor_toolbox" || v === "agent_toolbox" || v === "complete_toolbox";
}

async function recordPurchase(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment") {
    console.log("stripe-webhook: ignoring non-payment session", session.id, session.mode);
    return;
  }
  if (session.payment_status !== "paid") {
    console.log("stripe-webhook: session not paid yet", session.id, session.payment_status);
    return;
  }
  const userId = await resolveUserId({ session });
  if (!userId) {
    console.error("stripe-webhook: no user id on session", session.id);
    return;
  }
  const toolbox_slug = session.metadata?.toolbox_slug;
  if (!isValidToolboxSlug(toolbox_slug)) {
    console.error("stripe-webhook: missing/invalid toolbox_slug on session", session.id, toolbox_slug);
    return;
  }
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { error } = await getAdmin()
    .from("purchases")
    .upsert(
      {
        user_id: userId,
        toolbox_slug,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: session.amount_total ?? null,
        currency: (session.currency ?? "usd").toLowerCase(),
        status: "paid",
        purchased_at: new Date().toISOString(),
      },
      { onConflict: "user_id,toolbox_slug" },
    );
  if (error) console.error("stripe-webhook: upsert purchase error", error);
  else console.log("stripe-webhook: recorded purchase", { userId, toolbox_slug, session: session.id });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  if (!webhookSecret) return new Response("webhook secret not configured", { status: 500 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("signature verification failed:", (err as Error).message);
    return new Response(`bad signature: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Legacy subscription checkouts: inert (subscriptions table is deprecated).
        if (session.mode === "subscription") {
          console.log("stripe-webhook: legacy subscription session ignored", session.id);
          break;
        }
        await recordPurchase(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Legacy events kept inert to avoid 500s on any lingering test data.
        console.log("stripe-webhook: legacy subscription event ignored", event.type);
        break;
      }
      default:
        // ignore other events
        break;
    }
  } catch (err) {
    console.error("handler error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
