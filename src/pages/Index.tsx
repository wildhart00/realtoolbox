import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import * as Icons from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { Button } from "@/components/ui/button";
import { useTools, useCategories } from "@/hooks/useDirectory";
import { useSearch } from "@/hooks/useSearch";

const Index = () => {
  const { data: tools = [], isLoading } = useTools();
  const { data: categories = [] } = useCategories();
  const { query } = useSearch();

  const filtered = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [tools, query]);

  const featured = useMemo(() => tools.filter((t) => t.is_editors_pick || t.is_featured), [tools]);
  const newest = tools.slice(0, 6);

  // Search-active view
  if (query.trim()) {
    return (
      <AppLayout>
        <section className="px-6 py-10 lg:px-10">
          <h1 className="text-2xl font-bold tracking-tight">
            Results for <span className="text-accent">"{query}"</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "tool" : "tools"} matched
          </p>
          <div className="mt-6">
            <ToolGrid tools={filtered} />
          </div>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute -top-24 right-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-accent-glow/10 blur-3xl" />

        <div className="relative px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>{tools.length}+ AI tools, hand-picked for real estate</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The AI toolbox for <span className="text-gradient">modern real estate</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover, compare, and adopt the AI tools top agents, investors, and property managers use to win more
              deals — without the bloat.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/category/productivity">
                  Explore Tools <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/submit">Submit your tool</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-accent" /> Verified by experts
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-accent" /> Updated weekly
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent" /> Free to browse
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 py-12 lg:px-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Editor's picks</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Featured tools</h2>
          </div>
        </div>
        {isLoading ? <GridSkeleton /> : <ToolGrid tools={featured} />}
      </section>

      {/* Browse by category */}
      <section className="px-6 py-8 lg:px-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Browse</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">By category</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 12).map((cat) => {
            const IconComp = (cat.icon && (Icons as any)[cat.icon]) || Icons.LayoutGrid;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-base hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent transition-base group-hover:bg-accent group-hover:text-accent-foreground">
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cat.name}</p>
                  <p className="truncate text-xs text-muted-foreground">Browse {cat.name.toLowerCase()} tools</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All tools */}
      <section className="px-6 py-12 lg:px-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Trending now</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">All AI tools</h2>
        </div>
        {isLoading ? <GridSkeleton /> : <ToolGrid tools={tools} />}
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-16 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-center shadow-elevated lg:p-12">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Built an AI tool for real estate?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Get in front of thousands of agents, brokers, and investors actively looking for tools like yours.
            </p>
            <Button asChild size="lg" className="mt-6 bg-white text-accent hover:bg-white/95">
              <Link to="/submit">Submit your tool — it's free</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
      ))}
    </div>
  );
}

export default Index;
