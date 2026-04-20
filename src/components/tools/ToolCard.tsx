import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tool } from "@/data/tools";

const pricingStyles: Record<string, string> = {
  Free: "bg-success/10 text-success border-success/20",
  Freemium: "bg-accent/10 text-accent border-accent/20",
  Paid: "bg-muted text-muted-foreground border-border",
};

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-sm transition-base hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-bold text-white shadow-md",
            tool.logo_bg
          )}>
            {tool.logo_initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold leading-tight">{tool.name}</h3>
              {tool.is_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="font-medium text-foreground">{tool.rating}</span>
              <span>({tool.reviews_count})</span>
            </div>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-base group-hover:opacity-100 group-hover:text-accent" />
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{tool.tagline}</p>

      <div className="mt-4 flex items-center gap-2 pt-2">
        <Badge variant="outline" className={cn("text-[10px] font-medium uppercase tracking-wide", pricingStyles[tool.pricing])}>
          {tool.pricing}
        </Badge>
        {tool.is_featured && (
          <Badge variant="outline" className="border-accent/30 bg-accent-soft text-[10px] font-medium uppercase tracking-wide text-accent">
            Featured
          </Badge>
        )}
      </div>
    </Link>
  );
}
