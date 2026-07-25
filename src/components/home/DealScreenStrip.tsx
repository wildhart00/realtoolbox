import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function DealScreenStrip() {
  return (
    <section className="w-full px-6 lg:px-10 py-10">
      <div className="mx-auto max-w-[1100px]">
        {/* Gradient border wrapper */}
        <div className="relative rounded-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] opacity-90" />
          <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] px-6 py-8 lg:px-10 lg:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)]">
                Free forever · Start here
              </span>
              <h3 className="mt-3 font-display text-[26px] sm:text-[32px] text-foreground tracking-[-0.02em] leading-[1.15]">
                Run the numbers on any deal — free.
              </h3>
              <p className="mt-3 text-[14.5px] text-muted-foreground leading-[1.6]">
                Create a free account and load our conservative Deal Screen into ChatGPT, Claude, or Gemini. Fast, conservative read on whether a deal actually clears.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <Link
                to="/toolbox/deal-screen"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
              >
                Get the free Deal Screen <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[12px] text-muted-foreground/80">
                No card. Create a free account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
