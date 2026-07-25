import { GUARDRAILS } from "@/lib/copy/guardrails";

/**
 * The four guardrails as a card grid. Used on the homepage and both toolbox
 * pages so the trust claims are worded identically wherever they appear.
 */
export function GuardrailCards() {
  return (
    <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {GUARDRAILS.map((g) => (
        <div key={g.key} className="surface-card rounded-2xl p-6 border border-transparent">
          <div className="text-[15px] font-semibold text-foreground leading-snug">{g.title}</div>
          <p className="mt-2.5 text-[13px] text-muted-foreground leading-[1.6]">{g.short}</p>
        </div>
      ))}
    </div>
  );
}
