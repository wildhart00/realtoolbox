import { cn } from "@/lib/utils";
import type { PricingModel } from "@/lib/types";

const styles: Record<PricingModel, string> = {
  free: "bg-success/10 text-success border-success/25",
  freemium: "bg-accent/10 border-accent/25 text-accent",
  paid: "bg-foreground/[0.05] text-muted-foreground border-foreground/10",
};

const labels: Record<PricingModel, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
};

export function PricingBadge({ pricing, className }: { pricing: PricingModel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[12px] font-semibold uppercase tracking-[0.04em] px-2 py-[3px] rounded-md border",
        styles[pricing],
        className,
      )}
    >
      {labels[pricing]}
    </span>
  );
}
