import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SkillsAnnouncementStrip() {
  return (
    <section className="w-full px-6 lg:px-10 py-14">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl px-8 py-10 lg:px-14 lg:py-12 shadow-glow bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]">
        {/* Decorative highlights */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[hsl(229_94%_82%)]/30 blur-3xl"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-white">
              Now Live
            </span>
            <h2 className="mt-4 font-display text-3xl lg:text-[40px] font-bold tracking-[-0.02em] leading-[1.05] text-white">
              Real estate skills for any AI — now live
            </h2>
            <p className="mt-3 text-[15px] lg:text-base text-white/85 leading-[1.6]">
              Done-for-you instruction files that turn any AI assistant (Claude, ChatGPT, Gemini)
              into a listing description writer, follow-up sequence writer, pricing strategist, and
              more. Free to download.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              asChild
              size="lg"
              className="bg-white text-[hsl(239_84%_55%)] hover:bg-white/90 shadow-elevated"
            >
              <Link to="/skills">
                Browse the skills <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
