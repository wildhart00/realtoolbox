import { Link } from "react-router-dom";
import type { Tool } from "@/lib/types";
import { ToolLogo, domainFromUrl } from "@/components/tools/ToolLogo";
import { PricingBadge } from "@/components/tools/PricingBadge";

export function FeaturedStrip({ tools, onViewAll }: { tools: Tool[]; onViewAll?: () => void }) {
  if (tools.length === 0) return null;
  return (
    <section className="px-6 lg:px-10 pb-11 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="flex items-center justify-between mb-3.5">
        <p className="text-[11px] uppercase tracking-[0.1em] text-foreground/30 font-semibold">
          Featured this week
        </p>
        <button
          onClick={onViewAll}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-base"
        >
          View all →
        </button>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tools.slice(0, 3).map((t) => (
          <Link
            key={t.id}
            to={`/tools/${t.slug}`}
            className="surface-card hover:surface-card-hover rounded-2xl px-[18px] py-4 flex items-center gap-3.5 transition-base"
          >
            <ToolLogo domain={domainFromUrl(t.website_url)} name={t.name} customUrl={t.logo_url} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[14px] font-semibold text-foreground truncate">{t.name}</span>
                <PricingBadge pricing={t.pricing} className="text-[9px] px-1.5 py-[1px]" />
              </div>
              <p className="text-[12px] text-muted-foreground leading-[1.5] line-clamp-2">{t.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
