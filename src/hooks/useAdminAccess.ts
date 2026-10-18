import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/** Server-checked, principal-bound gate. Never reuse a prior account's decision. */
export function useAdminAccess() {
  const { user, session, loading } = useAuth();
  const id = user?.id ?? null;
  const token = session?.access_token;
  const [decision, setDecision] = useState<{ id: string; token: string | undefined; allowed: boolean } | null>(null);
  useEffect(() => {
    setDecision(null);
    if (!id || loading) return;
    let active = true;
    Promise.resolve(supabase.rpc("has_role", { _user_id: id, _role: "admin" }))
      .then(({ data, error }) => { if (active) setDecision({ id, token, allowed: !error && data === true }); })
      .catch(() => { if (active) setDecision({ id, token, allowed: false }); });
    return () => { active = false; };
  }, [id, token, loading]);
  const current = !loading && id !== null && decision?.id === id && decision.token === token;
  return { userId: id, sessionToken: token, checking: loading || (!!id && !current), allowed: !!current && decision?.allowed === true };
}
