import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLayout } from "@/components/layout/AppLayout";
import { HowToUseSteps } from "@/components/skills/HowToUseSteps";
import { CaptureDialog, type StageKey } from "@/components/capture/CaptureDialog";
import { supabase } from "@/integrations/supabase/client";

type SkillRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  audience: string;
  file_url: string | null;
  access_level: string;
  price: number;
};

function stageFromTagline(tagline: string | null): StageKey {
  const t = (tagline ?? "").toLowerCase();
  if (t.includes("scaling")) return "scaling";
  if (t.includes("active")) return "active";
  return "first";
}

export default function SkillDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);

  const { data: skill, isLoading } = useQuery({
    queryKey: ["skill-detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<SkillRow | null> => {
      const { data, error } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, description, audience, file_url, access_level, price")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SkillRow) ?? null;
    },
  });

  const isPaid = !!skill && skill.access_level === "paid" && Number(skill.price) > 0;

  const { data: markdown } = useQuery({
    queryKey: ["skill-md", skill?.file_url],
    enabled: !!skill && !isPaid && !!skill.file_url,
    queryFn: async (): Promise<string> => {
      const r = await fetch(skill!.file_url!);
      if (!r.ok) throw new Error("Failed to load");
      return r.text();
    },
  });

  useEffect(() => {
    if (!skill) return;
    document.title = `${skill.name} — RealToolbox.ai`;
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute("content", (skill.description ?? skill.tagline ?? "Operator-grade AI workflow for real estate investors.").slice(0, 160));
  }, [skill]);

  return (
    <AppLayout>
      <section className="mx-auto max-w-[900px] px-6 lg:px-10 pt-12 lg:pt-16 pb-10">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All skills
        </Link>

        {isLoading ? (
          <div className="mt-10 text-sm text-muted-foreground">Loading…</div>
        ) : !skill ? (
          <div className="mt-10 text-sm text-muted-foreground">
            Skill not found. <Link to="/skills" className="underline">Back to all skills</Link>.
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center gap-3">
              <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.08em]">
                {skill.tagline ?? "Skill"}
              </span>
              {isPaid && <Lock className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />}
            </div>

            <h1 className="mt-4 font-display text-4xl lg:text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
              {skill.name}
            </h1>

            {skill.description && (
              <p className="mt-5 text-[16.5px] text-muted-foreground leading-[1.7]">
                {skill.description}
              </p>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
              >
                {isPaid ? "Coming soon — Join for early access" : "Start free"}
              </button>
            </div>
          </>
        )}
      </section>

      {skill && (
        <>
          <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-12">
            <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-5">
              How to use it
            </p>
            <HowToUseSteps />
          </section>

          <section className="mx-auto max-w-[900px] px-6 lg:px-10 pb-20">
            {isPaid ? (
              <div className="rounded-2xl p-7 surface-card">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
                  What's inside
                </h2>
                <p className="mt-3 text-[15px] text-muted-foreground leading-[1.7]">
                  {skill.description ?? "A complete operator workflow you can drop into ChatGPT, Claude, or Gemini."}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-md transition-base hover:shadow-[hsl(252_84%_50%)]/40"
                  >
                    Coming soon — Join for early access
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-7 lg:p-9 surface-card">
                {markdown ? (
                  <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-[-0.01em] prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-p:leading-[1.7] prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-[hsl(229_94%_82%)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                  </div>
                ) : skill.file_url ? (
                  <div className="text-sm text-muted-foreground">Loading skill…</div>
                ) : (
                  <div className="text-sm text-muted-foreground">Full skill coming soon.</div>
                )}
              </div>
            )}
          </section>

          <CaptureDialog
            open={open}
            onOpenChange={setOpen}
            mode={isPaid ? "early-access" : "free-skill"}
            source={isPaid ? `skill_detail_paid_${skill.slug}` : `skill_detail_${skill.slug}`}
            initialStage={isPaid ? stageFromTagline(skill.tagline) : undefined}
          />
        </>
      )}
    </AppLayout>
  );
}
