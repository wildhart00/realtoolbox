import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCheckout } from "@/hooks/useCheckout";

export function OfferBand() {
  const { startCheckout, loading } = useCheckout();

  return (
    <section id="pricing" className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Own the toolbox
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Buy once. Own it forever.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          Full details, feature lists, and checkout live on the toolbox pages.
        </p>
      </div>

      <div className="surface-card rounded-2xl border border-foreground/[0.08] p-5 lg:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-foreground/10">
          {/* Investor */}
          <div className="md:px-5 first:md:pl-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-[18px] font-semibold text-foreground">Investor Toolbox</span>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                Founding
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[22px] font-bold text-foreground">$79</span>
              <span className="text-[13px] text-muted-foreground line-through">$99</span>
            </div>
            <p className="mt-1 text-[12.5px] text-muted-foreground leading-snug">
              7 skills, one decision path.
            </p>
          </div>

          {/* Complete */}
          <div className="md:px-5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-[18px] font-semibold text-foreground">Complete</span>
              <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Best value
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[22px] font-bold text-foreground">$149</span>
            </div>
            <p className="mt-1 text-[12.5px] text-muted-foreground leading-snug">
              Investor + Agent when it releases.
            </p>
          </div>

          {/* Agent */}
          <div className="md:px-5 last:md:pr-0 opacity-70">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-[18px] font-semibold text-foreground">Agent Toolbox</span>
              <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Coming soon
              </span>
            </div>
            <div className="mt-1 font-display text-[22px] font-bold text-foreground/60">—</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground leading-snug">
              Listing agent workflows, next up.
            </p>
          </div>
        </div>

        <div className="border-t border-foreground/[0.06] pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <Link
              to="/toolbox/investor"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
            >
              See what's inside <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/toolbox"
              className="text-[13px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              Compare toolboxes →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => startCheckout("investor", "/")}
            disabled={loading}
            className="text-[12.5px] font-semibold text-[hsl(229_94%_82%)] hover:text-[hsl(229_94%_90%)] transition-base disabled:opacity-70 text-left sm:text-right"
          >
            {loading ? "Starting checkout…" : "Or buy Investor now → $79"}
          </button>
        </div>
      </div>
    </section>
  );
}
