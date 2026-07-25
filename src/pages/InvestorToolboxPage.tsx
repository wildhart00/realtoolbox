import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";
import { SkillPreviewCard, type SkillCardData } from "@/components/skills/SkillPreviewCard";
import { McpDifferentiatorCallout } from "@/components/toolbox/McpDifferentiatorCallout";

type SkillRow = SkillCardData & { id: string; sort_order?: number };

const ARC_STEPS = [
  "Define your buy box",
  "Screen the deal",
  "Triage the pipeline",
  "Audit your inputs",
  "Pick your strategy",
  "Know when to walk",
  "Underwrite the offer",
];

const FAQS = [
  {
    q: "What is a skill?",
    a: "A skill is a carefully written instruction file you paste into ChatGPT, Claude, or Gemini. It turns the AI into a specialist for one specific job — like screening a deal or building a buy box — using conservative prompts and guardrails.",
  },
  {
    q: "Which AI do I need?",
    a: "Any of the big three: ChatGPT, Claude, or Gemini. The skills are written to work in all of them. If you use Claude or ChatGPT, you can also connect directly via our MCP integration.",
  },
  {
    q: "Is this a subscription?",
    a: "No. One payment, yours forever. Lifetime updates included — every new investor skill we add is yours automatically.",
  },
  {
    q: "Do I need a paid ChatGPT or Claude account?",
    a: "Free tiers work for basic use. For longer analyses, uploaded documents, and MCP access, a paid plan (ChatGPT Plus or Claude Pro) gives you a much better experience.",
  },
  {
    q: "How do I load a skill?",
    a: "Every skill comes with a one-click copy button. Paste it into a new chat as the system prompt (or into a Claude Project / ChatGPT Custom GPT), and start working the deal. Full setup guide included.",
  },
];

const WHAT_YOU_GET = [
  "7 conservative deal skills",
  "Universal setup guide (ChatGPT, Claude, Gemini)",
  "Lifetime updates as new investor skills drop",
  "One-click copy-to-clipboard delivery",
  "Works with ChatGPT, Claude, and Gemini",
  "Connect directly to Claude and ChatGPT via our MCP integration",
];

export default function InvestorToolboxPage() {
  const { startCheckout, loading } = useCheckout();
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, description, audience, access_level, price, toolbox, sort_order")
        .eq("is_published", true)
        .eq("toolbox", "investor")
        .order("sort_order", { ascending: true });
      setSkills((data as unknown as SkillRow[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    document.title = "Investor Toolbox — 7 AI skills for real estate investors | RealToolbox.ai";
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
      "Make your first safe deal decision without losing your shirt. Seven conservative AI skills — buy box, screening, triage, input audit, strategy, walk-away, underwriting. One payment, yours forever.",
    );
  }, []);

  const freeCtaTarget = user
    ? "/toolbox/deal-screen"
    : "/auth?mode=signup&next=" + encodeURIComponent("/toolbox/deal-screen?copy=1");

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Investor Toolbox
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            Make your first safe deal decision{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              without losing your shirt.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Seven conservative AI skills that walk you from a raw address to a defensible offer.
            Skills refuse to invent comps, taxes, or rents — they flag unverified inputs. Torture-tested across ChatGPT, Claude, Gemini, and Meta until they converge before shipping.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => startCheckout("investor", "/toolbox/investor")}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <>Get the Investor Toolbox — $79</>}
            </button>
            <Link
              to={freeCtaTarget}
              className="text-[13.5px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-base"
            >
              Or try Deal Screen free →
            </Link>
          </div>
          <p className="mt-3 text-[12.5px] text-muted-foreground/70">
            Founding price. One payment, yours forever. Lifetime updates.
          </p>
        </div>
      </section>

      {/* MCP differentiator — promoted above feature list */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-10">
        <McpDifferentiatorCallout />
      </section>

      {/* The arc */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">The journey</p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Seven skills. One arc from address to offer.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Each skill does one job well. Together they cover the full decision path — the way a real
            deal actually gets worked.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {ARC_STEPS.map((step, i) => (
            <li
              key={step}
              className="surface-card rounded-xl p-4 flex items-start gap-3 border border-foreground/10"
            >
              <span className="font-display text-[22px] font-bold text-[hsl(229_94%_82%)] leading-none w-7 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13.5px] text-foreground/85 leading-[1.5] pt-1">{step}</span>
            </li>
          ))}
        </ol>

        {skills.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {skills.map((s) => (
              <div key={s.id} className="w-full md:w-[calc((100%-1.25rem*2)/3)]">
                <SkillPreviewCard {...s} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-6 py-8 lg:px-10 lg:py-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">What you get</p>
          <h2 className="font-display text-[26px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-tight">
            Everything you need to run a deal.
          </h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
                <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[3px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Buy CTA */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 px-6 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            One payment. Yours forever.
          </h2>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="font-display text-[52px] font-bold text-foreground leading-none">$79</span>
            <span className="text-[16px] text-muted-foreground line-through">$99</span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">Founding price · Lifetime updates included</p>
          <button
            type="button"
            onClick={() => startCheckout("investor", "/toolbox/investor")}
            disabled={loading}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <>Get the Investor Toolbox — $79</>}
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[820px] px-6 lg:px-10 pb-20">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">FAQ</p>
        <h2 className="font-display text-[26px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-tight mb-6">
          Straight answers.
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-foreground/10">
              <AccordionTrigger className="text-[15px] text-foreground text-left hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] text-muted-foreground leading-[1.7]">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-12 text-center text-[12.5px] text-muted-foreground/70">
          Built from real flips, rentals, and closings. Conservative by design.
        </p>
      </section>
    </AppLayout>
  );
}
