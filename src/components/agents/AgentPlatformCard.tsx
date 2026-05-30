import { ArrowUpRight, type LucideIcon } from "lucide-react";

export type Pricing = "Open Source" | "Freemium" | "Paid";

export interface AgentPlatformItem {
  name: string;
  description: string;
  category: string;
  pricing: Pricing;
  url: string;
  icon: LucideIcon;
}

const pricingStyles: Record<Pricing, string> = {
  "Open Source": "bg-success/15 text-success border-success/25",
  Freemium: "bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25",
  Paid: "bg-foreground/[0.05] text-muted-foreground border-foreground/10",
};

export function AgentPlatformCard({ item }: { item: AgentPlatformItem }) {
  const Icon = item.icon;
  return (
    <div className="group flex flex-col rounded-2xl p-[22px] surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base">
      <div className="flex items-start justify-between gap-3 mb-[14px]">
        <div className="flex items-center gap-[11px] min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-accent shadow-[0_4px_14px_-4px_hsl(239_84%_67%/0.5)]">
            <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-foreground leading-tight truncate">
              {item.name}
            </div>
            <div className="text-[11px] text-foreground/30 mt-0.5 truncate">{item.category}</div>
          </div>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground leading-[1.6] mb-[16px] line-clamp-2 min-h-[42px]">
        {item.description}
      </p>

      <div className="flex flex-wrap items-center gap-[6px] mt-auto">
        <span className="text-[10px] px-[7px] py-[2px] rounded bg-foreground/[0.05] text-foreground/50 font-medium">
          {item.category}
        </span>
        <span
          className={`text-[10px] px-[7px] py-[2px] rounded font-medium border ${pricingStyles[item.pricing]}`}
        >
          {item.pricing}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[hsl(229_94%_82%)] hover:text-foreground transition-base"
        >
          Visit <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
