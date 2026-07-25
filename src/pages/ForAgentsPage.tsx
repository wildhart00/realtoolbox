import { Link } from "react-router-dom";
import { ArrowRight, ClipboardPaste, Loader2, Plug } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCheckout } from "@/hooks/useCheckout";
import { useAuth } from "@/hooks/useAuth";
import { GuardrailCards } from "@/components/shared/GuardrailCards";
import { INVESTOR_ARC } from "@/lib/copy/investorArc";
import { freeDealScreenPath } from "@/lib/routes";
import { useSeo } from "@/lib/seo";

/**
 * /for-agents — the Investor Toolbox, positioned for agents with investor clients.
 *
 * Not a separate product and not a separate SKU: same seven skills, same $79,
 * same investor checkout. The page exists because the buying reason is
 * different — an agent isn't underwriting for themselves, they're handing a
 * client something their competitors can't.
 */
const THE_ARGUMENT = [
  {
    label: "What most agents can offer",
    body: "A read on the neighbourhood, a sense of whether the price looks right, and a comp set pulled from the MLS. Useful, but it's an opinion — and an investor client can get an opinion anywhere.",
    dim: true,
  },
  {
    label: "What you can offer instead",
    body: "A written underwrite on the property they sent you: a safe maximum offer, the assumptions it rests on, what would kill the deal, and a straight verdict — including a refusal when the inputs are too thin to support one.",
    dim: false,
  },
];

const WHY_IT_HOLDS = [
  {
    title: "It answers the question they actually asked",
    body: "An investor client sending you a listing is asking whether the numbers work, not whether you like the kitchen. The seven skills answer that question in the terms they'd use themselves.",
  },
  {
    title: "It's a service, not a favour",
    body: "Turning a forwarded Zillow link into a defensible underwrite is work most agents won't do, because doing it by hand takes an evening. This takes minutes, and it's the reason a serious investor keeps calling you instead of someone else.",
  },
  {
    title: "It protects the relationship",
    body: "The skills refuse to invent comps or rents and refuse a verdict on weak inputs. That means you're never handing a client a confident number you can't stand behind — which is the one mistake that ends an investor relationship permanently.",
  },
];

const RUN_METHODS = [
  {
    icon: ClipboardPaste,
    title: "Copy and paste",
    body: "Copy the skill, paste it into ChatGPT, Claude, or Gemini, paste in the property. Works from a phone between showings.",
  },
  {
    icon: Plug,
    title: "Or connect it directly",
    body: "Connect your toolbox to Claude or ChatGPT once and the skills load themselves on request — always the current version.",
  },
];

export default function ForAgentsPage() {
  const { startCheckout, loading } = useCheckout();
  const { user } = useAuth();

  useSeo({
    title: "For agents with investor clients — RealToolbox.ai",
    description:
      "Hand your investor clients a defensible underwrite instead of an opinion. The same seven Investor Toolbox skills — safe max offer, what kills the deal, a straight verdict — run on any property your buyer sends over. $79, one payment.",
    canonicalPath: "/for-agents",
  });

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            For agents
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            Your investor client sent you a listing.{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              Send back an underwrite.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            The same seven skills investors use on their own deals, run by you on the properties your
            buyers forward over. A safe maximum offer, the assumptions behind it, and what would kill
            the deal — in the time it takes to read the listing.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
            >
              See the price <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to={freeDealScreenPath(!!user)}
              className="text-[13.5px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              Or try one free on a client&apos;s property →
            </Link>
          </div>
        </div>
      </section>

      {/* The argument */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            The difference
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            &ldquo;That looks like a good deal&rdquo; is not a service.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Every agent chasing investor business says a version of the same sentence. It costs
            nothing to say, which is exactly why it&apos;s worth nothing to hear.
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {THE_ARGUMENT.map((a) => (
            <div
              key={a.label}
              className={
                a.dim
                  ? "rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-7"
                  : "relative rounded-2xl flex"
              }
            >
              {a.dim ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/40 font-semibold">
                    {a.label}
                  </p>
                  <p className="mt-3 text-[14px] text-muted-foreground/80 leading-[1.7]">{a.body}</p>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] opacity-90" />
                  <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] p-6 lg:p-7 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
                      {a.label}
                    </p>
                    <p className="mt-3 text-[14px] text-foreground/85 leading-[1.7]">{a.body}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:gap-5 md:grid-cols-3">
          {WHY_IT_HOLDS.map((w) => (
            <div key={w.title} className="surface-card rounded-2xl p-6 lg:p-7">
              <h3 className="font-display text-[17px] text-foreground tracking-tight leading-snug">
                {w.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.7]">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The seven skills */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            What you get
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            The same seven skills. No separate agent edition.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            This is the Investor Toolbox — not a rebranded version of it. You&apos;re running the
            work your client would run, which is the whole point: the underwrite you hand back is
            the one they&apos;d have done themselves.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      </section>

      {/* Guardrails */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Why you can put your name on it
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            It won&apos;t hand your client a number you can&apos;t defend.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            You&apos;re passing this work to someone who will act on it. The guardrails exist so
            that what you pass on is honest about its own limits.
          </p>
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

      {/* How you run it */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Running a skill
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            No new software. It runs in the AI you already have.
          </h2>
        </div>
        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {RUN_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="surface-card rounded-2xl p-6 lg:p-7">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <h3 className="mt-3.5 font-display text-[19px] text-foreground tracking-tight leading-tight">
                  {m.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.65]">{m.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5">
          <Link
            to="/how-it-works#connect-your-toolbox"
            className="text-[13.5px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
          >
            See how it works, step by step →
          </Link>
        </div>
      </section>

      {/* Price */}
      <section id="pricing" className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-20 scroll-mt-20">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 px-6 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            One payment. Yours forever.
          </h2>
          <p className="mt-3 text-[14px] text-muted-foreground leading-[1.65] max-w-xl mx-auto">
            Same toolbox, same price your investor clients pay. There is no agent tier and no
            per-seat charge.
          </p>
          <div className="mt-5 flex items-baseline justify-center gap-2">
            <span className="font-display text-[52px] font-bold text-foreground leading-none">$79</span>
            <span className="text-[16px] text-muted-foreground line-through">$99</span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Founding price · Lifetime updates included
          </p>
          <button
            type="button"
            onClick={() => startCheckout("investor", "/for-agents")}
            disabled={loading}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting…
              </>
            ) : (
              <>Get the Investor Toolbox — $79</>
            )}
          </button>
          <p className="mt-5 text-[13px] text-muted-foreground">
            Not ready?{" "}
            <Link
              to={freeDealScreenPath(!!user)}
              className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
            >
              Run the free Deal Screen on a client&apos;s property
            </Link>{" "}
            — no card.
          </p>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Working your own deals too?{" "}
          <Link
            to="/toolbox/investor"
            className="text-[hsl(229_94%_82%)] font-semibold underline-offset-2 hover:underline"
          >
            The full Investor Toolbox page
          </Link>{" "}
          covers the same seven skills from the investor&apos;s side.
        </p>
      </section>
    </AppLayout>
  );
}
