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
import { SkillPreviewCard } from "@/components/skills/SkillPreviewCard";

const steps: { n: string; title: string; subtext?: string; icon: typeof Download }[] = [
  { n: "1", title: "Download the file", icon: Download },
  {
    n: "2",
    title: "Add it to your AI assistant",
    subtext: "Claude Project, Custom GPT, Gemini Gem, or just paste it in.",
    icon: Upload,
  },
  { n: "3", title: "Reference it in any prompt", icon: Sparkles },
];

const skills = [
  {
    title: "Listing Description Writer",
    description: "Input property details, get MLS-ready copy in your voice.",
    audience: "For Agents",
  },
  {
    title: "Deal Analyzer",
    description:
      "Input purchase price, rents and expenses, get a full investment scorecard.",
    audience: "For Investors",
  },
  {
    title: "Weekly Market Report",
    description:
      "Input your MLS data, get a client-ready market update narrative.",
    audience: "For Agents + Investors",
  },
];

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
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Claude Skills for Real Estate — RealToolbox.ai";
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
      "Real-estate AI skills — done-for-you instruction files that turn any AI assistant (Claude, ChatGPT, Gemini) into a listing writer, deal analyzer and market report generator.",
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
      .insert({ email: parsed.data, source: "skills_waitlist" });
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
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Skills
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
            Real estate skills for{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              any AI
            </span>
          </h1>
          <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65] max-w-3xl">
            A skill is a ready-made instruction file that turns any AI assistant into a real estate
            specialist for one specific task. Load it once and your AI follows it every time — no
            re-prompting, no copy-paste. Just consistent, professional output built from real-world
            real estate expertise. Works in Claude, ChatGPT, Gemini, and any assistant that lets
            you add instructions.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
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
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Email capture */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.01] px-8 py-10 lg:px-14 lg:py-14">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.04] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Early Access
            </span>
            <h2 className="mt-4 font-display text-2xl lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.1] text-foreground">
              First skills launching soon — get early access
            </h2>
            <p className="mt-3 text-[14.5px] text-muted-foreground leading-[1.65]">
              We're building real estate Claude skills from the ground up — starting with the
              Listing Description Writer, Deal Analyzer, and Weekly Market Report. Drop your email
              to be first in line when they launch and get founder pricing.
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
                  {submitting ? "Adding…" : "Get Early Access"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* What's coming */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <SectionLabel>What's coming</SectionLabel>
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {skills.map((s) => (
            <SkillPreviewCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Submit callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24">
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
