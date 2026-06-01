import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface WorkflowItem {
  name: string;
  stack: string[];
  description: string;
  guideHref?: string;
}

export function WorkflowCard({ item }: { item: WorkflowItem }) {
  return (
    <div className="flex flex-col h-full rounded-2xl p-7 surface-card hover:surface-card-hover transition-base">
      <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
        {item.name}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.stack.map((s) => (
          <span
            key={s}
            className="text-[10.5px] font-medium px-2 py-[3px] rounded-md bg-foreground/[0.05] text-foreground/60 border border-foreground/10"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-4 text-[14px] text-muted-foreground leading-[1.65] flex-1">
        {item.description}
      </p>

      <div className="mt-auto pt-5">
        <Link
          to={item.guideHref ?? "/blog"}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 px-4 py-2 text-[12.5px] font-semibold text-foreground hover:bg-foreground/[0.04] transition-base"
        >
          View Guide <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
