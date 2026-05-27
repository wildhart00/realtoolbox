import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolGrid } from "@/components/tools/ToolGrid";
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
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [tools, slug, query]);

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-10 pb-6 mx-auto" style={{ maxWidth: 1100 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tools
        </Link>
        <h1 className="mt-4 font-display text-[40px] text-foreground tracking-[-0.025em]">
          {category?.name ?? "Category"}
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        </p>
      </section>
      <section className="px-6 lg:px-10 pb-20 mx-auto" style={{ maxWidth: 1100 }}>
        {isLoading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 surface-card rounded-2xl animate-pulse" />
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
