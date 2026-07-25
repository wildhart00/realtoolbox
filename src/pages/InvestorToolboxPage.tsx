import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
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
import { GuardrailCards } from "@/components/shared/GuardrailCards";
import { INVESTOR_ARC } from "@/lib/copy/investorArc";
import { freeDealScreenPath } from "@/lib/routes";
import { useSeo } from "@/lib/seo";

type SkillRow = SkillCardData & { id: string; sort_order?: number };

const FAQS = [
  {
    q: "What is a skill?",
    a: "A skill is a long, specific set of operating instructions you hand to ChatGPT, Claude, or Gemini. It tells the AI what job it's doing, in what order, which numbers it may assume, and when to stop and say it doesn't have enough. Loading one turns a general assistant into a specialist for a single job.",
  },
  {
    q: "Which AI do I need?",
    a: "Any of the big three: ChatGPT, Claude, or Gemini. Every skill is written and tested to behave the same in all of them. If you use Claude or ChatGPT you can also connect your toolbox directly, so skills load themselves.",
  },
  {
    q: "Is this a subscription?",
    a: "No. One payment, yours forever. Every new investor skill added after you buy is included automatically.",
  },
  {
    q: "Do I need a paid ChatGPT or Claude account?",
    a: "Free tiers work for basic use. For longer analyses, uploaded documents, and a direct connection, a paid plan gives you a noticeably better experience.",
  },
  {
    q: "Can I try one first?",
    a: "Yes — Deal Screen is free with an account, no card. It behaves exactly like the paid skills, including refusing to give you a verdict when the inputs are too thin.",
  },
  {
    q: "How do I load a skill?",
    a: "Every skill has a one-click copy button. Paste it into a new chat, or save it into a Claude Project or ChatGPT Custom GPT and reuse it. The setup guide walks through both, plus connecting directly.",
  },
  {
    q: "I'm an agent, not an investor. Is this for me?",
    a: "If you work with investor clients, yes — this is the same toolbox, used to underwrite the properties your buyers send over so you can hand back a defensible number instead of an opinion. There's no separate agent edition and no separate price; the /for-agents page makes that case in full.",
  },
  {
    q: "What about the Complete Toolbox?",
    a: "Complete is $149 and adds the Scaling Toolbox — the business layer above deal analysis, for investors already doing volume — free the day it releases. If you're working individual deals, Investor is the one you want.",
  },
];

const WHAT_YOU_GET = [
  "7 conservative deal skills covering the full decision path",
  "Universal setup guide (ChatGPT, Claude, Gemini)",
  "Lifetime updates as new investor skills drop",
  "One-click copy-to-clipboard delivery",
  "Direct connection to Claude and ChatGPT, so skills load themselves",
  "One payment — own it forever",
];

/**
 * Investor Toolbox detail page.
 *
 * Like /toolbox, this page previously put the price in the hero. It now runs
 * value first — the seven skills, what you get, how you run it — and the price
 * appears once, at the bottom, under #pricing.
 */
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

  useSeo({
    title: "Investor Toolbox — 7 AI skills for real estate investors | RealToolbox.ai",
    description:
      "Seven conservative AI skills that walk a deal from a raw address to a defensible offer — buy box, screening, triage, input audit, strategy, walk-away, underwriting.",
    canonicalPath: "/toolbox/investor",
  });

  const freeCtaTarget = freeDealScreenPath(!!user);

  return (
    <AppLayout>
      {/* 1 — What it is */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Investor Toolbox
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            Make your first real deal decision{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              without losing your shirt.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Seven skills that take a property from a raw address to a number you can defend at the
            table — each one asking the question a seasoned operator would ask next, and none of
            them willing to invent a figure to get there.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#the-seven"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
            >
              See the seven skills <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to={freeCtaTarget}
              className="text-[13.5px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              Or try Deal Screen free →
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — The arc */}
      <section id="the-seven" className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            The journey
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Seven skills. One arc from address to offer.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Each skill does one job well. Together they cover the full decision path — the way a real
            deal actually gets worked.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {INVESTOR_ARC.map((step) => (
            <li
              key={step.num}
              className={
                "surface-card rounded-xl p-4 flex items-start gap-3 " +
                (step.free
                  ? "border-[hsl(239_84%_67%)]/40 ring-1 ring-[hsl(239_84%_67%)]/20"
                  : "border border-foreground/10")
              }
            >
              <span className="font-display text-[22px] font-bold text-[hsl(229_94%_82%)] leading-none w-7 shrink-0">
                {String(step.num).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-foreground leading-snug">
                  {step.title}
                  {step.free && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.12em] text-white align-middle">
                      Free
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[12.5px] text-muted-foreground leading-[1.5]">
                  {step.desc}
                </span>
              </span>
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

      {/* 3 — Why you can act on it */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            How they're built
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Conservative by construction, not by tone.
          </h2>
        </div>
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

      {/* 4 — What you get */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-6 py-8 lg:px-10 lg:py-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            What you get
          </p>
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

      {/* 5 — How you run it */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <McpDifferentiatorCallout />
      </section>

      {/* 6 — Price, last */}
      <section id="pricing" className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16 scroll-mt-20">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 px-6 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            One payment. Yours forever.
          </h2>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="font-display text-[52px] font-bold text-foreground leading-none">$79</span>
            <span className="text-[16px] text-muted-foreground line-through">$99</span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Founding price · Lifetime updates included
          </p>
          <button
            type="button"
            onClick={() => startCheckout("investor", "/toolbox/investor")}
            disabled={loading}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <>Get the Investor Toolbox — $79</>}
          </button>
          <p className="mt-5 text-[13px] text-muted-foreground">
            Not ready?{" "}
            <Link
              to={freeCtaTarget}
              className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
            >
              Start with the free Deal Screen
            </Link>{" "}
            — no card.
          </p>
        </div>
      </section>

      {/* 7 — FAQ */}
      <section className="mx-auto max-w-[820px] px-6 lg:px-10 pb-20">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          FAQ
        </p>
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

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Still deciding?{" "}
          <Link
            to="/how-it-works"
            className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
          >
            Read how it works
          </Link>
          . Working with investor clients?{" "}
          <Link
            to="/for-agents"
            className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
          >
            See the agent fit
          </Link>
          .
        </p>

        <p className="mt-10 text-center text-[12.5px] text-muted-foreground/70">
          Built from real flips, rentals, and closings. Conservative by design.
        </p>
      </section>
    </AppLayout>
  );
}
