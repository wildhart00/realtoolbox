import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useEntitlements, type ToolboxSlug } from "@/hooks/useEntitlements";

const TOOLBOX_LABELS: Record<ToolboxSlug, string> = {
  investor_toolbox: "Investor Toolbox",
  agent_toolbox: "Agent Toolbox",
  complete_toolbox: "Complete Toolbox",
};

const TOOLBOX_BLURB: Record<ToolboxSlug, string> = {
  investor_toolbox: "Every investor skill is now unlocked on your account.",
  agent_toolbox: "Every agent skill is now unlocked on your account.",
  complete_toolbox: "Every RealToolbox skill — investor and agent — is now unlocked.",
};

const WelcomePage = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { purchases, ownedToolboxes, loading, refetch } = useEntitlements();
  const [waited, setWaited] = useState(0);

  const purchased: ToolboxSlug | null = useMemo(() => {
    if (sessionId) {
      const match = purchases.find((p) => p.stripe_session_id === sessionId);
      if (match) return match.toolbox_slug;
    }
    if (ownedToolboxes.has("complete_toolbox")) return "complete_toolbox";
    if (ownedToolboxes.has("investor_toolbox")) return "investor_toolbox";
    if (ownedToolboxes.has("agent_toolbox")) return "agent_toolbox";
    return null;
  }, [sessionId, purchases, ownedToolboxes]);

  useEffect(() => {
    if (purchased) return;
    const id = setInterval(() => {
      refetch();
      setWaited((w) => w + 1);
    }, 1500);
    return () => clearInterval(id);
  }, [purchased, refetch]);

  return (
    <AppLayout hideSidebar>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          {purchased ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
                <CheckCircle2 className="h-9 w-9 text-accent" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
                You&apos;re in.
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.14em] text-accent/80 font-semibold">
                {TOOLBOX_LABELS[purchased]}
              </p>
              <p className="mt-3 text-muted-foreground">
                {TOOLBOX_BLURB[purchased]}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="accent" size="lg">
                  <Link to="/skills">
                    <Sparkles className="h-4 w-4" /> Browse the skills
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Back home</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
              <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
                Finalizing your purchase…
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Stripe is confirming the payment. This usually takes a few seconds.
              </p>
              {waited > 8 && !loading && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Taking longer than expected? Refresh the page in a moment, or{" "}
                  <Link to="/contact" className="text-accent underline">
                    contact support
                  </Link>
                  .
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WelcomePage;
