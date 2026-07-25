import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { INVESTOR_ARC, type ArcStep } from "@/lib/copy/investorArc";

/**
 * Narrative beat 4: what's in the toolbox.
 *
 * Steps come from the shared arc definition so this and /toolbox/investor can't
 * describe the same seven skills differently.
 */
function StepCard({ step }: { step: ArcStep }) {
  return (
    <div
      className={
        "relative surface-card rounded-2xl p-5 flex flex-col items-start gap-2 min-w-[200px] max-w-[260px] flex-1 transition-base " +
        (step.free
          ? "border-[hsl(239_84%_67%)]/40 ring-1 ring-[hsl(239_84%_67%)]/20"
          : "border border-transparent hover:border-foreground/10")
      }
    >
      {step.free && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
          Free
        </span>
      )}
      <span
        className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[13px] font-bold text-white"
        style={{
          background: step.free
            ? "linear-gradient(135deg, hsl(239 84% 60%), hsl(265 84% 60%))"
            : "hsl(230 14% 20%)",
        }}
      >
        {step.num}
      </span>
      <h3 className="font-display text-[15px] font-semibold text-foreground tracking-tight leading-snug">
        {step.title}
      </h3>
      <p className="text-[12.5px] text-muted-foreground leading-[1.55]">{step.desc}</p>
    </div>
  );
}

function ConnectorArrow() {
  return (
    <div className="hidden lg:flex items-center justify-center shrink-0 text-muted-foreground/40">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

export function InvestorArcSection() {
  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Inside the Investor Toolbox
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          Seven skills. One decision path.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          Most prompt packs hand you a pile of disconnected tricks. This is a system — each skill
          picks up where the last one leaves off, walking you from &ldquo;what should I even be
          shopping for&rdquo; to a number you can defend at the table.
        </p>
      </div>

      {/* Step flow */}
      <div className="flex flex-wrap justify-center gap-3 lg:gap-2">
        {INVESTOR_ARC.map((step, i) => (
          <div key={step.num} className="contents">
            <StepCard step={step} />
            {i < INVESTOR_ARC.length - 1 && <ConnectorArrow />}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <Link
          to="/toolbox/investor"
          className="text-[14px] font-semibold text-[hsl(229_94%_82%)] hover:text-[hsl(229_94%_90%)] transition-base"
        >
          See all seven in detail →
        </Link>
      </div>
    </section>
  );
}
