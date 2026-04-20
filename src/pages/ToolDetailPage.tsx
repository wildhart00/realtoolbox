import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tools/ToolCard";
import { getToolBySlug, getToolsByCategory } from "@/data/tools";
import { getCategoryBySlug } from "@/data/categories";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Bookmark, Calendar, CheckCircle2, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ToolDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} — ${tool.tagline} | RealToolbox.ai`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", tool.description.slice(0, 155));
    }
  }, [tool]);

  if (!tool) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Tool not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">← Back to all tools</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const category = getCategoryBySlug(tool.category_slug);
  const related = getToolsByCategory(tool.category_slug).filter((t) => t.id !== tool.id).slice(0, 3);

  return (
    <AppLayout>
      <article className="px-6 py-8 lg:px-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to={category ? `/category/${category.slug}` : "/"}>
            <ArrowLeft className="h-4 w-4" /> {category ? category.name : "All tools"}
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-5">
            <div className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl font-bold text-white shadow-elevated",
              tool.logo_bg
            )}>
              {tool.logo_initial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
                {tool.is_verified && <BadgeCheck className="h-6 w-6 text-accent" />}
              </div>
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{tool.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold">{tool.rating}</span>
                  <span className="text-muted-foreground">({tool.reviews_count} reviews)</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <Badge variant="outline" className="border-accent/30 bg-accent-soft text-accent">{tool.pricing}</Badge>
                {category && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <Link to={`/category/${category.slug}`} className="text-muted-foreground hover:text-foreground">
                      {category.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
            <Button asChild variant="hero" size="lg" className="flex-1">
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                Visit website <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg">
              <Bookmark className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {/* Body grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold">About {tool.name}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{tool.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold">Key features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 rounded-lg border border-border/60 bg-card p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold">Reviews</h2>
              <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Reviews from the community land here.<br />
                  <Link to="/auth" className="font-medium text-accent hover:underline">Sign in</Link> to leave one.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="text-sm font-semibold">Quick facts</h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Founded</dt>
                  <dd className="font-medium">{tool.founded}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Pricing</dt>
                  <dd className="font-medium">{tool.pricing}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Verified</dt>
                  <dd className="font-medium">{tool.is_verified ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4" /> Founder
              </h3>
              <p className="mt-2 font-medium">{tool.founder}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tool.founder_bio}</p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold">Related tools</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => <ToolCard key={t.id} tool={t} />)}
            </div>
          </section>
        )}
      </article>
    </AppLayout>
  );
};

export default ToolDetailPage;
