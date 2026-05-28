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
      <p className="hidden lg:block text-[11px] uppercase tracking-[0.1em] text-foreground/70 font-semibold mb-2.5">
        Category
      </p>
      <div className="flex lg:flex-col gap-2 lg:gap-0.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-1 lg:pb-0">
        {items.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.slug)}
              className={cn(
                "whitespace-nowrap transition-base shrink-0",
                /* mobile: pill row */
                "rounded-full px-3.5 py-1.5 text-[13px] lg:rounded-lg lg:px-[11px] lg:py-2 lg:text-left",
                isActive
                  ? "bg-foreground/[0.07] border border-foreground/[0.12] text-foreground font-medium lg:border"
                  : "border border-foreground/[0.07] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] lg:border-transparent",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

