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

function mapStatus(s: string): string {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}

function planFromLookupKey(key: string | null | undefined): string | null {
  if (key === "all_access_monthly" || key === "all_access_annual") return key;
  return null;
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
    const customer = await stripe.customers.retrieve(customerId);
    if (!("deleted" in customer) || !customer.deleted) {
      const uid = (customer as Stripe.Customer).metadata?.supabase_user_id;
      if (uid) return uid;
    }
  }
  return null;
}

async function upsertFromSubscription(sub: Stripe.Subscription, userId: string) {
  const item = sub.items.data[0];
  const lookupKey = (item?.price?.lookup_key as string | null | undefined) ?? null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        plan: planFromLookupKey(lookupKey),
        status: mapStatus(sub.status),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      },
      { onConflict: "user_id" },
    );
  if (error) console.error("upsert subscription error:", error);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });
  if (!webhookSecret) return new Response("webhook secret not configured", { status: 500 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("signature verification failed:", (err as Error).message);
    return new Response(`bad signature: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = await resolveUserId({ session });
        if (!userId) {
          console.error("no user id on checkout.session.completed", session.id);
          break;
        }
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertFromSubscription(sub, userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId({ subscription: sub });
        if (!userId) {
          console.error("no user id on", event.type, sub.id);
          break;
        }
        await upsertFromSubscription(sub, userId);
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
