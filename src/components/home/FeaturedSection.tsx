import type { Tool } from "@/lib/types";
import { ToolCard } from "@/components/tools/ToolCard";

function EmptyState() {
  return (
    <div className="surface-card rounded-2xl py-14 px-6 text-center">
      <p className="text-[13px] text-muted-foreground">
        Curating now — check back this week.
      </p>
    </div>
  );
}

export function FeaturedSection({ featured }: { featured: Tool[] }) {
  return (
    <section className="px-6 lg:px-10 pb-11 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="flex items-center gap-6 mb-6 border-b border-foreground/[0.06]">
        <div className="relative py-3 text-[12px] uppercase tracking-[0.1em] font-semibold text-foreground">
          ✨ Featured This Week
          <span
            className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(239 84% 67%), hsl(265 84% 67%))",
            }}
          />
        </div>
      </div>

      {featured.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}
    </section>
  );
}
