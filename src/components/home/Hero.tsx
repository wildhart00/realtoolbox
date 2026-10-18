import { ArrowRight } from "lucide-react";

/**
 * Homepage hero — AI developments and tool discovery for residential real estate
 * investors and agents. CTAs jump to the on-page Updates and Find-a-tool sections.
 * Skills/toolbox remain linked as supporting resources.
 */
export function Hero() {
  return (
    <section className="px-6 lg:px-10 pt-8 sm:pt-14 pb-4 sm:pb-6 text-left sm:text-center mx-auto" style={{ maxWidth: 1100 }}>
      <p className="text-[13px] tracking-[0.14em] text-accent font-semibold uppercase mb-3">
        A briefing for residential investors &amp; agents
      </p>

      <h1
        className="font-display font-bold text-foreground mb-[18px]"
        style={{ fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.1, letterSpacing: "-0.03em" }}
      >
        What changed in real estate AI,{" "}
        <span className="italic text-foreground/70">and what's worth trying.</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.6] sm:mx-auto" style={{ maxWidth: 620 }}>
        Dated vendor announcements, why they may matter, and a plain next step — plus a way to find
        tools by the task in front of you.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
        <a
          href="#updates"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-foreground hover:bg-foreground/90 px-6 py-3 text-[14px] font-semibold text-background shadow-lg transition-base"
        >
          See recent updates <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
        <a
          href="#find-a-tool"
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-foreground/15 px-6 py-3 text-[14px] font-semibold text-foreground hover:border-accent transition-base"
        >
          Find a tool by task
        </a>
      </div>

    </section>
  );
}
