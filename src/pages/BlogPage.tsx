import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, Scale, Sparkles, Wrench } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PostBody, extractHeadings } from "@/components/blog/PostBody";
import { BlogEmailCapture } from "@/components/blog/BlogEmailCapture";
import { ToolboxCrossPromo } from "@/components/blog/ToolboxCrossPromo";

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
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function setMeta(title: string, description: string) {
  document.title = title;
  const meta =
    document.querySelector('meta[name="description"]') ??
    (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
  meta.setAttribute("content", description);
}

const BlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <BlogPostView slug={slug} /> : <BlogIndex />;
};

/** What this blog is for — stated plainly so the empty state isn't a dead end. */
const POST_TYPES = [
  {
    icon: Wrench,
    title: "Tool roundups",
    desc: "The handful of tools worth paying for in a category, what each is actually good at, and who should skip it.",
  },
  {
    icon: Scale,
    title: "Head-to-head comparisons",
    desc: "Two or three tools on the same job, compared on the criteria that decide it rather than on feature counts.",
  },
  {
    icon: Sparkles,
    title: "Workflow breakdowns",
    desc: "How a specific piece of the job gets done end to end — where AI helps, and where it should stay out of the way.",
  },
];

function BlogIndex() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    setMeta(
      "Blog — Tool roundups and comparisons for real estate | RealToolbox.ai",
      "Tool roundups, head-to-head comparisons, and workflow breakdowns for real estate investors and agents putting AI to work.",
    );
  }, []);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) for (const t of p.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [posts]);

  const filtered = useMemo(
    () => (activeTag ? posts.filter((p) => p.tags?.includes(activeTag)) : posts),
    [posts, activeTag],
  );

  const [hero, ...rest] = filtered;

  return (
    <AppLayout>
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Blog
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            Which tools are worth it,{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              and which aren&apos;t.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Roundups, comparisons, and workflow breakdowns for real estate operators — investors,
            agents, and teams deciding where software actually earns its seat.
          </p>
        </div>
      </section>

      {tags.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={
                activeTag === null
                  ? "rounded-full bg-foreground text-background px-4 py-1.5 text-[13px] font-semibold transition-base"
                  : "rounded-full bg-foreground/[0.04] border border-foreground/10 text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground px-4 py-1.5 text-[13px] font-medium transition-base"
              }
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={
                  activeTag === t
                    ? "rounded-full bg-foreground text-background px-4 py-1.5 text-[13px] font-semibold transition-base"
                    : "rounded-full bg-foreground/[0.04] border border-foreground/10 text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground px-4 py-1.5 text-[13px] font-medium transition-base"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-14">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-foreground/[0.04]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyBlog />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl surface-card p-10 text-center">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Nothing tagged &ldquo;{activeTag}&rdquo; yet
            </h3>
            <button
              onClick={() => setActiveTag(null)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.04] transition-base"
            >
              Show all posts
            </button>
          </div>
        ) : (
          <>
            {hero && (
              <Link
                to={`/blog/${hero.slug}`}
                className="group block overflow-hidden rounded-2xl surface-card hover:surface-card-hover transition-base"
              >
                <div className="grid gap-0 md:grid-cols-2">
                  <div
                    className="aspect-[16/10] bg-gradient-hero md:aspect-auto"
                    style={
                      hero.cover_image_url
                        ? {
                            backgroundImage: `url(${hero.cover_image_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="flex flex-col justify-center p-7 lg:p-10">
                    <div className="flex flex-wrap gap-1.5">
                      {hero.tags?.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="mt-4 font-display text-2xl lg:text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
                      {hero.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-[14.5px] text-muted-foreground leading-[1.65]">
                      {hero.excerpt}
                    </p>
                    <div className="mt-5 flex items-center gap-4 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(hero.published_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {hero.reading_minutes} min read
                      </span>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[hsl(229_94%_82%)]">
                      Read article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-8 grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl surface-card hover:surface-card-hover hover:-translate-y-0.5 transition-base"
                  >
                    <div
                      className="aspect-[16/10] bg-gradient-accent"
                      style={
                        p.cover_image_url
                          ? {
                              backgroundImage: `url(${p.cover_image_url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags?.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="mt-3 line-clamp-2 font-display text-[17px] font-semibold leading-snug text-foreground">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-[13px] text-muted-foreground leading-[1.6]">
                        {p.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
                        <span>{formatDate(p.published_at)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {p.reading_minutes}m
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-20">
        <ToolboxCrossPromo />
      </section>
    </AppLayout>
  );
}

function EmptyBlog() {
  return (
    <div>
      <div className="rounded-2xl surface-card p-8 lg:p-10">
        <h3 className="font-display text-xl lg:text-2xl font-semibold tracking-[-0.02em] text-foreground">
          No posts published yet.
        </h3>
        <p className="mt-3 text-[14.5px] text-muted-foreground max-w-xl leading-[1.65]">
          Here&apos;s what will land here. Subscribe at the bottom of any page and you&apos;ll get
          the first one.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {POST_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <h4 className="mt-3 text-[14.5px] font-semibold text-foreground leading-snug">
                  {t.title}
                </h4>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-[1.6]">{t.desc}</p>
              </div>
            );
          })}
        </div>
        <Link
          to="/browse"
          className="mt-7 inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base"
        >
          Browse the tool directory meanwhile <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function BlogPostView({ slug }: { slug: string }) {
  const { data: post, isLoading, error } = usePost(slug);
  const { data: allPosts = [] } = useBlogPosts();

  useEffect(() => {
    if (post) setMeta(`${post.title} | RealToolbox.ai`, post.excerpt);
  }, [post]);

  const headings = useMemo(() => (post ? extractHeadings(post.body) : []), [post]);
  const more = useMemo(
    () => allPosts.filter((p) => p.slug !== slug).slice(0, 3),
    [allPosts, slug],
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-[820px] px-6 py-16 lg:px-10">
          <div className="h-8 w-32 animate-pulse rounded bg-foreground/[0.06]" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-foreground/[0.06]" />
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-foreground/[0.04]" />
        </div>
      </AppLayout>
    );
  }
  if (error || !post) return <Navigate to="/blog" replace />;

  return (
    <AppLayout>
      <article className="mx-auto max-w-[820px] px-6 py-12 lg:px-10 lg:py-16">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
        </Button>

        <div className="flex flex-wrap gap-1.5">
          {post.tags?.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] uppercase tracking-wide">
              {t}
            </Badge>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] leading-[1.08] text-foreground sm:text-4xl lg:text-[48px]">
          {post.title}
        </h1>
        <p className="mt-4 text-[17px] text-muted-foreground leading-[1.65]">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-foreground/10 py-4 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{post.author_name}</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.reading_minutes} min read
          </span>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}

        {/* Roundups and comparisons run long — give the reader the shape up front. */}
        {headings.length > 2 && (
          <nav className="mt-8 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/50 font-semibold mb-2">
              In this post
            </p>
            <ul className="flex flex-col gap-1.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-[13.5px] text-foreground/80 hover:text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-8">
          <PostBody
            body={post.body}
            injectAfterBlock={4}
            injected={<BlogEmailCapture source={`blog_post:${post.slug}`} />}
          />
        </div>

        <ToolboxCrossPromo />

        {more.length > 0 && (
          <div className="mt-12 border-t border-foreground/10 pt-8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-4">
              Keep reading
            </p>
            <div className="grid gap-3">
              {more.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group surface-card hover:surface-card-hover rounded-xl px-5 py-4 flex items-center gap-4 transition-base"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] font-semibold text-foreground leading-snug">
                      {p.title}
                    </span>
                    <span className="mt-1 block line-clamp-1 text-[13px] text-muted-foreground">
                      {p.excerpt}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </AppLayout>
  );
}

export default BlogPage;
