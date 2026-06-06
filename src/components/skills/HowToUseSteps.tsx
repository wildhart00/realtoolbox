import { ArrowRight, Download, Upload, Sparkles } from "lucide-react";

const steps = [
  { n: "1", title: "Pick a workflow", subtext: "Choose the one for the job in front of you.", icon: Download },
  { n: "2", title: "Load it into your AI", subtext: "ChatGPT, Claude, Gemini, or any assistant. Copy it in, or save it once.", icon: Upload },
  { n: "3", title: "Get operator-grade output", subtext: "The numbers and judgment of someone who's run the deals.", icon: Sparkles },
];

export function HowToUseSteps() {
  return (
    <div className="grid gap-4 md:gap-5 md:grid-cols-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.n} className="relative rounded-2xl p-6 surface-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-[12px] font-bold text-white">
                {s.n}
              </span>
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className="text-[15px] font-semibold text-foreground leading-tight">
              {s.title}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground leading-[1.55]">
              {s.subtext}
            </p>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}
