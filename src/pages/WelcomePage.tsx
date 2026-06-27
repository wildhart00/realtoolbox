import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

const WelcomePage = () => {
  const { isActive, loading, refetch } = useSubscription();
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    if (isActive) return;
    const id = setInterval(() => {
      refetch();
      setWaited((w) => w + 1);
    }, 1500);
    return () => clearInterval(id);
  }, [isActive, refetch]);

  return (
    <AppLayout hideSidebar>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          {isActive ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
                <CheckCircle2 className="h-9 w-9 text-accent" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
                You&apos;re in.
              </h1>
              <p className="mt-3 text-muted-foreground">
                Your All-Access membership is active. Every skill is unlocked.
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
                Finalizing your membership…
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Stripe is confirming the payment. This usually takes a few seconds.
              </p>
              {waited > 8 && (
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
