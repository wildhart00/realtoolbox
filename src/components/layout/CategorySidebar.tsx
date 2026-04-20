import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { useCategories } from "@/hooks/useDirectory";

function Icon({ name, className }: { name: string | null; className?: string }) {
  const Comp = (name && (Icons as any)[name]) as LucideIcon | undefined;
  if (!Comp) return <LayoutGrid className={className} />;
  return <Comp className={className} />;
}

export function CategorySidebar() {
  const params = useParams();
  const activeSlug = params.slug;
  const { data: categories = [], isLoading } = useCategories();

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-border/60 bg-sidebar">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-6">
        <div className="px-3 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-base",
              isActive && !activeSlug
                ? "bg-accent-soft text-accent"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )
          }
        >
          <LayoutGrid className="h-4 w-4" />
          <span>All Tools</span>
        </NavLink>

        <div className="my-2 border-t border-sidebar-border/60" />

        {isLoading ? (
          <div className="space-y-1.5 px-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-7 animate-pulse rounded-md bg-muted/60" />
            ))}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug;
              return (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-base",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    name={cat.icon}
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{cat.name}</span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
