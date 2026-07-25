import { Download, ClipboardPaste, Sparkles } from "lucide-react";

const BEATS = [
  {
    icon: Download,
    title: "Load it",
    desc: "Drop the skill into ChatGPT, Claude, or Gemini once.",
  },
  {
    icon: ClipboardPaste,
    title: "Paste your deal",
    desc: "Address, price, rehab, rents — whatever you have.",
  },
  {
    icon: Sparkles,
    title: "Get an operator-grade answer",
    desc: "Conservative math, clear go/no-go. No invented numbers.",
  },
];

export function WhatThisIsSection() {
  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          What this actually is
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          An AI skill is a complete set of operating instructions.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          Load one into ChatGPT, Claude, or Gemini and it turns your AI into a real estate specialist that follows one job conservatively — the way an operator would.
        </p>
      </div>

      <div className="grid gap-4 md:gap-5 md:grid-cols-3">
        {BEATS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="surface-card rounded-2xl p-6 border border-transparent">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.06] text-[12px] font-bold text-foreground/70">
                  {i + 1}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              </div>
              <div className="text-[15px] font-semibold text-foreground leading-tight">
                {b.title}
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground leading-[1.55]">
                {b.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
