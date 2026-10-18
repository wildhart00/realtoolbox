import { cn } from "@/lib/utils";

interface CategoryRailProps {
  categories: { id: string; name: string; slug: string }[];
  active: string;
  onChange: (slug: string) => void;
}

export function CategoryRail({ categories, active, onChange }: CategoryRailProps) {
  const items = [{ id: "all", name: "All", slug: "all" }, ...categories];
  return (
    <aside className="w-full lg:w-[172px] shrink-0">
      <p className="hidden lg:block text-[13px] uppercase tracking-[0.1em] text-foreground/80 font-semibold mb-2.5">
        Category
      </p>
      <div className="relative">
      <p className="lg:hidden mb-2 text-[13px] text-foreground/75">Categories <span aria-hidden>· swipe for more →</span></p>
      <div className="flex lg:flex-col gap-2 lg:gap-0.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 pr-10 lg:pr-0 snap-x">
        {items.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.slug)}
              className={cn(
                "whitespace-nowrap transition-base shrink-0",
                /* mobile: pill row */
                "min-h-11 lg:min-h-0 rounded-full px-4 py-2 text-[14px] lg:rounded-lg lg:px-[11px] lg:py-2 lg:text-left",
                isActive
                  ? "bg-foreground text-background border border-foreground font-medium lg:border"
                  : "border border-foreground/20 bg-card text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] lg:border-transparent",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div aria-hidden className="lg:hidden pointer-events-none absolute right-0 bottom-2 h-11 w-12 bg-gradient-to-l from-background to-transparent" />
      </div>
    </aside>
  );
}

