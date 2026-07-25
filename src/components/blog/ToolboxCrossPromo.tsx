import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { freeDealScreenPath } from "@/lib/routes";

/**
 * Toolbox cross-promo for blog posts.
 *
 * Blog traffic arrives for a tool roundup or a comparison, not for the product.
 * This is the one bridge from that reader to the toolbox — pointed at the free
 * skill first, since that's the ask a cold reader will actually accept.
 */
export function ToolboxCrossPromo({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const { user } = useAuth();
  const compact = variant === "compact";

  return (
    <aside
      className={
        "relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 " +
        (compact ? "px-6 py-6 my-8" : "px-6 py-8 lg:px-9 lg:py-9 my-10")
      }
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
      <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
        From RealToolbox
      </p>
      <h3
        className={
          "mt-2 font-display text-foreground tracking-[-0.02em] leading-tight " +
          (compact ? "text-[20px]" : "text-[22px] lg:text-[26px]")
        }
      >
        Software finds the deal. Something still has to decide on it.
      </h3>
      <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.7] max-w-xl">
        The Investor Toolbox is seven AI skills that underwrite a property conservatively — refusing
        to invent comps, taxes, or rents, and refusing a verdict when the inputs are too thin. Deal
        Screen, the fast go/no-go, is free with an account.
      </p>
      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link
          to={freeDealScreenPath(!!user)}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
        >
          Get the free Deal Screen <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/toolbox"
          className="text-[13px] font-semibold text-foreground/80 hover:text-foreground transition-base"
        >
          See the toolbox →
        </Link>
      </div>
    </aside>
  );
}
