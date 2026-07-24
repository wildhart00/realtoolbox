import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ToolboxInput = "investor" | "complete";

export function useCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function startCheckout(toolbox: ToolboxInput, nextPath = "/") {
    if (!user) {
      const sep = nextPath.includes("?") ? "&" : "?";
      const next = `${nextPath}${sep}checkout=${toolbox}`;
      navigate(`/auth?mode=signup&next=${encodeURIComponent(next)}`);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { toolbox, tier: "founding" },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Could not start checkout");
      setLoading(false);
    }
  }

  return { startCheckout, loading };
}
