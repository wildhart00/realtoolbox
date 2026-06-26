import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export function PricingSection() {
  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      {/* Header */}
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Card 1 — Free */}
        <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-transparent">
          <div>
            <h3 className="font-display text-[22px] text-foreground tracking-tight leading-tight">
              Deal Screen
            </h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-bold text-foreground leading-none">
                $0
              </span>
              <span className="text-[14px] text-muted-foreground">forever</span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
              Run any deal through the operator math in seconds.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {[
              "Free Deal Screen — unlimited",
              "Pat's Adjusted ARV Method",
              "Works in ChatGPT, Claude, or Gemini",
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
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] flex">
          <div className="rounded-[15px] bg-[hsl(230_18%_8%)] p-6 lg:p-7 flex flex-col gap-5 flex-1">
            <div>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                Founding Member
              </span>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                All-Access
              </h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-bold text-foreground leading-none">
                  $39
                </span>
                <span className="text-[14px] text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                or $390/year — 2 months free
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
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base w-full sm:w-auto"
              >
                Get All-Access →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer line */}
      <p className="mt-8 text-center text-[12.5px] text-muted-foreground/70">
        Cancel anytime. Founding-member pricing won&apos;t last.
      </p>
    </section>
  );
}
