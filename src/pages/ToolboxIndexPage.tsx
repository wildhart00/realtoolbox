import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, BookOpen, Check, CheckCircle2, Compass, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";
import { SkillPreviewCard, type SkillCardData } from "@/components/skills/SkillPreviewCard";
import { McpDifferentiatorCallout } from "@/components/toolbox/McpDifferentiatorCallout";
import { GuardrailCards } from "@/components/shared/GuardrailCards";
import { freeDealScreenPath } from "@/lib/routes";
import { useSeo } from "@/lib/seo";

type SkillRow = SkillCardData & { id: string; toolbox?: string | null };

const emailSchema = z.string().trim().min(1, "Email is required").max(255).email("Enter a valid email");

const WHAT_IT_SOLVES = [
  {
    title: "You don't know what you don't know",
    body: "The seven skills are the questions a seasoned operator asks, in the order they ask them. You don't have to know which question comes next — the arc does.",
  },
  {
    title: "A general AI will make things up",
    body: "Ask ChatGPT to underwrite a property cold and it will produce comps, taxes, and rents that look right. These skills treat those as inputs you supply, not answers they generate.",
  },
  {
    title: "Spreadsheets don't argue back",
    body: "A calculator returns whatever you feed it. These skills push back — flagging what's unverified and refusing a verdict when the inputs won't support one.",
  },
];

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

/**
 * Toolbox index.
 *
 * Order matters here: this page used to open on three price cards, which asked a
 * visitor to compare $79 against $149 before they knew what either one contained.
 * Value now runs first — what the toolbox is, why it can be trusted, what's
 * actually in it, and the free skill — and pricing sits at the bottom under its
 * own anchor so the nav and other pages can still deep-link to it.
 */
export default function ToolboxIndexPage() {
  const { user } = useAuth();
  const { startCheckout, loading } = useCheckout();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, description, audience, access_level, price, toolbox")
        .eq("is_published", true)
        .neq("slug", "setup-guide")
        .order("sort_order", { ascending: true });
      setSkills((data as unknown as SkillRow[]) ?? []);
      setLoadingSkills(false);
    })();
  }, []);

  useSeo({
    title: "The Toolbox — Conservative AI skills for real estate deals | RealToolbox.ai",
    description:
      "A working set of AI skills that analyze real estate deals conservatively — refusing to invent numbers and refusing a verdict on weak inputs. Start with the free Deal Screen.",
    canonicalPath: "/toolbox",
  });

  const freeCtaTarget = freeDealScreenPath(!!user);

  async function handleScalingWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(waitlistEmail);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setWaitlistSubmitting(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source: "scaling_toolbox_waitlist" });
    setWaitlistSubmitting(false);
    if (error && (error as { code?: string }).code !== "23505") {
      toast.error("Couldn't add you to the list. Please try again.");
      return;
    }
    toast.success("You're on the Scaling Toolbox waitlist.");
    setWaitlistDone(true);
  }

  const investorSkills = skills.filter((s) => s.toolbox === "investor");
  const freeSkills = skills.filter((s) => !s.toolbox || s.toolbox === "free");

  return (
    <AppLayout>
      {/* 1 — What the toolbox is */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            The Toolbox
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            A working set of skills for{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              deciding on a deal.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Load one into ChatGPT, Claude, or Gemini and your assistant starts working a property the
            way an operator does — one question at a time, conservatively, showing every number it
            used and where that number came from.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to={freeCtaTarget}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
            >
              Start free with Deal Screen <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="text-[13.5px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              Skip to pricing →
            </a>
          </div>
        </div>
      </section>

      {/* 2 — The problem it solves */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionLabel>What it's for</SectionLabel>
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {WHAT_IT_SOLVES.map((w) => (
            <div key={w.title} className="surface-card rounded-2xl p-6 lg:p-7">
              <h3 className="font-display text-[18px] text-foreground tracking-tight leading-snug">
                {w.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.7]">{w.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[13.5px] text-muted-foreground leading-[1.65]">
          Working with investor clients rather than buying yourself?{" "}
          <Link
            to="/for-agents"
            className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
          >
            The same seven skills, positioned for agents →
          </Link>
        </p>
      </section>

      {/* 3 — Why it can be trusted */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionLabel>How they're built</SectionLabel>
        <GuardrailCards />
        <div className="mt-5">
          <Link
            to="/how-it-works#why-these-are-different"
            className="text-[13.5px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
          >
            What each of those means in practice →
          </Link>
        </div>
      </section>

      {/* 4 — What's actually in it */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionLabel>The full skill library</SectionLabel>
        {loadingSkills ? (
          <div className="text-sm text-muted-foreground">Loading skills…</div>
        ) : skills.length === 0 ? (
          <div className="text-sm text-muted-foreground">No skills published yet.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {investorSkills.length > 0 && (
              <div>
                <h3 className="font-display text-[20px] text-foreground tracking-tight mb-5">
                  Investor Toolbox
                </h3>
                <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                  {investorSkills.map((s) => (
                    <div key={s.id} className="w-full md:w-[calc((100%-1.25rem*2)/3)]">
                      <SkillPreviewCard {...s} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {freeSkills.length > 0 && (
              <div>
                <h3 className="font-display text-[20px] text-foreground tracking-tight mb-5">Free</h3>
                <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                  {freeSkills.map((s) => (
                    <div key={s.id} className="w-full md:w-[calc((100%-1.25rem*2)/3)]">
                      <SkillPreviewCard {...s} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5 — How you run it */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionLabel>Running a skill</SectionLabel>
        <McpDifferentiatorCallout />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/how-it-works"
            className="group rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-6 py-5 flex items-center gap-4 justify-between hover:bg-foreground/[0.06] transition-base"
          >
            <div>
              <h4 className="font-display text-[17px] text-foreground tracking-tight flex items-center gap-2">
                <Compass className="h-4 w-4 text-[hsl(229_94%_82%)]" /> How it works
              </h4>
              <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
                What a skill is, both ways to run one, and where the free one fits.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
          </Link>

          <Link
            to="/setup-guide"
            className="group rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-6 py-5 flex items-center gap-4 justify-between hover:bg-foreground/[0.06] transition-base"
          >
            <div>
              <h4 className="font-display text-[17px] text-foreground tracking-tight flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[hsl(229_94%_82%)]" /> Setup guide
              </h4>
              <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
                Step-by-step for ChatGPT, Claude, and Gemini, plus MCP setup.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
          </Link>
        </div>
      </section>

      {/* 6 — Try it free */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <div className="relative rounded-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] opacity-90" />
          <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] px-6 py-8 lg:px-10 lg:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)]">
                Free forever
              </span>
              <h3 className="mt-3 font-display text-[24px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-[1.15]">
                Try one before you buy any of them.
              </h3>
              <p className="mt-3 text-[14.5px] text-muted-foreground leading-[1.6]">
                Deal Screen is free with an account and behaves exactly like the paid skills —
                including refusing to answer when you haven&apos;t given it enough.
              </p>
            </div>
            <Link
              to={freeCtaTarget}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
            >
              Get the free Deal Screen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 — Price, last */}
      <section id="pricing" className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20 scroll-mt-20">
        <SectionLabel>Own it</SectionLabel>
        <div className="max-w-2xl mb-8">
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            One payment. Yours forever.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            No subscription. Every new skill added to a toolbox you own is yours automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Investor */}
          <div className="relative rounded-2xl flex">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]" />
            <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] p-6 lg:p-7 flex flex-col gap-5 flex-1">
              <div>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  Available now
                </span>
                <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                  Investor Toolbox
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-[40px] font-bold text-foreground leading-none">$79</span>
                  <span className="text-[14px] text-muted-foreground line-through">$99</span>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">Founding price · one-time payment</p>
                <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                  Every investor skill — buy box, screening, triage, input auditing, strategy
                  selection, walk-away calls, and full underwriting.
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {[
                  "7 conservative deal skills",
                  "Connects directly to Claude & ChatGPT (MCP)",
                  "Works in ChatGPT, Claude, and Gemini",
                  "Lifetime updates as new investor skills drop",
                  "One payment — own it forever",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                    <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[1px]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCheckout("investor", "/toolbox")}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <>Get the Investor Toolbox → $79</>}
                </button>
                <Link
                  to="/toolbox/investor"
                  className="text-[12.5px] text-muted-foreground hover:text-foreground text-center underline-offset-2 hover:underline transition-base"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </div>

          {/* Complete */}
          <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-foreground/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Best Value
              </span>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                Complete Toolbox
              </h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-bold text-foreground leading-none">$149</span>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">Founding price · one-time payment</p>
              <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                Everything in Investor, plus the Scaling Toolbox free the day it releases.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Every investor skill",
                "Scaling Toolbox included free at release",
                "Connects directly to Claude & ChatGPT (MCP)",
                "Lifetime updates on both",
                "One payment — own it forever",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[1px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-2">
              <button
                type="button"
                onClick={() => startCheckout("complete", "/toolbox")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-5 py-2.5 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base disabled:opacity-70"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <>Get the Complete Toolbox → $149</>}
              </button>
              <Link
                to="/toolbox/investor"
                className="text-[12.5px] text-muted-foreground hover:text-foreground text-center underline-offset-2 hover:underline transition-base"
              >
                See what's inside →
              </Link>
            </div>
          </div>

          {/* Scaling — waitlist. No price: none is announced. */}
          <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-foreground/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Coming soon
              </span>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                Scaling Toolbox
              </h3>
              <p className="mt-2 text-[13px] text-muted-foreground">For investors doing volume.</p>
              <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                The business layer above deal analysis — lead economics, cost per contract, channel
                performance, and finding the constraint that&apos;s capping the operation.
              </p>
            </div>
            {waitlistDone ? (
              <div className="mt-auto inline-flex items-center gap-2 rounded-[10px] border border-success/30 bg-success/10 px-3 py-2.5 text-[13px] font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                You're on the waitlist.
              </div>
            ) : (
              <form onSubmit={handleScalingWaitlist} className="mt-auto flex flex-col gap-2">
                <Input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="h-10 bg-background/60 border-foreground/15"
                  disabled={waitlistSubmitting}
                />
                <Button type="submit" size="sm" disabled={waitlistSubmitting} className="w-full">
                  {waitlistSubmitting ? "Adding…" : "Join the waitlist"}
                </Button>
                <Link
                  to="/toolbox/scaling"
                  className="text-[12.5px] text-muted-foreground hover:text-foreground text-center underline-offset-2 hover:underline transition-base"
                >
                  Learn more →
                </Link>
              </form>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
