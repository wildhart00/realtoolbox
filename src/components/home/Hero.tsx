import { useState } from "react";
import { Link } from "react-router-dom";
import { CaptureDialog } from "@/components/capture/CaptureDialog";

export function Hero({ toolCount: _toolCount }: { toolCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 lg:px-10 pt-[88px] pb-14 text-center mx-auto" style={{ maxWidth: 820 }}>
      <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/20 rounded-full px-3.5 py-[5px] mb-[26px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[hsl(229_94%_82%)]" />
        <span className="text-[11px] tracking-[0.16em] text-[hsl(229_94%_82%)] font-semibold uppercase">
          For real estate investors &amp; operators
        </span>
      </div>

      <h1
        className="font-display font-bold text-foreground mb-[20px]"
        style={{ fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
      >
        Build and scale a real estate business with{" "}
        <span className="italic text-[hsl(229_94%_82%)]">AI that knows the numbers.</span>
      </h1>

      <p className="text-[16px] text-muted-foreground leading-[1.65] mx-auto" style={{ maxWidth: 640 }}>
        AI workflows built by a real estate operator, not a prompt writer. Load one into ChatGPT, Claude, or Gemini for operator-grade help with deals, leads, KPIs, and scaling — in minutes.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/25 hover:shadow-[hsl(252_84%_50%)]/40 transition-base"
        >
          Start free — Deal Screen
        </button>
        <Link
          to="/skills"
          className="text-[14px] font-semibold text-foreground/80 hover:text-foreground transition-base"
        >
          See the workflows →
        </Link>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground/75 leading-[1.65] text-center mx-auto" style={{ maxWidth: 600 }}>
        ChatGPT doesn&apos;t know how a flip gets underwritten or why your follow-up isn&apos;t converting. These do — because an operator built them.
      </p>

      <CaptureDialog
        open={open}
        onOpenChange={setOpen}
        mode="free-skill"
        source="hero_deal_screen"
      />
    </section>
  );
}
