import { Link } from "react-router-dom";
import type { Tool } from "@/lib/types";
import { ToolLogo, domainFromUrl } from "./ToolLogo";
import { PricingBadge } from "./PricingBadge";

export function ToolCard({ tool, isSaved: _isSaved }: { tool: Tool; isSaved?: boolean }) {
  const domain = domainFromUrl(tool.website_url);
  const category = tool.categories?.[0];

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group block rounded-2xl p-[22px] surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base"
    >
      <div className="flex items-start justify-between gap-3 mb-[14px]">
        <div className="flex items-center gap-[11px] min-w-0">
          <ToolLogo domain={domain} name={tool.name} customUrl={tool.logo_url} size={40} />
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-foreground leading-tight truncate">
              {tool.name}
            </div>
            {category && (
              <div className="text-[11px] text-foreground/30 mt-0.5 truncate">{category.name}</div>
            )}
          </div>
        </div>
        <PricingBadge pricing={tool.pricing} />
      </div>

      <p className="text-[13px] text-muted-foreground leading-[1.6] mb-[14px] line-clamp-2 min-h-[38px]">
        {tool.tagline}
      </p>

      <div className="flex flex-wrap gap-[5px] items-center">
        {tool.tags?.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] px-[7px] py-[2px] rounded bg-foreground/[0.05] text-foreground/30 font-medium"
          >
            {t}
          </span>
        ))}
        {!tool.re_only && (
          <span className="text-[10px] px-[7px] py-[2px] rounded bg-accent/10 text-[hsl(229_94%_82%)] font-medium border border-accent/20">
            General use
          </span>
        )}
      </div>
    </Link>
  );
}
