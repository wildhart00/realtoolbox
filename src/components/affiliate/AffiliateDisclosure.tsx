import { cn } from "@/lib/utils";

const COPY =
  "Some links are affiliate links — if you buy through them, RealToolbox earns a commission at no cost to you. Recommendations are based on real operator use, not commission rates.";

interface Props {
  variant?: "inline" | "block";
  className?: string;
}

export function AffiliateDisclosure({ variant = "inline", className }: Props) {
  if (variant === "block") {
    return (
      <div
        className={cn(
          "rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3 text-[12px] leading-[1.6] text-muted-foreground",
          className,
        )}
      >
        <span className="font-semibold text-foreground/70">Affiliate disclosure. </span>
        {COPY}
      </div>
    );
  }
  return (
    <p className={cn("text-[12px] leading-[1.6] text-foreground/40", className)}>{COPY}</p>
  );
}
