import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, PencilRuler } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { freeDealScreenPath } from "@/lib/routes";

export type ArticleSection = { id: string; title: string };

/**
 * Shared chrome for the written resource guides under /resources/*.
 *
 * `draft` renders a visible, unmissable banner. Several of these guides are
 * scaffolding waiting on operator input — that must be obvious to a reader, not
 * just to whoever edits the file.
 */
export function ResourceArticleLayout({
  eyebrow,
  title,
  intro,
  sections,
  draft = false,
  draftNote,
  metaDescription,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  sections: ArticleSection[];
  draft?: boolean;
  draftNote?: string;
  metaDescription: string;
  children: ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    const plain = typeof title === "string" ? title : eyebrow;
    document.title = `${plain} — RealToolbox.ai`;
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute("content", metaDescription);
  }, [title, eyebrow, metaDescription]);

  return (
    <AppLayout>
      <section className="mx-auto max-w-[880px] px-6 lg:px-10 pt-12 lg:pt-16 pb-6">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Resources
        </Link>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
          {eyebrow}
        </div>

        <h1 className="mt-5 font-display text-4xl lg:text-[50px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        <p className="mt-5 text-[16px] text-muted-foreground leading-[1.7]">{intro}</p>

        {draft && (
          <div className="mt-7 rounded-2xl border border-warning/30 bg-warning/[0.07] px-5 py-4 flex items-start gap-3.5">
            <PencilRuler className="h-4 w-4 shrink-0 mt-[3px] text-warning" strokeWidth={2} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-warning">
                Draft — placeholder content
              </p>
              <p className="mt-1.5 text-[13.5px] text-foreground/80 leading-[1.65]">
                {draftNote ??
                  "This page is structure only. The sections marked below are waiting on operator input and should not be relied on yet."}
              </p>
            </div>
          </div>
        )}

        {sections.length > 0 && (
          <div className="mt-7 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/50 font-semibold mb-2">
              On this page
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-[13px] text-foreground/80 hover:text-[hsl(229_94%_82%)] underline-offset-2 hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[880px] px-6 lg:px-10 pb-14">{children}</section>

      {/* Cross-promo — every resource page routes back to the free skill */}
      <section className="mx-auto max-w-[880px] px-6 lg:px-10 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-[hsl(239_84%_60%)]/10 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/10 px-6 py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/60 to-transparent" />
          <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] font-semibold">
            Put it to work
          </p>
          <h2 className="mt-2 font-display text-[24px] sm:text-[28px] text-foreground tracking-[-0.02em] leading-tight">
            Run a deal through the free Deal Screen.
          </h2>
          <p className="mt-2.5 text-[14px] text-muted-foreground leading-[1.65] max-w-xl">
            It applies this kind of discipline automatically — conservative math, every assumption
            labelled, and a refusal rather than a guess when the inputs are too thin.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to={freeDealScreenPath(!!user)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-[hsl(252_84%_50%)]/20 hover:shadow-[hsl(252_84%_50%)]/35 transition-base"
            >
              Get the free Deal Screen <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/toolbox/investor"
              className="text-[13px] font-semibold text-foreground/80 hover:text-foreground transition-base"
            >
              See the full toolbox →
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

/** A section heading with a stable anchor id, matched to the page's TOC. */
export function ArticleSectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 font-display text-[24px] sm:text-[28px] text-foreground tracking-[-0.02em] leading-tight mt-12 first:mt-0 mb-4"
    >
      {children}
    </h2>
  );
}

/**
 * An explicit, visible gap in the content.
 *
 * Used instead of writing plausible-sounding filler. Nothing here should read as
 * advice — it reads as a question addressed to the operator.
 */
export function TodoStub({ label, asks }: { label: string; asks: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-warning/40 bg-warning/[0.05] px-5 py-4 my-4">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-warning">
        TODO · {label}
      </p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {asks.map((a) => (
          <li key={a} className="flex items-start gap-2.5 text-[13.5px] text-foreground/75">
            <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-warning/70" />
            <span className="leading-[1.6]">{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <p className="text-[14.5px] text-muted-foreground leading-[1.75] mt-4">{children}</p>;
}
