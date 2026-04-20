import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolCard } from "@/components/tools/ToolCard";
import { Button } from "@/components/ui/button";
import { tools, getFeaturedTools } from "@/data/tools";
import { categories } from "@/data/categories";

const Index = () => {
  const featured = getFeaturedTools();
  const trending = tools.slice(0, 8);
  const newest = tools.slice(-6).reverse();

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
              <span>200+ AI tools, hand-picked for real estate</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The AI toolbox for{" "}
              <span className="text-gradient">modern real estate</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover, compare, and adopt the AI tools top agents, investors, and
              property managers use to win more deals — without the bloat.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link to="/category/lead-generation">
                  Explore Tools <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/submit">Submit your tool</Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
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
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((t) => <ToolCard key={t.id} tool={t} />)}
        </div>
      </section>

      {/* Browse by category */}
      <section className="px-6 py-8 lg:px-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Browse</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">By category</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 12).map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-base hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent transition-base group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cat.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="px-6 py-12 lg:px-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Trending now</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Most-loved this week</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trending.map((t) => <ToolCard key={t.id} tool={t} />)}
        </div>
      </section>

      {/* Newest */}
      <section className="px-6 pb-16 pt-4 lg:px-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Just added</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">New tools</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((t) => <ToolCard key={t.id} tool={t} />)}
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-16 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-center shadow-elevated lg:p-12">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }} />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Built an AI tool for real estate?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Get in front of thousands of agents, brokers, and investors actively
              looking for tools like yours.
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

export default Index;
