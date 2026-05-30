export function SkillPreviewCard({
  title,
  description,
  audience,
}: {
  title: string;
  description: string;
  audience: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl p-[22px] surface-card">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
          {audience}
        </span>
        <span className="text-[10px] px-2 py-[3px] rounded-md border bg-foreground/[0.06] text-foreground/60 border-foreground/15 font-semibold uppercase tracking-[0.06em]">
          Coming Soon
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight">
        {title}
      </h3>

      <p className="mt-2 text-[14px] text-muted-foreground leading-[1.6] flex-1">
        {description}
      </p>

      <p className="mt-5 text-[12px] text-foreground/40">
        Drop your email above to be notified when this drops.
      </p>
    </div>
  );
}
