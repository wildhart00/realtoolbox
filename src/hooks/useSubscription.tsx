import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Row = {
  status: string;
  plan: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRow(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, plan, current_period_end, stripe_customer_id, stripe_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setRow((data as Row) ?? null);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const status = row?.status ?? "inactive";
  const isActive = status === "active" || status === "trialing";

  return {
    isActive,
    status,
    plan: row?.plan ?? null,
    currentPeriodEnd: row?.current_period_end ?? null,
    loading: authLoading || loading,
    refetch: async () => {
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("status, plan, current_period_end, stripe_customer_id, stripe_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      setRow((data as Row) ?? null);
    },
  };
}
