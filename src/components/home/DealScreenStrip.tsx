import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function DealScreenStrip() {
  return (
    <section className="w-full px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="surface-card rounded-2xl px-6 py-6 lg:px-10 lg:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-foreground/[0.08]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)]">
              Free forever
            </span>
            <h3 className="mt-2 font-display text-[22px] sm:text-[26px] text-foreground tracking-[-0.02em] leading-tight">
              Try the Deal Screen — run the numbers on any deal.
            </h3>
            <p className="mt-2 text-[14px] text-muted-foreground leading-[1.6]">
              Create a free account and load our operator-grade deal screener into ChatGPT, Claude, or Gemini. Get a fast, conservative read on whether a deal actually clears — no card, no catch.
            </p>
          </div>
          <Link
            to="/toolbox/deal-screen"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-3 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
          >
            Get the free Deal Screen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
