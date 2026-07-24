import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ToolboxSlug = "investor_toolbox" | "agent_toolbox" | "complete_toolbox";
export type ToolboxKey = "investor" | "agent";

type PurchaseRow = {
  toolbox_slug: ToolboxSlug;
  status: string;
  purchased_at: string;
  stripe_session_id: string | null;
};

export function useEntitlements() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("purchases")
      .select("toolbox_slug, status, purchased_at, stripe_session_id")
      .eq("user_id", uid);
    setRows(((data as PurchaseRow[]) ?? []).filter((r) => r.status === "paid"));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load(user.id);
    })();

    const channel = supabase
      .channel(`purchases:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases", filter: `user_id=eq.${user.id}` },
        () => load(user.id),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, load]);

  const ownedToolboxes = new Set<ToolboxSlug>(rows.map((r) => r.toolbox_slug));
  const hasInvestor = ownedToolboxes.has("investor_toolbox");
  const hasAgent = ownedToolboxes.has("agent_toolbox");
  const hasComplete = ownedToolboxes.has("complete_toolbox");

  const canAccess = (toolbox: ToolboxKey | null | undefined) => {
    if (!toolbox) return false;
    if (hasComplete) return true;
    if (toolbox === "investor") return hasInvestor;
    if (toolbox === "agent") return hasAgent;
    return false;
  };

  return {
    loading: authLoading || loading,
    purchases: rows,
    ownedToolboxes,
    hasInvestor,
    hasAgent,
    hasComplete,
    canAccess,
    refetch: async () => {
      if (user) await load(user.id);
    },
  };
}
