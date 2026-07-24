import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sparkles, ShieldCheck, XCircle } from "lucide-react";

// Local typed wrapper — the supabase.auth.oauth namespace is beta and may not
// be reflected in installed TypeScript defs.
type AuthDetails = {
  redirect_url?: string;
  redirect_to?: string;
  client?: {
    name?: string;
    redirect_uri?: string;
  } | null;
  scope?: string;
  scopes?: string[];
};
const oauthApi = () => (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
    approveAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
    denyAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  };
}).oauth;

export default function OAuthConsentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Authorize app — RealToolbox.ai";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authorizationId) {
      setError("Missing authorization_id.");
      setLoading(false);
      return;
    }
    if (!user) {
      const next = window.location.pathname + window.location.search;
      navigate(`/auth?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }
    let active = true;
    (async () => {
      const { data, error: err } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, user, authLoading, navigate]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  if (loading || authLoading) {
    return (
      <AppLayout hideSidebar>
        <div className="mx-auto max-w-md py-24 text-center text-sm text-muted-foreground">
          Loading authorization request…
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout hideSidebar>
        <div className="mx-auto max-w-md py-16 px-6">
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-3 text-lg font-semibold">Could not load this authorization request</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <AppLayout hideSidebar>
      <div className="mx-auto max-w-md py-16 px-6">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-elevated">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">
            Connect {clientName} to RealToolbox.ai
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>.
            {clientName} will be able to call this app's enabled tools while you are signed in.
          </p>

          <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-accent shrink-0" />
              <p>
                This connection does not bypass your account's permissions or subscription
                limits. Paid skills remain gated by your All-Access status.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="accent" disabled={busy} onClick={() => decide(true)}>
              {busy ? "Working…" : "Approve"}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => decide(false)}>
              Cancel connection
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
