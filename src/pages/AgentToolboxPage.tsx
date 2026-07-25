import { useEffect, useState } from "react";
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

const emailSchema = z.string().trim().min(1, "Email is required").max(255).email("Enter a valid email");

const CONTENTS = [
  "Listing descriptions",
  "Seller lead response",
  "Follow-up sequences",
  "Pricing narratives",
  "Objection handling",
  "Listing presentations",
  "Buyer consultations",
  "Offer & negotiation strategy",
];

const FAQS = [
  {
    q: "What is a skill?",
    a: "A skill is a carefully written instruction file you paste into ChatGPT, Claude, or Gemini. It turns the AI into a specialist for one specific job — like writing a listing description or handling a seller objection.",
  },
  {
    q: "Which AI do I need?",
    a: "Any of the big three: ChatGPT, Claude, or Gemini. The skills are written to work in all of them.",
  },
  {
    q: "Is this a subscription?",
    a: "No. When the Agent Toolbox releases, it's a one-time payment — yours forever with lifetime updates.",
  },
  {
    q: "I already bought the Complete Toolbox — do I need to pay again?",
    a: "No. Complete Toolbox owners get the Agent Toolbox free the day it releases. No extra charge, no upgrade fee.",
  },
  {
    q: "When will it release?",
    a: "Soon — we're finishing torture-testing each skill with working agents. Join the waitlist and you'll be the first to know.",
  },
];

export default function AgentToolboxPage() {
  const { startCheckout, loading } = useCheckout();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Agent Toolbox — Coming soon | RealToolbox.ai";
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
      "The Agent Toolbox is coming — conservative AI skills for licensed agents. Listing descriptions, seller lead response, follow-ups, pricing, objections, and more. Join the waitlist.",
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
      .insert({ email: parsed.data, source: "agent_toolbox_waitlist" } as any);
    setSubmitting(false);
    if (error && (error as { code?: string }).code !== "23505") {
      toast.error("Couldn't add you to the list. Please try again.");
      return;
    }
    toast.success("You're on the Agent Toolbox waitlist.");
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
            The Agent Toolbox{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              is coming.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            Conservative AI skills for licensed agents — built from real flips, rentals, and closings, and torture-tested across ChatGPT, Claude, Gemini, and Meta until they converge before shipping. Skills refuse to invent facts and flag unverified inputs.
          </p>
        </div>
      </section>

      {/* What it will contain */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-14">
        <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-6 py-8 lg:px-10 lg:py-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">What it will contain</p>
          <h2 className="font-display text-[26px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-tight">
            The skills a working agent actually needs.
          </h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTENTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
                <Check className="h-4 w-4 text-[hsl(229_94%_82%)] shrink-0 mt-[3px]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
            Be first in line when it drops. Founding pricing will be locked in for waitlist members.
          </p>

          {success ? (
            <div className="mt-7 inline-flex items-center gap-2 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[14px] font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              You're on the waitlist — we'll be in touch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                required
                placeholder="you@brokerage.com"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Already have Complete?</p>
            <h4 className="mt-1 font-display text-[17px] text-foreground tracking-tight leading-tight">
              Complete Toolbox owners get the Agent Toolbox free at release.
            </h4>
            <p className="mt-1 text-[13px] text-muted-foreground leading-[1.6]">
              No extra charge, no upgrade fee. It just shows up in your account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startCheckout("complete", "/toolbox/agent")}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base whitespace-nowrap disabled:opacity-70"
          >
            {loading ? "Starting…" : "Get Complete Toolbox — $149"}
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
