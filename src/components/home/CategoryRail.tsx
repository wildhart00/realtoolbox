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
      <p className="text-[11px] uppercase tracking-[0.1em] text-foreground/30 font-semibold mb-2.5">
        Category
      </p>
      <div className="flex lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
        {items.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.slug)}
              className={cn(
                "rounded-lg px-[11px] py-2 text-left text-[13px] border whitespace-nowrap transition-base",
                isActive
                  ? "bg-foreground/[0.07] border-foreground/[0.12] text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
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
