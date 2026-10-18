import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function DormantEngineStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Backend status not read — sign-in required");
  useEffect(() => {
    if (!user) return;
    let active = true;
    setStatus("Reading backend status…");
    Promise.all([
      supabase.from("update_engine_settings").select("paused,template_auto_publish_tested").maybeSingle(),
      supabase.from("update_sources").select("id", { count: "exact", head: true }).eq("enabled", true),
    ]).then(([settings, sources]) => {
      if (!active) return;
      if (settings.error || sources.error) { setStatus("Backend status unavailable — access denied or read failed"); return; }
      if (!settings.data) { setStatus("Settings missing — engine fails closed"); return; }
      setStatus(`Backend readback: ${settings.data.paused ? "paused" : "not paused"} · automatic publication policy ${settings.data.template_auto_publish_tested ? "tested" : "not tested"} · ${sources.count ?? "unknown"} enabled sources`);
    }).catch(() => { if (active) setStatus("Backend status unavailable — read failed"); });
    return () => { active = false; };
  }, [user]);
  return <div className="border-y py-3 text-sm space-y-1"><p role="status">{status}</p><p className="text-muted-foreground">Read-only status. No discovery provider, worker or schedule is connected by this preview.</p></div>;
}