import { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/hooks/useCheckout";
import { toast } from "sonner";

export function PricingSection() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { startCheckout, loading } = useCheckout();
  const autoTriggered = useRef(false);

  // Auto-resume checkout after returning from /auth?next=/?checkout=investor|complete
  useEffect(() => {
    const target = params.get("checkout");
    if (!target || authLoading || !user || autoTriggered.current) return;
    if (target !== "investor" && target !== "complete") return;
    autoTriggered.current = true;
    params.delete("checkout");
    setParams(params, { replace: true });
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
          body: { toolbox: target, tier: "founding" },
        });
        if (error) throw error;
        if (!data?.url) throw new Error("No checkout URL returned");
        window.location.href = data.url;
      } catch (err) {
        console.error(err);
        toast.error((err as Error).message || "Could not start checkout");
      }
    })();
  }, [user, authLoading, params, setParams]);

  const freeCtaTarget = user ? "/toolbox/deal-screen" : "/auth?mode=signup&next=" + encodeURIComponent("/toolbox/deal-screen?copy=1");

  return (
    <section id="pricing" className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1200 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Pricing
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Own the toolbox that fits how you invest.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          Start free. Buy once. Own it forever — including every new skill we add.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Card 1 — Deal Screen (Free) */}
        <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-transparent">
          <div>
            <h3 className="font-display text-[22px] text-foreground tracking-tight leading-tight">
              Deal Screen
            </h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-bold text-foreground leading-none">$0</span>
              <span className="text-[14px] text-muted-foreground">forever</span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
              Paste in any deal and get a fast, conservative read on whether the numbers actually work.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {[
              "Unlimited deal screens — free forever",
              "Conservative, operator-grade ARV and offer math",
              "Instantly flags deals that don't clear",
              "Runs in ChatGPT, Claude, or Gemini",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                <Check className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-[1px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <Link
              to={freeCtaTarget}
              className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.03] px-5 py-2.5 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.07] transition-base w-full sm:w-auto"
            >
              Start free →
            </Link>
          </div>
        </div>

        {/* Card 2 — Investor Toolbox (featured) */}
        <div className="relative rounded-2xl flex">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]" />
          <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] p-6 lg:p-7 flex flex-col gap-5 flex-1">
            <div>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                Founding Price
              </span>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                Investor Toolbox
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[40px] font-bold text-foreground leading-none">$79</span>
                <span className="text-[14px] text-muted-foreground line-through">$99</span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">One-time payment</p>
              <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                Every investor skill — buy box, deal screening, triage, input auditing, strategy selection, walk-away calls, and full underwriting — yours to keep.
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {[
                "Every investor skill (7 at launch)",
                "Deal Analyzer & Underwriter — your safe offer",
                "Lifetime updates as new investor skills drop",
                "One payment — own it forever",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[1px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => startCheckout("investor", "/")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base w-full sm:w-auto disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
                  </>
                ) : (
                  <>Get the Investor Toolbox → $79</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 — Complete Toolbox */}
        <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-foreground/10">
          <div>
            <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Best Value
            </span>
            <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
              Complete Toolbox
            </h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-bold text-foreground leading-none">$149</span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">One-time payment</p>
            <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
              Everything in Investor plus the Agent Toolbox the day it releases.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {[
              "Every investor skill",
              "Agent Toolbox included free when it releases",
              "Lifetime updates on both",
              "One payment — own it forever",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[1px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <button
              type="button"
              onClick={() => startCheckout("complete", "/")}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-5 py-2.5 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base w-full sm:w-auto disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
                </>
              ) : (
                <>Get the Complete Toolbox → $149</>
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[12.5px] text-muted-foreground/70">
        One-time payment. Founding-member pricing won&apos;t last.
      </p>
    </section>
  );
}
