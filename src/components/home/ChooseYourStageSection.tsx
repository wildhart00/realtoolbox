import { useState } from "react";
import { Link } from "react-router-dom";
import { CaptureDialog, type CaptureMode, type StageKey } from "@/components/capture/CaptureDialog";

type StageCard = {
  tag: string;
  title: string;
  body: string;
  buttonLabel: string;
  mode: CaptureMode;
  stage: StageKey;
  source: string;
};

const STAGES: StageCard[] = [
  {
    tag: "First Deal",
    title: "Doing your first deal",
    body: "Screen deals, learn the numbers, and dodge rookie mistakes with workflows that think like a seasoned investor.",
    buttonLabel: "Start free",
    mode: "free-skill",
    stage: "first",
    source: "stage_first",
  },
  {
    tag: "Actively Investing",
    title: "Flipping or renting now",
    body: "Tighten deal analysis, lead conversion, and follow-up so more deals close.",
    buttonLabel: "Join for early access",
    mode: "early-access",
    stage: "active",
    source: "stage_active",
  },
  {
    tag: "Scaling",
    title: "Building a business",
    body: "KPI systems, sales process, hiring, and ops workflows to push toward real monthly profit.",
    buttonLabel: "Join for early access",
    mode: "early-access",
    stage: "scaling",
    source: "stage_scaling",
  },
];

export function ChooseYourStageSection() {
  const [active, setActive] = useState<StageCard | null>(null);

  return (
    <section
      id="stage-signup"
      className="px-6 lg:px-10 py-12 lg:py-16 mx-auto"
      style={{ maxWidth: 1100 }}
    >
      <div className="mb-8 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Choose your stage
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Built for every stage of the climb.
        </h2>
        <p className="mt-2 text-[14.5px] text-muted-foreground leading-relaxed">
          Wherever you are, there&apos;s a lane — and it grows with you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAGES.map((s) => (
          <div
            key={s.title}
            className="surface-card rounded-2xl p-6 flex flex-col gap-4 min-h-[280px] border border-transparent hover:border-[hsl(239_84%_67%)]/30 transition-base"
          >
            <span className="inline-flex w-fit items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)]">
              {s.tag}
            </span>
            <h3 className="font-display text-[22px] text-foreground tracking-tight leading-tight">
              {s.title}
            </h3>
            <p className="text-[13px] text-muted-foreground leading-[1.65] flex-1">
              {s.body}
            </p>
            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setActive(s)}
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
              >
                {s.buttonLabel} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <CaptureDialog
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        mode={active?.mode ?? "free-skill"}
        source={active?.source ?? "stage_first"}
        initialStage={active?.stage}
      />
    </section>
  );
}
