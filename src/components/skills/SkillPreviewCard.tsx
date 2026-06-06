import { useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { CaptureDialog, type StageKey } from "@/components/capture/CaptureDialog";
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

function stageFromTagline(tagline: string | null): StageKey {
  const t = (tagline ?? "").toLowerCase();
  if (t.includes("scaling")) return "scaling";
  if (t.includes("active")) return "active";
  return "first";
}

export function SkillPreviewCard({
  name,
  slug,
  tagline,
  description,
  file_url: _file_url,
  access_level,
  price,
}: SkillCardData) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isPaid = access_level === "paid" && Number(price) > 0;

  function handleCardClick() {
    navigate(`/skills/${slug}`);
  }

  function handleAction(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  }

  return (
    <>
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
          isPaid && "opacity-95",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
            {tagline ?? "Skill"}
          </span>
          {isPaid && (
            <Lock className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
          )}
        </div>

        <h3 className={cn(
          "mt-4 font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight",
          isPaid && "opacity-90",
        )}>
          {name}
        </h3>

        {description || tagline ? (
          <p className={cn(
            "mt-2 text-[14px] text-muted-foreground leading-[1.6] flex-1",
            isPaid && "opacity-90",
          )}>
            {description || tagline}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-5 flex items-center gap-2.5">
          {isPaid ? (
            <>
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
              >
                Join for early access
              </button>
              <span className="text-[12px] font-semibold text-foreground/70">
                ${Number(price).toFixed(0)}
              </span>
            </>
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

      <CaptureDialog
        open={open}
        onOpenChange={setOpen}
        mode={isPaid ? "early-access" : "free-skill"}
        source={isPaid ? `skill_card_paid_${slug}` : `skill_card_${slug}`}
        initialStage={isPaid ? stageFromTagline(tagline) : undefined}
      />
    </>
  );
}
