import { Link } from "react-router-dom";

export function Hero({ toolCount }: { toolCount: number }) {
  return (
    <section className="px-6 lg:px-10 pt-[88px] pb-14 text-center mx-auto" style={{ maxWidth: 860 }}>
      <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-[26px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[hsl(229_94%_82%)]" />
        <span className="text-[11px] tracking-[0.16em] text-[hsl(229_94%_82%)] font-semibold uppercase">
          For real estate investors &amp; agents
        </span>
      </div>

      <h1
        className="font-display font-bold text-foreground mb-[20px]"
        style={{ fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        The complete toolbox for real estate pros —{" "}
        <span className="italic text-[hsl(229_94%_82%)]">software you should know, AI skills that know the numbers.</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.65] mx-auto" style={{ maxWidth: 660 }}>
        Two things in one place: a curated directory of the best real estate software and AI tools, and operator-grade AI skill toolboxes — built from 12+ years of real flips, rentals, and deals — that you own outright.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="#pricing"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("pricing");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
        >
          See the Toolboxes
        </a>
        <Link
          to="/browse"
          className="text-[14px] font-semibold text-foreground/80 hover:text-foreground transition-base"
        >
          Browse the tool directory{toolCount >= 25 ? ` (${toolCount})` : ""} →
        </Link>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground/75 leading-[1.65] text-center mx-auto" style={{ maxWidth: 620 }}>
        Built by an operator, not a prompt hobbyist. The directory saves you time; the Toolboxes save you deals.
      </p>
    </section>
  );
}
