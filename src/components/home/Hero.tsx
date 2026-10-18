import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Homepage hero — AI developments and tool discovery for residential real estate
 * investors and agents. CTAs jump to the on-page Updates and Find-a-tool sections.
 * Skills/toolbox remain linked as supporting resources.
 */
export function Hero() {
  return (
    <section className="px-6 lg:px-10 pt-[72px] sm:pt-[88px] pb-10 text-center mx-auto" style={{ maxWidth: 880 }}>
      <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-[22px]">
        <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden />
        <span className="text-[11px] tracking-[0.16em] text-accent font-semibold uppercase">
          For residential investors &amp; agents
        </span>
      </div>

      <h1
        className="font-display font-bold text-foreground mb-[18px]"
        style={{ fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        What changed in real estate AI,{" "}
        <span className="italic text-accent">and what's worth trying.</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.65] mx-auto" style={{ maxWidth: 640 }}>
        Dated vendor announcements with why they may matter for your work, what hasn't been verified,
        and a plain next step. Plus a task-based way to find tools for the job in front of you.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="#updates"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg transition-base"
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

      <p className="mt-5 text-[13px] text-muted-foreground">
        Also available: ready-made AI skills in the{" "}
        <Link to="/toolbox" className="text-accent underline-offset-2 hover:underline">toolbox</Link>.
      </p>
    </section>
  );
}
