import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import * as Icons from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { Button } from "@/components/ui/button";
import { useCategories, useTools } from "@/hooks/useDirectory";
import { useSearch } from "@/hooks/useSearch";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useCategories();
  const { data: tools = [], isLoading } = useTools();
  const { query } = useSearch();

  const category = categories.find((c) => c.slug === slug);

  const filtered = useMemo(() => {
    let list = tools.filter((t) => t.categories?.some((c) => c.slug === slug));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tools, slug, query]);

  const IconComp = (category?.icon && (Icons as any)[category.icon]) || Icons.LayoutGrid;

  return (
    <AppLayout>
      <section className="border-b border-border/60 bg-gradient-subtle px-6 py-10 lg:px-10">
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <IconComp className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category?.name ?? "Category"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "tool" : "tools"} in this category
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-10">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
            ))}
          </div>
        ) : (
          <ToolGrid tools={filtered} />
        )}
      </section>
    </AppLayout>
  );
};

export default CategoryPage;
