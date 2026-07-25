import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Bot, Plug } from "lucide-react";
import type { Tool } from "@/lib/types";
import { ToolCard } from "@/components/tools/ToolCard";

/**
 * Narrative beat 7: the tool directory, as the secondary wing.
 *
 * The homepage used to carry a tabbed featured rail *and* a twelve-tool filtered
 * grid with a category sidebar — both of which /browse does properly. This is the
 * doorway only: a few current picks and the three ways into the directory.
 */
export function DirectorySection({
  featured,
  toolCount,
}: {
  featured: Tool[];
  toolCount: number;
}) {
  const picks = featured.slice(0, 3);

  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Also here
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            A directory of the software the rest of the job runs on.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Separate from the toolbox: {toolCount > 0 ? `${toolCount} ` : ""}curated real estate
            tools — deal sourcing, CRM, skip tracing, rehab, back office — with what each one is
            actually for.
          </p>
        </div>
        <Link
          to="/browse"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base whitespace-nowrap"
        >
          Browse all tools <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {picks.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {picks.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: "/browse", icon: Boxes, label: "All tools", desc: "The full directory, by category." },
          { to: "/integrations", icon: Plug, label: "Integrations", desc: "What connects to what." },
          { to: "/agents", icon: Bot, label: "Agents", desc: "Automations worth a look." },
        ].map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className="group surface-card hover:surface-card-hover rounded-xl px-4 py-3.5 flex items-center gap-3 transition-base"
            >
              <Icon className="h-4 w-4 shrink-0 text-[hsl(229_94%_82%)]" strokeWidth={2} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-foreground leading-tight">
                  {l.label}
                </span>
                <span className="block mt-0.5 text-[12.5px] text-muted-foreground leading-tight">
                  {l.desc}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
