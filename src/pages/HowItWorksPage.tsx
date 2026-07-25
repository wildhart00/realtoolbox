import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardPaste, Plug } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HowToUseSteps } from "@/components/skills/HowToUseSteps";
import { ConnectMcpBlock } from "@/components/mcp/ConnectMcpBlock";
import { useAuth } from "@/hooks/useAuth";
import { GUARDRAILS } from "@/lib/copy/guardrails";
import { INVESTOR_ARC } from "@/lib/copy/investorArc";
import { freeDealScreenPath } from "@/lib/routes";

const RUN_METHODS = [
  {
    icon: ClipboardPaste,
    kicker: "Works everywhere",
    title: "Copy and paste it",
    body:
      "Every skill has a copy button. Paste it into a new chat — ChatGPT, Claude, Gemini, whichever you already use — and start working the deal. Nothing to install beyond the account you already made.",
    detail: [
      "Works on free tiers of every major assistant.",
      "Paste it once per chat, or save it into a Claude Project or a ChatGPT Custom GPT and reuse it.",
      "This is the fallback that always works, on any device.",
    ],
  },
  {
    icon: Plug,
    kicker: "Claude & ChatGPT",
    title: "Connect it directly",
    body:
      "Connect your toolbox to Claude or ChatGPT once and you stop handling files entirely. You ask for a skill in plain language and your AI fetches it — the current version, gated to what you own.",
    detail: [
      'Ask for it by name: "Load the deal screen."',
      "You always get the latest version — no stale copy sitting in a note app.",
      "Uses MCP, the open standard those apps use to connect to outside tools.",
    ],
  },
];

export default function HowItWorksPage() {
  const { user } = useAuth();
  const freeCtaTarget = freeDealScreenPath(!!user);

  useEffect(() => {
    document.title = "How it works — AI skills for real estate deals | RealToolbox.ai";
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
      "What an AI skill is, the two ways to run one — copy-paste or a direct connection to Claude and ChatGPT — and what makes these skills conservative enough to trust on a real deal.",
    );
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 lg:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            How it works
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            You already have the AI.{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              This is what to put in it.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            No new app to learn. You bring a deal, the skill brings the underwriting discipline, and
            your assistant does the arithmetic in front of you. Here&apos;s exactly what that means.
          </p>
        </div>
      </section>

      {/* What an AI skill is */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Start here
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            An AI skill is a complete set of operating instructions.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Not a prompt, not a template. A skill is a long, specific brief that tells the AI what
            job it&apos;s doing, what order to do it in, which numbers it&apos;s allowed to assume,
            and when to stop and say it doesn&apos;t have enough. Load one and a general assistant
            starts behaving like a specialist who has worked a thousand deals.
          </p>
        </div>

        <HowToUseSteps />

        <p className="mt-6 text-[13.5px] text-muted-foreground leading-[1.65] max-w-2xl">
          A prompt gets you an answer. A skill gets you the same answer twice — which is the part
          that matters when you&apos;re about to put money behind it.
        </p>
      </section>

      {/* Two ways to run it — public landing target for every MCP callout on the site */}
      <section
        id="connect-your-toolbox"
        className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16 scroll-mt-24"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Running a skill
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Two ways to run it. Both are yours.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Copy-paste works in every AI app there is. Connecting directly works in Claude and
            ChatGPT and saves you from ever managing a file. Most people start with the first and
            move to the second once they&apos;re running deals weekly.
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {RUN_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
                    {m.kicker}
                  </span>
                </div>
                <h3 className="font-display text-[20px] text-foreground tracking-tight leading-tight">
                  {m.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.65]">{m.body}</p>
                <ul className="mt-4 flex flex-col gap-2 border-t border-foreground/[0.07] pt-4">
                  {m.detail.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[13px] text-foreground/75">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[hsl(229_94%_82%)]" />
                      <span className="leading-[1.55]">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* No walkthrough link: this page is the public walkthrough, and the full
            guide behind it is gated. */}
        <div className="mt-5">
          <ConnectMcpBlock variant="compact" showWalkthroughLink={false} />
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground leading-[1.65] max-w-2xl">
          Already have an account?{" "}
          <Link to="/setup-guide" className="text-[hsl(229_94%_82%)] underline-offset-2 hover:underline">
            The full setup guide
          </Link>{" "}
          walks through each client step by step.
        </p>
      </section>

      {/* What makes these different */}
      <section
        id="why-these-are-different"
        className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-16 scroll-mt-24"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Why these are different
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Built to be wrong out loud rather than confident and quiet.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            The danger with AI and a deal isn&apos;t a bad answer — it&apos;s a good-looking answer.
            Four constraints are written into every skill to make that harder.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {GUARDRAILS.map((g, i) => (
            <div
              key={g.key}
              className="surface-card rounded-2xl p-6 lg:p-7 flex flex-col sm:flex-row gap-4 sm:gap-7"
            >
              <div className="sm:w-[240px] shrink-0">
                <span className="font-display text-[22px] font-bold text-[hsl(229_94%_82%)] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-[17px] text-foreground tracking-tight leading-snug">
                  {g.title}
                </h3>
              </div>
              <p className="text-[13.5px] text-muted-foreground leading-[1.7] flex-1">{g.long}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-muted-foreground/70 leading-[1.65] max-w-2xl">
          Written from real flips, rentals, and closings — the standard is what a seasoned operator
          would accept before signing, not what an AI can produce quickly.
        </p>
      </section>

      {/* Where the free Deal Screen fits */}
      <section className="mx-auto max-w-[1100px] px-6 lg:px-10 pb-20">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
            Where to start
          </p>
          <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
            Deal Screen is step two, and it&apos;s free.
          </h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            The Investor Toolbox is seven skills in the order a deal actually gets worked. Deal
            Screen — the fast go/no-go on whether the numbers clear at all — is free with an account,
            so you can see how a skill behaves on one of your own deals before deciding anything.
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
              <span className="font-display text-[20px] font-bold text-[hsl(229_94%_82%)] leading-none w-7 shrink-0 pt-[2px]">
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

        <div className="mt-10 relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 px-6 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
          <h2 className="font-display text-[26px] sm:text-[32px] text-foreground tracking-[-0.02em] leading-tight">
            Run one of your own deals through it.
          </h2>
          <p className="mt-3 text-[14px] text-muted-foreground leading-[1.65] max-w-xl mx-auto">
            Free account, no card. Ten minutes tells you more than any description on this page.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={freeCtaTarget}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
            >
              Get the free Deal Screen <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/toolbox"
              className="text-[14px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              See the toolbox →
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
