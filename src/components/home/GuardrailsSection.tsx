import { Link } from "react-router-dom";
import { GuardrailCards } from "@/components/shared/GuardrailCards";

/**
 * Narrative beat 2: why it's trustworthy.
 *
 * Short form only — the full argument lives on /how-it-works. This section
 * answers the ten-second question ("is this real, or is it a prompt pack?")
 * and hands off.
 */
export function GuardrailsSection() {
  return (
    <section className="px-6 lg:px-10 py-14 lg:py-16 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="mb-10 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
          Why you can act on it
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] text-foreground tracking-[-0.02em] leading-tight">
          The dangerous answer is the confident one.
        </h2>
        <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
          A general AI will invent a comp and hand it to you in a clean table. These skills are
          written to do the opposite — show their work, name what they don&apos;t know, and stop
          rather than guess.
        </p>
      </div>

      <GuardrailCards />

      <div className="mt-6">
        <Link
          to="/how-it-works#why-these-are-different"
          className="text-[13.5px] font-semibold text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
        >
          What that looks like on a real deal →
        </Link>
      </div>
    </section>
  );
}
