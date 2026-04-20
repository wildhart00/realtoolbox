import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useState, FormEvent } from "react";
import { ArrowLeft, BadgeCheck, ExternalLink, Star, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTool, useTools, useReviews } from "@/hooks/useDirectory";
import { useAuth } from "@/hooks/useAuth";
import { ToolCard } from "@/components/tools/ToolCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pricingLabels: Record<string, string> = { free: "Free", freemium: "Freemium", paid: "Paid" };
const pricingStyles: Record<string, string> = {
  free: "bg-success/10 text-success border-success/20",
  freemium: "bg-accent/10 text-accent border-accent/20",
  paid: "bg-muted text-muted-foreground border-border",
};

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const ToolDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: tool, isLoading } = useTool(slug);
  const { data: allTools = [] } = useTools();
  const { data: reviews = [] } = useReviews(tool?.id);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const related = useMemo(() => {
    if (!tool) return [];
    const catSlugs = new Set(tool.categories?.map((c) => c.slug));
    return allTools.filter((t) => t.id !== tool.id && t.categories?.some((c) => catSlugs.has(c.slug))).slice(0, 4);
  }, [allTools, tool]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleWriteReview = () => {
    if (!user) {
      toast.error("Sign in to leave a review");
      navigate(`/auth?next=/tools/${slug}`);
      return;
    }
    setReviewOpen(true);
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !tool) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("reviews")
      .upsert({ tool_id: tool.id, user_id: user.id, rating, body: body.trim() || null }, { onConflict: "tool_id,user_id" });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review posted");
    setReviewOpen(false);
    setBody("");
    qc.invalidateQueries({ queryKey: ["reviews", tool.id] });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-6 py-16 lg:px-10">
          <div className="h-8 w-32 animate-pulse rounded bg-muted/60" />
          <div className="mt-6 h-32 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      </AppLayout>
    );
  }

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

  return (
    <AppLayout>
      {/* Header */}
      <section className="border-b border-border/60 bg-gradient-subtle px-6 py-10 lg:px-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> All tools</Link>
        </Button>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={`${tool.name} logo`} className="h-20 w-20 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-accent text-2xl font-bold text-white shadow-md">
                {getInitials(tool.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{tool.name}</h1>
                {tool.is_verified && <BadgeCheck className="h-6 w-6 text-accent" />}
              </div>
              <p className="mt-2 max-w-2xl text-base text-muted-foreground lg:text-lg">{tool.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wide", pricingStyles[tool.pricing])}>
                  {pricingLabels[tool.pricing]}
                </Badge>
                {tool.is_featured && (
                  <Badge variant="outline" className="border-accent/30 bg-accent-soft text-[10px] uppercase tracking-wide text-accent">
                    Featured
                  </Badge>
                )}
                {tool.categories?.map((c) => (
                  <Link key={c.id} to={`/category/${c.slug}`}>
                    <Badge variant="outline" className="hover:border-accent/40">{c.name}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Button asChild variant="hero" size="lg" className="shrink-0">
            <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
              Visit Website <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Main content: 70/30 */}
      <section className="px-6 py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Left 70% */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">About {tool.name}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{tool.description}</p>
            </div>

            {tool.key_features.length > 0 && (
              <div>
                <h2 className="text-xl font-bold tracking-tight">Key features</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tool.key_features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card p-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tool.use_cases.length > 0 && (
              <div>
                <h2 className="text-xl font-bold tracking-tight">Real estate use cases</h2>
                <ul className="mt-4 space-y-2">
                  {tool.use_cases.map((uc, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent text-[10px] font-bold text-accent-foreground">{i + 1}</span>
                      <span>{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right sidebar 30% */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</p>
              <p className="mt-2 text-lg font-semibold">{pricingLabels[tool.pricing]}</p>
              {tool.pricing_details && (
                <p className="mt-1 text-sm text-muted-foreground">{tool.pricing_details}</p>
              )}
            </div>

            {tool.categories && tool.categories.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tool.categories.map((c) => (
                    <Link key={c.id} to={`/category/${c.slug}`}>
                      <Badge variant="outline" className="hover:border-accent/40">{c.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {tool.founder_name && (
              <div className="rounded-2xl border border-border/60 bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Founder</p>
                <div className="mt-3 flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent-soft text-accent font-semibold">
                      {getInitials(tool.founder_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{tool.founder_name}</p>
                    {tool.founder_bio && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.founder_bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-border/60 px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Reviews</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {avgRating ? (
                <>
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold text-foreground">{avgRating}</span>
                  <span>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </>
              ) : (
                <span>No reviews yet — be the first.</span>
              )}
            </div>
          </div>
          <Button onClick={handleWriteReview} variant="accent">
            <MessageSquare className="h-4 w-4" /> Write a review
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              Share your experience using {tool.name} to help fellow real estate pros.
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="rounded-xl border border-border/60 bg-card p-5">
                <header className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent-soft text-accent text-xs font-semibold">
                      {(r.profile?.display_name ?? "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.profile?.display_name ?? "Member"}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-warning text-warning" : "text-muted")} />
                      ))}
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</time>
                </header>
                {r.body && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>}
              </article>
            ))
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border/60 px-6 py-10 lg:px-10">
          <h2 className="text-xl font-bold tracking-tight">Related tools</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((t) => <ToolCard key={t.id} tool={t} />)}
          </div>
        </section>
      )}

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <form onSubmit={submitReview}>
            <DialogHeader>
              <DialogTitle>Review {tool.name}</DialogTitle>
              <DialogDescription>Help the community by sharing your honest experience.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Your rating</label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="p-1"
                      aria-label={`${n} stars`}
                    >
                      <Star className={cn("h-7 w-7 transition", n <= rating ? "fill-warning text-warning" : "text-muted")} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="review-body">Review (optional)</label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did you like? What could be better?"
                  rows={5}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setReviewOpen(false)}>Cancel</Button>
              <Button type="submit" variant="accent" disabled={submitting}>
                {submitting ? "Posting..." : "Post review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ToolDetailPage;
