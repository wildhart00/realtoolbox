import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, BookOpen, Check, CheckCircle2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";
import { SkillPreviewCard, type SkillCardData } from "@/components/skills/SkillPreviewCard";
import { McpDifferentiatorCallout } from "@/components/toolbox/McpDifferentiatorCallout";

type SkillRow = SkillCardData & { id: string; toolbox?: string | null };

const emailSchema = z.string().trim().min(1, "Email is required").max(255).email("Enter a valid email");

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
        .select("id, name, slug, tagline, description, audience, file_url, access_level, price, toolbox")
        .eq("is_published", true)
        .neq("slug", "setup-guide")
        .order("sort_order", { ascending: true });
      setSkills((data as unknown as SkillRow[]) ?? []);
      setLoadingSkills(false);
    })();
  }, []);

  useEffect(() => {
    document.title = "Toolbox — Operator-grade AI skills for real estate | RealToolbox.ai";
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
      "Buy the toolbox that fits how you invest. One payment, yours forever. Investor Toolbox available now. Complete Toolbox includes the Agent Toolbox free at release.",
    );
  }, []);

  const freeCtaTarget = user
    ? "/toolbox/deal-screen"
    : "/auth?mode=signup&next=" + encodeURIComponent("/toolbox/deal-screen?copy=1");

  async function handleAgentWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(waitlistEmail);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setWaitlistSubmitting(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data, source: "agent_toolbox_waitlist" } as any);
    setWaitlistSubmitting(false);
    if (error && (error as { code?: string }).code !== "23505") {
      toast.error("Couldn't add you to the list. Please try again.");
      return;
    }
    toast.success("You're on the Agent Toolbox waitlist.");
    setWaitlistDone(true);
  }

  const investorSkills = skills.filter((s) => s.toolbox === "investor");
  const agentSkills = skills.filter((s) => s.toolbox === "agent");
  const freeSkills = skills.filter((s) => !s.toolbox || s.toolbox === "free");

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            The Toolbox
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            The toolbox that fits{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              how you invest.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Operator-grade AI skills for real estate. One payment, yours forever — including every new skill we add.
            Built and torture-tested by a 12-year operator. Conservative by design.
          </p>
        </div>
      </section>

      {/* MCP differentiator */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-10">
        <McpDifferentiatorCallout />
      </section>

      {/* Product cards */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
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
                  Every investor skill — buy box, screening, triage, input auditing, strategy selection, walk-away calls, and full underwriting.
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {[
                  "7 operator-grade skills",
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
                Everything in Investor, plus the Agent Toolbox included free the day it releases.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Every investor skill",
                "Agent Toolbox included free at release",
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

          {/* Agent — waitlist */}
          <div className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col gap-5 border border-foreground/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/[0.04] px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Coming soon
              </span>
              <h3 className="mt-3 font-display text-[22px] text-foreground tracking-tight leading-tight">
                Agent Toolbox
              </h3>
              <p className="mt-2 text-[13px] text-muted-foreground">For licensed agents.</p>
              <p className="mt-3 text-[13px] text-muted-foreground leading-[1.65]">
                Listing descriptions, seller lead response, follow-up sequences, pricing narratives, objection handling, and more.
              </p>
            </div>
            {waitlistDone ? (
              <div className="mt-auto inline-flex items-center gap-2 rounded-[10px] border border-success/30 bg-success/10 px-3 py-2.5 text-[13px] font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                You're on the waitlist.
              </div>
            ) : (
              <form onSubmit={handleAgentWaitlist} className="mt-auto flex flex-col gap-2">
                <Input
                  type="email"
                  required
                  placeholder="you@brokerage.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="h-10 bg-background/60 border-foreground/15"
                  disabled={waitlistSubmitting}
                />
                <Button type="submit" size="sm" disabled={waitlistSubmitting} className="w-full">
                  {waitlistSubmitting ? "Adding…" : "Join the waitlist"}
                </Button>
                <Link
                  to="/toolbox/agent"
                  className="text-[12.5px] text-muted-foreground hover:text-foreground text-center underline-offset-2 hover:underline transition-base"
                >
                  Learn more →
                </Link>
              </form>
            )}
          </div>
        </div>

        {/* Try free + Setup guide row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Try before you buy</p>
              <h4 className="mt-1 font-display text-[18px] text-foreground tracking-tight">
                Deal Screen — free forever
              </h4>
              <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
                Paste in any deal and get a fast, conservative read on whether the numbers work.
              </p>
            </div>
            <Link
              to={freeCtaTarget}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base whitespace-nowrap"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">New here?</p>
              <h4 className="mt-1 font-display text-[18px] text-foreground tracking-tight flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[hsl(229_94%_82%)]" /> Setup guide
              </h4>
              <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
                How to load any skill into ChatGPT, Claude, or Gemini — plus MCP setup.
              </p>
            </div>
            <Link
              to="/setup-guide"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base whitespace-nowrap"
            >
              Read the guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Library */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <SectionLabel>The full skill library</SectionLabel>
        {loadingSkills ? (
          <div className="text-sm text-muted-foreground">Loading skills…</div>
        ) : skills.length === 0 ? (
          <div className="text-sm text-muted-foreground">No skills published yet.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {investorSkills.length > 0 && (
              <div>
                <h3 className="font-display text-[20px] text-foreground tracking-tight mb-5">Investor Toolbox</h3>
                <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                  {investorSkills.map((s) => (
                    <div key={s.id} className="w-full md:w-[calc((100%-1.25rem*2)/3)]">
                      <SkillPreviewCard {...s} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {agentSkills.length > 0 && (
              <div>
                <h3 className="font-display text-[20px] text-foreground tracking-tight mb-5">Agent Toolbox</h3>
                <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                  {agentSkills.map((s) => (
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
    </AppLayout>
  );
}
