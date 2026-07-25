import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Narrative beat 6: price, then routing.
 *
 * Summary only — no checkout on the homepage. Buying happens on the toolbox pages
 * where the visitor has seen what's inside first.
 */
const TIERS = [
  {
    name: "Investor Toolbox",
    badge: { label: "Founding", accent: true },
    price: "$79",
    was: "$99",
    blurb: "The seven-skill decision path. Available now.",
  },
  {
    name: "Complete",
    badge: { label: "Best value", accent: false },
    price: "$149",
    blurb: "Investor now, plus the Agent Toolbox free at release.",
  },
  {
    name: "Agent Toolbox",
    badge: { label: "Coming soon", accent: false },
    price: "—",
    blurb: "Listing agent workflows. Next up.",
    dim: true,
  },
];

export function OfferBand() {
  return (
    <section id="pricing" className="px-6 lg:px-10 py-14 lg:py-16 mx-auto scroll-mt-24" style={{ maxWidth: 1100 }}>
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Own the toolbox
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Buy once. Own it forever.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          One payment, no subscription, and every new skill added to your toolbox is yours
          automatically.
        </p>
      </div>

      <div className="surface-card rounded-2xl border border-foreground/[0.08] p-5 lg:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-foreground/10">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={"md:px-5 first:md:pl-0 last:md:pr-0 " + (t.dim ? "opacity-70" : "")}
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-[18px] font-semibold text-foreground">{t.name}</span>
                <span
                  className={
                    t.badge.accent
                      ? "inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-white"
                      : "inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
                  }
                >
                  {t.badge.label}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={
                    "font-display text-[22px] font-bold " +
                    (t.dim ? "text-foreground/60" : "text-foreground")
                  }
                >
                  {t.price}
                </span>
                {t.was && <span className="text-[13px] text-muted-foreground line-through">{t.was}</span>}
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground leading-snug">{t.blurb}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-foreground/[0.06] pt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <Link
            to="/toolbox/investor"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            See what&apos;s inside <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/toolbox"
            className="text-[13px] font-semibold text-foreground/80 hover:text-foreground transition-base"
          >
            Compare toolboxes →
          </Link>
        </div>
      </div>
    </section>
  );
}
