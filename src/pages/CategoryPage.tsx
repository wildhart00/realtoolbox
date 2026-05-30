import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrowseSection } from "@/components/home/BrowseSection";
import { useCategories, useTools } from "@/hooks/useDirectory";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useCategories();
  const { data: tools = [] } = useTools();

  const category = categories.find((c) => c.slug === slug);

  const filtered = useMemo(
    () => tools.filter((t) => t.categories?.some((c) => c.slug === slug)),
    [tools, slug],
  );

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-10 pb-2 mx-auto" style={{ maxWidth: 1100 }}>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tools
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-foreground/50 font-semibold">
          Category
        </p>
        <h1 className="mt-1.5 font-display text-[40px] text-foreground tracking-[-0.025em] leading-tight">
          {category?.name ?? "Category"}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        </p>
      </section>
      <BrowseSection tools={filtered} categories={categories} lockCategory />
    </AppLayout>
  );
};

export default CategoryPage;
