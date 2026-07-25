import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Check, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCheckout } from "@/hooks/useCheckout";
import { useSeo } from "@/lib/seo";

const emailSchema = z.string().trim().min(1, "Email is required").max(255).email("Enter a valid email");

/**
 * What the Scaling Toolbox will cover — the business layer above deal analysis.
 *
 * Framed throughout as diagnosis, not growth. No income figures, no timelines,
 * no promises about what a business will do — the same standard the deal skills
 * hold themselves to about comps.
 */
const CONTENTS = [
  "Lead economics — what a lead costs you and what it returns",
  "Cost per contract, by source",
  "Marketing channel performance, compared honestly",
  "KPI diagnostics — which numbers are actually telling you something",
  "Conversion drop-off, stage by stage",
  "Finding the constraint that's capping the business",
  "Capacity checks before you spend on more volume",
  "Reading your own numbers when they disagree",
];

const FAQS = [
  {
    q: "Who is this for?",
    a: "Investors who are past their first few deals and doing consistent volume. If you're still working out whether a deal clears, the Investor Toolbox is the one you want — this sits above that, on the business doing the deals.",
  },
  {
    q: "How is this different from the Investor Toolbox?",
    a: "The Investor Toolbox analyzes a property. The Scaling Toolbox analyzes the operation — where leads come from, what they cost, where they stall, and which single constraint is holding the whole thing back.",
  },
  {
    q: "What will it cost?",
    a: "Not announced yet. The skills are still being written and tested, and pricing won't be set until they're finished. Waitlist members will hear first.",
  },
  {
    q: "I already bought the Complete Toolbox — do I need to pay again?",
    a: "No. Complete Toolbox owners get the Scaling Toolbox free the day it releases. No extra charge, no upgrade fee.",
  },
  {
    q: "What happened to the Agent Toolbox?",
    a: "It was cancelled as a separate product. Agents working with investor clients are better served by the Investor Toolbox itself — same seven skills, used to underwrite the properties their buyers send over. There's a page explaining that fit.",
  },
  {
    q: "When will it release?",
    a: "No date yet. Each skill goes through the same cross-model testing as the investor skills before it ships, and that takes as long as it takes.",
  },
];

export default function ScalingToolboxPage() {
  const { startCheckout, loading } = useCheckout();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useSeo({
    title: "Scaling Toolbox — Coming soon | RealToolbox.ai",
    description:
      "For investors already doing volume: AI skills for the business layer above deal analysis — lead economics, cost per contract, channel performance, and finding the constraint that's capping the operation. Join the waitlist.",
    canonicalPath: "/toolbox/scaling",
  });

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
      .insert({ email: parsed.data, source: "scaling_toolbox_waitlist" });
    setSubmitting(false);
    if (error && (error as { code?: string }).code !== "23505") {
      toast.error("Couldn't add you to the list. Please try again.");
      return;
    }
    toast.success("You're on the Scaling Toolbox waitlist.");
    setSuccess(true);
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Coming soon
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            The Scaling Toolbox{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              is coming.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Deal skills tell you whether a property works. These tell you whether the business buying
            them works — where the leads come from, what they cost, where they stall, and which one
            constraint is capping everything else.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-14">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Who it&apos;s for
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            You&apos;re doing deals. You&apos;re not sure what&apos;s holding you back.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Past the first few deals, the hard question stops being &ldquo;does this one
            clear?&rdquo; and becomes &ldquo;why isn&apos;t more of this working?&rdquo; That
            question has an answer, and it&apos;s usually one specific thing — not effort, not
            mindset, and rarely the thing you assumed.
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {[
            {
              title: "Not for your first deal",
              body: "If you're still working out whether a property clears, start with the Investor Toolbox. This assumes you already can.",
            },
            {
              title: "For the operation, not the property",
              body: "Marketing spend, lead flow, conversion, capacity — the numbers that describe the business rather than a single address.",
            },
            {
              title: "Diagnosis, not encouragement",
              body: "The output is a reading of where the constraint sits and what it would take to move it. Same conservative standard as the deal skills.",
            },
          ].map((c) => (
            <div key={c.title} className="surface-card rounded-2xl p-6 lg:p-7">
              <h3 className="font-display text-[18px] text-foreground tracking-tight leading-snug">
                {c.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.7]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it will contain */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-14">
        <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-6 py-8 lg:px-10 lg:py-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            What it will cover
          </p>
          <h2 className="font-display text-[26px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-tight">
            The business layer above deal analysis.
          </h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTENTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
                <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[3px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-muted-foreground/80 leading-[1.65] max-w-2xl">
            Same guardrails as the deal skills: they work from numbers you supply, flag anything
            unverified, and decline to diagnose an operation they don&apos;t have enough data on.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section className="mx-auto max-w-[820px] px-6 lg:px-10 pb-14">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <h2 className="font-display text-2xl lg:text-[32px] font-bold tracking-[-0.02em] text-foreground">
            Join the waitlist
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-[1.65]">
            No price announced yet. Waitlist members hear first when it does.
          </p>

          {success ? (
            <div className="mt-7 inline-flex items-center gap-2 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[14px] font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              You&apos;re on the waitlist.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background/60 border-foreground/15"
                disabled={submitting}
              />
              <Button type="submit" variant="hero" size="lg" disabled={submitting} className="shrink-0">
                {submitting ? "Adding…" : "Notify Me"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Complete note */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-6 py-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Already have Complete?
            </p>
            <h4 className="mt-1 font-display text-[17px] text-foreground tracking-tight leading-tight">
              Complete Toolbox owners get the Scaling Toolbox free at release.
            </h4>
            <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
              No extra charge, no upgrade fee. It just shows up in your account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startCheckout("complete", "/toolbox/scaling")}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base whitespace-nowrap disabled:opacity-70"
          >
            {loading ? "Starting…" : "Get Complete Toolbox — $149"}
          </button>
        </div>
      </section>

      {/* FAQ */}
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

        <p className="mt-12 text-center text-[12.5px] text-muted-foreground/70">
          Built from real flips, rentals, and closings. Conservative by design.
        </p>

        <div className="mt-6 text-center">
          <Link
            to="/toolbox"
            className="text-[13px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-base"
          >
            ← Back to all toolboxes
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
