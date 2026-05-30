import { useState } from "react";
import type { Tool } from "@/lib/types";
import { ToolCard } from "@/components/tools/ToolCard";

type TabKey = "featured" | "just-launched";

const TABS: { key: TabKey; label: string }[] = [
  { key: "featured", label: "✨ Featured This Week" },
  { key: "just-launched", label: "🚀 Just Launched" },
];

function EmptyState() {
  return (
    <div className="surface-card rounded-2xl py-14 px-6 text-center">
      <p className="text-[13px] text-muted-foreground">
        Curating now — check back this week.
      </p>
    </div>
  );
}

export function FeaturedTabsSection({
  featured,
  justLaunched,
}: {
  featured: Tool[];
  justLaunched: Tool[];
}) {
  const [active, setActive] = useState<TabKey>("featured");
  const list = active === "featured" ? featured : justLaunched;

  return (
    <section className="px-6 lg:px-10 pb-11 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="flex items-center gap-6 mb-6 border-b border-foreground/[0.06]">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`relative py-3 text-[12px] uppercase tracking-[0.1em] font-semibold transition-colors ${
                isActive ? "text-foreground" : "text-foreground/40 hover:text-foreground/70"
              }`}
            >
              {t.label}
              <span
                className={`absolute left-0 right-0 -bottom-px h-[2px] rounded-full transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background:
                    "linear-gradient(90deg, hsl(239 84% 67%), hsl(265 84% 67%))",
                }}
              />
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}
    </section>
  );
}
