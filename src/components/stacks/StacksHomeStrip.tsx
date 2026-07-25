import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";

const stacks = [
  {
    href: "/stacks/investor",
    kicker: "The Investor Stack",
    title: "If I were starting today — the tools I'd run",
    blurb: "Deal finding, analysis, skip tracing, CRM, rehab, back office. Curated, not a directory dump.",
  },
  {
    href: "/stacks/agent",
    kicker: "The Agent Stack",
    title: "The tools I'd hand a new agent on day one",
    blurb: "CRM, listing marketing, transactions, AI content, client comms — the shortlist that actually earns its seat.",
  },
];

export function StacksHomeStrip() {
  return (
    <section className="px-6 lg:px-10 py-6">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4" style={{ maxWidth: 1100 }}>
        {stacks.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            className="group surface-card hover:surface-card-hover rounded-2xl p-5 transition-base flex items-start gap-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-indigo">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)] mb-1">
                {s.kicker}
              </div>
              <div className="font-display text-[16px] font-semibold text-foreground mb-1 tracking-[-0.01em]">
                {s.title}
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.55]">{s.blurb}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base mt-1 shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
