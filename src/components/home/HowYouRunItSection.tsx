import { Link } from "react-router-dom";
import { ClipboardPaste, Plug } from "lucide-react";

/**
 * Narrative beat 5: how you actually run one of these.
 *
 * Replaces the old WhatThisIsSection + HowConnectionWorks pair, which between
 * them explained the delivery mechanism twice — once before the visitor knew
 * what the product was. The direct connection is a real differentiator, so it
 * gets equal billing here, but the full walkthrough lives on /how-it-works.
 */
const WAYS = [
  {
    icon: ClipboardPaste,
    title: "Copy and paste it",
    desc: "One button copies the skill. Paste it into ChatGPT, Claude, or Gemini and start working the deal. Works on free tiers, works on your phone.",
    tag: "Works everywhere",
  },
  {
    icon: Plug,
    title: "Or connect it directly",
    desc: "Connect your toolbox to Claude or ChatGPT once and skills load themselves on request — always the current version, only what you own. No files to manage.",
    tag: "Claude & ChatGPT",
  },
];

export function HowYouRunItSection() {
  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Running a skill
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          No new app. It runs inside the AI you already use.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          A skill is a set of operating instructions you hand your assistant. There are two ways to
          get it there — and you can switch between them any time.
        </p>
      </div>

      <div className="grid gap-4 md:gap-5 md:grid-cols-2">
        {WAYS.map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.title} className="surface-card rounded-2xl p-6 lg:p-7 border border-transparent">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
                  {w.tag}
                </span>
              </div>
              <div className="font-display text-[19px] text-foreground tracking-tight leading-tight">
                {w.title}
              </div>
              <p className="mt-2.5 text-[13.5px] text-muted-foreground leading-[1.65]">{w.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Link
          to="/how-it-works"
          className="text-[13.5px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
        >
          See how it works, step by step →
        </Link>
      </div>
    </section>
  );
}
