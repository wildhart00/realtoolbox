import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolCard } from "@/components/tools/ToolCard";
import { getCategoryBySlug } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  const categoryTools = slug ? getToolsByCategory(slug) : [];

  useEffect(() => {
    if (category) {
      document.title = `${category.name} AI tools for real estate | RealToolbox.ai`;
    }
  }, [category]);

  if (!category) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">← Back to all tools</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const Icon = category.icon;

  return (
    <AppLayout>
      <div className="px-6 py-10 lg:px-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> All categories
          </Link>
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="mt-1 text-muted-foreground">{category.description}</p>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"} in this category
        </div>

        {categoryTools.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">No tools in this category yet.</p>
            <Button asChild variant="accent" className="mt-4">
              <Link to="/submit">Be the first to submit one</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTools.map((t) => <ToolCard key={t.id} tool={t} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CategoryPage;
