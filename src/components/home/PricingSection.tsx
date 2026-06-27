import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PricingSection() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const autoTriggered = useRef(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate(`/auth?mode=signup&next=${encodeURIComponent(`/?checkout=${plan}`)}`);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Could not start checkout");
      setLoading(false);
    }
  };

  // Auto-resume checkout after returning from /auth?next=/?checkout=monthly|annual
  useEffect(() => {
    const target = params.get("checkout");
    if (!target || authLoading || !user || autoTriggered.current) return;
    if (target !== "monthly" && target !== "annual") return;
    autoTriggered.current = true;
    setPlan(target);
    params.delete("checkout");
    setParams(params, { replace: true });
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
          body: { plan: target },
        });
        if (error) throw error;
        if (!data?.url) throw new Error("No checkout URL returned");
        window.location.href = data.url;
      } catch (err) {
        console.error(err);
        toast.error((err as Error).message || "Could not start checkout");
        setLoading(false);
      }
    })();
  }, [user, authLoading, params, setParams]);



  return (
    <section id="pricing" className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Membership
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Start free. Upgrade when it pays for itself.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          Screen any deal for free, forever. When you&apos;re ready to underwrite for real and get your safe offer, everything unlocks for less than the cost of one bad assumption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Card 1 — Free */}
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
              Paste in any deal and get a fast, conservative read on whether the numbers actually work — using the same adjusted-ARV math seasoned operators use to avoid overpaying.
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
              to="/auth"
              className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.03] px-5 py-2.5 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.07] transition-base w-full sm:w-auto"
            >
              Start free →
            </Link>
          </div>
        </div>

        {/* Card 2 — All-Access */}
        <div className="relative rounded-2xl flex">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]" />
          <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] p-6 lg:p-7 flex flex-col gap-5 flex-1">
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                  Founding Member
                </span>
                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-[2px] text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setPlan("monthly")}
                    className={`px-3 py-1 rounded-full transition-base ${
                      plan === "monthly" ? "bg-white/15 text-white" : "text-white/60 hover:text-white/90"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("annual")}
                    className={`px-3 py-1 rounded-full transition-base ${
                      plan === "annual" ? "bg-white/15 text-white" : "text-white/60 hover:text-white/90"
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                All-Access
              </h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-bold text-foreground leading-none">
                  ${plan === "annual" ? "390" : "39"}
                </span>
                <span className="text-[14px] text-muted-foreground">
                  /{plan === "annual" ? "year" : "month"}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {plan === "annual" ? "$32.50/mo billed annually — 2 months free" : "or $390/year — 2 months free"}
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                The full operator toolkit — every skill, plus new ones every month.
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {[
                "Everything in Free",
                "Deal Analyzer & Underwriter — your safe offer, underwritten",
                "All 7 launch skills + the full decision arc",
                "New skills added every month",
                "Lock in this founding-member price for life",
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
                onClick={handleCheckout}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base w-full sm:w-auto disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
                  </>
                ) : (
                  <>Get All-Access →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[12.5px] text-muted-foreground/70">
        Cancel anytime. Founding-member pricing won&apos;t last.
      </p>
    </section>
  );
}
