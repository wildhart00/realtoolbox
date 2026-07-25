import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { freeDealScreenPath } from "@/lib/routes";

/**
 * Homepage hero — narrative beat 1: what this is, and who it's for.
 *
 * Deliberately says nothing about MCP or connecting. A visitor arriving cold from
 * an email has no idea what an AI skill is yet; the delivery mechanism is a
 * differentiator but it only lands once they know what's being delivered. That
 * story lives further down the page and on /how-it-works.
 */
export function Hero() {
  const { user } = useAuth();

  return (
    <section className="px-6 lg:px-10 pt-[88px] pb-14 text-center mx-auto" style={{ maxWidth: 880 }}>
      <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-[26px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[hsl(229_94%_82%)]" />
        {/* Investors stay the named audience and come first; agents are added as a
            qualifier rather than an equal billing, so the positioning widens
            without going generic. */}
        <span className="text-[11px] tracking-[0.16em] text-[hsl(229_94%_82%)] font-semibold uppercase">
          For real estate investors &amp; the agents who serve them
        </span>
      </div>

      <h1
        className="font-display font-bold text-foreground mb-[20px]"
        style={{ fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        Analyze a deal like someone who&apos;s{" "}
        <span className="italic text-[hsl(229_94%_82%)]">done it a hundred times.</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.65] mx-auto" style={{ maxWidth: 660 }}>
        Paste a property into ChatGPT, Claude, or Gemini and get it underwritten the way a seasoned
        operator would — conservative math, every assumption labelled, and a clear call on whether the
        deal clears. Built for people doing their first few deals, not their hundredth.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={freeDealScreenPath(!!user)}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
        >
          Try the free Deal Screen <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/toolbox"
          className="text-[14px] font-semibold text-foreground/80 hover:text-foreground transition-base"
        >
          See the toolbox →
        </Link>
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground/75">
        Free account, no card. Or{" "}
        <Link to="/how-it-works" className="text-[hsl(229_94%_82%)] underline-offset-2 hover:underline">
          read how it works
        </Link>{" "}
        first.
      </p>
    </section>
  );
}
