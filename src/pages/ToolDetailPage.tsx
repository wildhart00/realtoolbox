import { useParams, Link, useNavigate } from "react-router-dom";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MessageSquare, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolLogo, domainFromUrl } from "@/components/tools/ToolLogo";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { useTool, useTools, useReviews } from "@/hooks/useDirectory";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getBrandColor } from "@/lib/brandColor";
import { MeshGradientBanner } from "@/components/tools/MeshGradientBanner";

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
    return allTools
      .filter((t) => t.id !== tool.id && t.categories?.some((c) => catSlugs.has(c.slug)))
      .slice(0, 3);
  }, [allTools, tool]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-6 lg:px-10 py-12 mx-auto" style={{ maxWidth: 1060 }}>
          <div className="h-8 w-32 animate-pulse rounded bg-foreground/[0.06]" />
          <div className="mt-5 h-[200px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
        </div>
      </AppLayout>
    );
  }

  if (!tool) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="font-display text-2xl">Tool not found</h1>
          <Link to="/" className="mt-4 text-muted-foreground hover:text-foreground transition-base">
            ← Back to all tools
          </Link>
        </div>
      </AppLayout>
    );
  }

  const category = tool.categories?.[0];
  const toolDomain = domainFromUrl(tool.website_url);
  const brandColor = getBrandColor(toolDomain);
  const gridId = `grid-${tool.id}`;

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
      .upsert(
        { tool_id: tool.id, user_id: user.id, rating, body: body.trim() || null },
        { onConflict: "tool_id,user_id" },
      );
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review posted");
    setReviewOpen(false);
    setBody("");
    qc.invalidateQueries({ queryKey: ["reviews", tool.id] });
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 pt-5 mx-auto" style={{ maxWidth: 1060 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tools
        </Link>
      </div>

      {/* Hero banner */}
      <div className="px-6 lg:px-10 mt-4 mx-auto" style={{ maxWidth: 1060 }}>
        <MeshGradientBanner tool={tool} />
      </div>


      {/* Title row */}
      <div
        className="px-6 lg:px-10 pt-4 pb-3 mx-auto flex items-start justify-between gap-4 flex-wrap"
        style={{ maxWidth: 1060 }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[28px] font-bold text-foreground tracking-[-0.025em] mb-1.5">
            {tool.name}
          </h1>
          <p className="text-[14px] text-muted-foreground mb-3">{tool.tagline}</p>
          <div className="flex flex-wrap items-center gap-2">
            <PricingBadge pricing={tool.pricing} />
            {category && (
              <span className="text-[12px] px-2.5 py-[3px] rounded-md bg-foreground/[0.06] text-muted-foreground border border-foreground/[0.1]">
                {category.name}
              </span>
            )}
          </div>
        </div>
        <Link
          to={`/go/${tool.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-[11px] px-6 py-3 text-[14px] font-semibold shadow-glow-indigo shrink-0 hover:opacity-95 transition-base"
        >
          Visit Website
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mx-6 lg:mx-10 h-px bg-foreground/[0.06]" />

      {/* Body */}
      <div
        className="px-6 lg:px-10 py-10 lg:py-12 mx-auto flex flex-col lg:flex-row gap-10 items-start"
        style={{ maxWidth: 1060 }}
      >
        <div className="flex-1 min-w-0 space-y-10 w-full">
          {/* About */}
          <section>
            <h2 className="font-display text-[20px] font-bold text-foreground mb-3.5 tracking-[-0.02em]">
              About {tool.name}
            </h2>
            <div className="space-y-3.5">
              {(tool.full_description ?? tool.description ?? "")
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="text-[14px] text-muted-foreground leading-[1.75]">
                    {p}
                  </p>
                ))}
            </div>
          </section>

          {/* Features */}
          {tool.key_features?.length > 0 && (
            <section>
              <h2 className="font-display text-[20px] font-bold text-foreground mb-3.5 tracking-[-0.02em]">
                Key features &amp; benefits
              </h2>
              <div className="space-y-2">
                {tool.key_features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 surface-card rounded-[10px] px-4 py-3.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/15 border border-success/30 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-foreground/80 leading-[1.55]">{f}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Use cases */}
          {tool.use_cases?.length > 0 && (
            <section>
              <h2 className="font-display text-[20px] font-bold text-foreground mb-3.5 tracking-[-0.02em]">
                Real estate use cases
              </h2>
              <div className="space-y-3.5">
                {tool.use_cases.map((u, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-[26px] h-[26px] rounded-full bg-gradient-accent text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[14px] text-muted-foreground leading-[1.7]">{u}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-[20px] font-bold text-foreground tracking-[-0.02em] mb-1">
                  Reviews
                </h2>
                <p className="text-[13px] text-foreground/30">
                  {reviews.length === 0
                    ? "No reviews yet — be the first."
                    : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
                </p>
              </div>
              <button
                onClick={handleWriteReview}
                className="inline-flex items-center gap-1.5 bg-foreground/[0.05] border border-foreground/10 rounded-[9px] px-4 py-2.5 text-foreground/80 text-[13px] font-medium hover:bg-foreground/[0.08] transition-base"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Write a review
              </button>
            </div>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-foreground/[0.08] bg-foreground/[0.02] p-7 text-center">
                <p className="text-[13px] text-foreground/30">
                  Share your experience using {tool.name} to help fellow real estate pros.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <article key={r.id} className="surface-card rounded-xl p-5">
                    <header className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {r.profile?.display_name ?? "Member"}
                      </p>
                      <time className="text-xs text-foreground/30">
                        {new Date(r.created_at).toLocaleDateString()}
                      </time>
                    </header>
                    <div className="flex gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < r.rating ? "fill-warning text-warning" : "text-foreground/15",
                          )}
                        />
                      ))}
                    </div>
                    {r.body && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section>
              <h2 className="font-display text-[20px] font-bold text-foreground mb-4 tracking-[-0.02em]">
                Related tools
              </h2>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/tools/${r.slug}`}
                    className="surface-card hover:surface-card-hover rounded-xl p-4 transition-base"
                  >
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <ToolLogo
                        domain={domainFromUrl(r.website_url)}
                        name={r.name}
                        customUrl={r.logo_url}
                        size={36}
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-foreground truncate">{r.name}</div>
                        <div className="text-[11px] text-foreground/30 truncate">
                          {r.categories?.[0]?.name ?? "Tool"}
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-[1.5] line-clamp-2 mb-2.5">
                      {r.tagline}
                    </p>
                    <PricingBadge pricing={r.pricing} className="text-[9px] px-1.5 py-[1px]" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[78px]">
          <div className="bg-foreground/[0.02] border border-foreground/[0.07] rounded-[14px] overflow-hidden">
            <div className="px-[18px] py-4 border-b border-foreground/[0.06]">
              <div className="text-[10px] uppercase tracking-[0.1em] text-foreground/30 font-semibold mb-1.5">
                Pricing
              </div>
              <div className="text-[16px] font-semibold text-foreground capitalize">{tool.pricing}</div>
              {tool.pricing_details && (
                <div className="text-[12px] text-muted-foreground mt-1">{tool.pricing_details}</div>
              )}
            </div>
            {category && (
              <div className="px-[18px] py-4 border-b border-foreground/[0.06]">
                <div className="text-[10px] uppercase tracking-[0.1em] text-foreground/30 font-semibold mb-2">
                  Categories
                </div>
                <span className="inline-block text-[12px] px-2.5 py-1 rounded-md bg-foreground/[0.06] text-muted-foreground border border-foreground/[0.09]">
                  {category.name}
                </span>
              </div>
            )}
            {tool.tags?.length > 0 && (
              <div className="px-[18px] py-4 border-b border-foreground/[0.06]">
                <div className="text-[10px] uppercase tracking-[0.1em] text-foreground/30 font-semibold mb-2">
                  Best for
                </div>
                <div className="space-y-1.5">
                  {tool.tags.map((t) => (
                    <div key={t} className="text-[12px] text-muted-foreground">• {t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="px-[18px] py-4">
              <div className="text-[10px] uppercase tracking-[0.1em] text-foreground/30 font-semibold mb-2">
                Scope
              </div>
              <span
                className="text-[12px]"
                style={{ color: tool.re_only ? "hsl(229 94% 82%)" : "hsl(var(--success))" }}
              >
                {tool.re_only ? "Real estate specific" : "General + RE use"}
              </span>
            </div>
          </div>
        </aside>
      </div>

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
                    <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                      <Star
                        className={cn(
                          "h-7 w-7 transition",
                          n <= rating ? "fill-warning text-warning" : "text-foreground/20",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="review-body">
                  Review (optional)
                </label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-accent text-white rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post review"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ToolDetailPage;
