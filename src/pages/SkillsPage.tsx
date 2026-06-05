import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  ArrowRight,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SkillPreviewCard, type SkillCardData } from "@/components/skills/SkillPreviewCard";

const steps: { n: string; title: string; subtext?: string; icon: typeof Download }[] = [
  { n: "1", title: "Pick a workflow", subtext: "Choose the one for the job in front of you.", icon: Download },
  {
    n: "2",
    title: "Load it into your AI",
    subtext: "ChatGPT, Claude, Gemini, or any assistant. Copy it in, or save it once.",
    icon: Upload,
  },
  { n: "3", title: "Get operator-grade output", subtext: "The numbers and judgment of someone who's run the deals.", icon: Sparkles },
];

const STAGE_OPTIONS = [
  { value: "first_deal", label: "Working on my first deal" },
  { value: "actively_investing", label: "Actively flipping or investing" },
  { value: "scaling", label: "Scaling a team & operations" },
] as const;

type SkillRow = SkillCardData & { id: string };

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Enter a valid email address");

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
      <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  );
}

export default function SkillsPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, audience, file_url, access_level, price")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      setSkills((data as unknown as SkillRow[]) ?? []);
      setLoadingSkills(false);
    })();
  }, []);

  useEffect(() => {
    document.title = "AI Workflows for Real Estate Investors — RealToolbox.ai";
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      "Operator-grade AI workflows for real estate investors — deal analysis, lead conversion, pricing, follow-up, and KPIs. Drop into Claude, ChatGPT or Gemini.",
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source: "skills_waitlist", investor_stage: stage } as any);
    setSubmitting(false);

    if (error) {
      // 23505 = unique_violation
      if ((error as { code?: string }).code === "23505") {
        toast.success("You're already on the list — we'll be in touch soon.");
        setSuccess(true);
        return;
      }
      toast.error("Couldn't add you to the list. Please try again.");
      return;
    }
    toast.success("You're on the list — founder pricing locked in.");
    setSuccess(true);
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-16 lg:min-h-[640px]">
        <div className="grid gap-12 lg:grid-cols-[55fr_45fr] lg:items-center">
          <div className="max-w-2xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
              Operator-grade workflows
            </div>
            <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
              AI workflows for{" "}
              <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
                real estate investors.
              </span>
            </h1>
            <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65]">
              Each one turns your AI into a specialist for one money task — deal analysis, lead conversion, pricing, follow-up, KPIs — built from real flipping and rental experience. Copy it into your AI and go.
            </p>
          </div>

          {/* Floating card cluster — desktop only */}
          <div className="hidden lg:block overflow-visible">
            <div className="relative h-[500px] w-full pr-2 pointer-events-none overflow-visible">
              {/* Glow */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full blur-3xl bg-[radial-gradient(closest-side,hsl(265_84%_70%/0.55),hsl(229_94%_75%/0.30)_45%,transparent_75%)]"
              />

              <div className="relative h-full w-full motion-safe:animate-float-slow">
                {/* Card A — back */}
                <div className="absolute top-0 left-0 w-[272px] rounded-2xl p-[18px] surface-card -rotate-[5deg] z-10 shadow-2xl shadow-black/40">
                  <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
                    For Agents
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em] text-foreground leading-tight">
                    Listing Description Writer
                  </h3>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-[1.6]">
                    MLS-ready listing copy in your voice.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground/90 px-3 py-1.5 text-[12px] font-semibold text-background">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </div>
                </div>

                {/* Card B — front */}
                <div className="absolute top-[200px] left-[180px] w-[272px] rounded-2xl p-[18px] surface-card rotate-[4deg] z-20 shadow-2xl shadow-black/50 ring-1 ring-foreground/10">
                  <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
                    For Agents
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em] text-foreground leading-tight">
                    Offer & Negotiation Strategist
                  </h3>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-[1.6]">
                    Build, present, and negotiate from strength.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground/90 px-3 py-1.5 text-[12px] font-semibold text-background">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative rounded-2xl p-6 surface-card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-[12px] font-bold text-white">
                    {s.n}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </div>
                <div className="text-[15px] font-semibold text-foreground leading-tight">
                  {s.title}
                </div>
                {s.subtext && (
                  <p className="mt-2 text-[13px] text-muted-foreground leading-[1.55]">
                    {s.subtext}
                  </p>
                )}
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Available skills */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <SectionLabel>Available skills</SectionLabel>
        {loadingSkills ? (
          <div className="text-sm text-muted-foreground">Loading skills…</div>
        ) : skills.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No skills published yet — check back soon.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {skills.map((s) => (
              <div
                key={s.id}
                className="w-full md:w-[calc((100%-1.25rem*2)/3)]"
              >
                <SkillPreviewCard {...s} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Email capture */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.01] px-8 py-10 lg:px-14 lg:py-14">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Stay Updated
            </span>
            <h2 className="mt-4 font-display text-2xl lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.1] text-foreground">
              New skills drop regularly
            </h2>
            <p className="mt-3 text-[14.5px] text-muted-foreground leading-[1.65]">
              We build real estate skills from real-world expertise and add new ones all the time.
              Drop your email to get notified when fresh skills land.
            </p>

            {success ? (
              <div className="mt-7 inline-flex items-center gap-2 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[14px] font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                You're on the list — we'll be in touch when skills drop.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-7 flex flex-col sm:flex-row gap-2 sm:gap-2 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  required
                  placeholder="you@brokerage.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background/60 border-foreground/15"
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={submitting}
                  className="shrink-0"
                >
                  {submitting ? "Adding…" : "Notify Me"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Submit callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Built your own real estate skill?
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Share it with the community — we'll feature the best ones.
          </p>
          <Link
            to="/submit"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
          >
            Share it <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
