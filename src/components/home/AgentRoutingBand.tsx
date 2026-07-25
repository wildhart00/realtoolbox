import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";

/**
 * A single routing line for the secondary audience.
 *
 * Deliberately a thin band rather than a section: agents with investor clients
 * are a real audience for the same seven skills, but the homepage stays
 * investor-first. This gets them off the page and onto /for-agents without
 * competing with the primary narrative for space.
 */
export function AgentRoutingBand() {
  return (
    <section className="px-6 lg:px-10 pb-6 pt-2 mx-auto" style={{ maxWidth: 1100 }}>
      <Link
        to="/for-agents"
        className="group surface-card hover:surface-card-hover rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 transition-base"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
          <Users className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
            Agents with investor clients
          </span>
          <span className="mt-1 block text-[14px] text-foreground/85 leading-[1.6]">
            Run the properties your buyers send over through the same seven skills and hand back an
            underwrite instead of an opinion.
          </span>
        </span>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80 group-hover:text-foreground transition-base">
          See how it fits
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-base" />
        </span>
      </Link>
    </section>
  );
}
