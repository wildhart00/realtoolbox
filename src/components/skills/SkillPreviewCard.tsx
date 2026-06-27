import { Link, useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useSkillAccess } from "@/hooks/useSkillAccess";
import { cn } from "@/lib/utils";

export interface SkillCardData {
  name: string;
  slug: string;
  tagline: string | null;
  description?: string | null;
  audience: string;
  file_url: string | null;
  access_level: string;
  price: number;
}

export function SkillPreviewCard({
  name,
  slug,
  tagline,
  description,
  access_level,
}: SkillCardData) {
  const navigate = useNavigate();
  const { isPaid, locked } = useSkillAccess(access_level);

  function handleCardClick() {
    navigate(`/skills/${slug}`);
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
              <Lock className="h-3 w-3" aria-hidden /> All-Access
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

      <div className="mt-5 flex items-center gap-2.5">
        {isPaid && locked ? (
          <Link
            to="/#pricing"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            Get All-Access
          </Link>
        ) : isPaid ? (
          <Link
            to={`/skills/${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            Open skill
          </Link>
        ) : (
          <Link
            to={`/skills/${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
          >
            Start free
          </Link>
        )}
      </div>
    </div>
  );
}
