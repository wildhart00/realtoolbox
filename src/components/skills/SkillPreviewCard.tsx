import { Link, useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useSkillAccess } from "@/hooks/useSkillAccess";
import { useCheckout } from "@/hooks/useCheckout";
import { cn } from "@/lib/utils";

export interface SkillCardData {
  name: string;
  slug: string;
  tagline: string | null;
  description?: string | null;
  audience: string;
  
  access_level: string;
  price: number;
  toolbox?: string | null;
}

export function SkillPreviewCard({
  name,
  slug,
  tagline,
  description,
  access_level,
  toolbox,
}: SkillCardData) {
  const navigate = useNavigate();
  const { isPaid, locked, requiredToolbox } = useSkillAccess({ access_level, toolbox });
  const { startCheckout, loading } = useCheckout();

  const isAgent = requiredToolbox === "agent_toolbox";

  function handleCardClick() {
    navigate(`/toolbox/${slug}`);
  }

  function stop(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col rounded-2xl p-[22px] surface-card transition-base hover:border-[hsl(239_84%_67%)]/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
          {tagline ?? "Skill"}
        </span>
        {isPaid && (
          locked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
              <Lock className="h-3 w-3" aria-hidden /> Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(229_94%_82%)]">
              <Sparkles className="h-3 w-3" aria-hidden /> Unlocked
            </span>
          )
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight">
        {name}
      </h3>

      {description || tagline ? (
        <p className="mt-2 text-[14px] text-muted-foreground leading-[1.6] flex-1">
          {description || tagline}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-5 flex flex-col items-start gap-2">
        {isPaid && locked ? (
          <>
            {isAgent ? (
              <button
                type="button"
                disabled
                onClick={stop}
                className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-muted-foreground cursor-not-allowed"
              >
                Agent Toolbox — coming soon
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  stop(e);
                  startCheckout("investor", "/");
                }}
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
              >
                Get the Investor Toolbox — $79
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                stop(e);
                startCheckout("complete", "/");
              }}
              className="text-[12px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-base disabled:opacity-70"
            >
              Or the Complete Toolbox — $149
            </button>
          </>
        ) : isPaid ? (
          <Link
            to={`/toolbox/${slug}`}
            onClick={stop}
            className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            Open skill
          </Link>
        ) : (
          <Link
            to={`/toolbox/${slug}`}
            onClick={stop}
            className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            Start free
          </Link>
        )}
      </div>
    </div>
  );
}
