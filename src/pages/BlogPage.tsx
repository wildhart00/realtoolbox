import { useQuery } from "@tanstack/react-query";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  reading_minutes: number;
  published_at: string;
};

function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });
}

function usePost(slug?: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function renderBody(body: string) {
  // Lightweight markdown-ish renderer: ## heading, blank-line paragraphs, - lists
  const blocks = body.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 text-2xl font-bold tracking-tight">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((l) => l.replace(/^-\s*/, ""));
      return (
        <ul key={i} className="mt-4 space-y-2">
          {items.map((it, j) => (
            <li key={j} className="flex gap-3 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-5 leading-relaxed text-muted-foreground">
        {block}
      </p>
    );
  });
}

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <BlogPostView slug={slug} /> : <BlogIndex />;
};

function BlogIndex() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const [hero, ...rest] = posts;

  return (
    <AppLayout hideSidebar>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-subtle">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> RealToolbox Blog
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            AI insights for <span className="text-gradient">real estate pros</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Deep dives, prompt libraries and workflow guides — written by operators, for operators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No posts yet — check back soon.</p>
        ) : (
          <>
            {hero && (
              <Link
                to={`/blog/${hero.slug}`}
                className="group block overflow-hidden rounded-3xl border border-border/60 bg-card transition-base hover:border-accent/40 hover:shadow-elevated"
              >
                <div className="grid gap-0 md:grid-cols-2">
                  <div
                    className="aspect-[16/10] bg-gradient-hero md:aspect-auto"
                    style={
                      hero.cover_image_url
                        ? { backgroundImage: `url(${hero.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  />
                  <div className="flex flex-col justify-center p-7 lg:p-10">
                    <div className="flex flex-wrap gap-1.5">
                      {hero.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
                      {hero.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-muted-foreground">{hero.excerpt}</p>
                    <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(hero.published_at)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{hero.reading_minutes} min read</span>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-base hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevated"
                  >
                    <div
                      className="aspect-[16/10] bg-gradient-accent"
                      style={
                        p.cover_image_url
                          ? { backgroundImage: `url(${p.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : undefined
                      }
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight">{p.title}</h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(p.published_at)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.reading_minutes}m</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </AppLayout>
  );
}

function BlogPostView({ slug }: { slug: string }) {
  const { data: post, isLoading, error } = usePost(slug);

  if (isLoading) {
    return (
      <AppLayout hideSidebar>
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <div className="h-8 w-32 animate-pulse rounded bg-muted/60" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-muted/60" />
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      </AppLayout>
    );
  }
  if (error || !post) return <Navigate to="/blog" replace />;

  return (
    <AppLayout hideSidebar>
      <article className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link to="/blog"><ArrowLeft className="h-4 w-4" /> All posts</Link>
        </Button>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
              {t}
            </Badge>
          ))}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-4 border-y border-border/60 py-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{post.author_name}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.published_at)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.reading_minutes} min read</span>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-elegant"
          />
        )}

        <div className="prose prose-slate mt-8 max-w-none">{renderBody(post.body)}</div>
      </article>
    </AppLayout>
  );
}

export default BlogPage;
