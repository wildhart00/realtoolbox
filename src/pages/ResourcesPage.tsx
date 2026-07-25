import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  PencilRuler,
  Ruler,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { ResourceCard, type ResourceRow } from "@/components/resources/ResourceCard";
import { useAuth } from "@/hooks/useAuth";
import { freeDealScreenPath } from "@/lib/routes";

type FilterKey = "all" | "guide" | "prompt-library" | "template" | "download" | "video";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "guide", label: "Guides" },
  { key: "prompt-library", label: "Prompt Libraries" },
  { key: "template", label: "Templates" },
  { key: "download", label: "Downloads" },
  { key: "video", label: "Videos" },
];

type Entry = {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  meta?: string;
  draft?: boolean;
};

/** Step 1 — orientation. What this is and how to run it. */
const START_HERE: Entry[] = [
  {
    to: "/how-it-works",
    icon: Compass,
    title: "How it works",
    desc: "What an AI skill actually is, the two ways to run one, and what makes these conservative enough to act on.",
    meta: "5 min read",
  },
  {
    to: "/setup-guide",
    icon: Zap,
    title: "Setup guide",
    desc: "Load a skill into ChatGPT, Claude, or Gemini step by step — plus connecting your toolbox directly.",
    meta: "Free account required",
  },
];

/** Step 2 — the reference material the skills assume you understand. */
const REFERENCE: Entry[] = [
  {
    to: "/resources/glossary",
    icon: BookOpen,
    title: "Glossary",
    desc: "Every term the skills use — ARV, NOI, cap rate, DSCR, BRRRR, seasoning — in plain language.",
    meta: "Reference",
  },
  {
    to: "/resources/verifying-comps",
    icon: Ruler,
    title: "How to verify a comp",
    desc: "ARV is the number everything else leans on. This is how to make sure the comps behind it are evidence.",
    meta: "Guide",
    draft: true,
  },
  {
    to: "/resources/offer-checklist",
    icon: ClipboardCheck,
    title: "Before you make an offer",
    desc: "The number, the property, the paperwork, the money, the exit — what should already be settled.",
    meta: "Checklist",
    draft: true,
  },
];

function EntryCard({ entry }: { entry: Entry }) {
  const Icon = entry.icon;
  return (
    <Link
      to={entry.to}
      className="group surface-card hover:surface-card-hover rounded-2xl p-6 flex flex-col transition-base"
    >
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(239_84%_60%)]/15 text-[hsl(229_94%_82%)]">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        {entry.draft && (
          <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] text-warning">
            <PencilRuler className="h-3 w-3" /> Draft
          </span>
        )}
      </div>
      <h3 className="font-display text-[18px] text-foreground tracking-tight leading-snug">
        {entry.title}
      </h3>
      <p className="mt-2 text-[13.5px] text-muted-foreground leading-[1.65] flex-1">{entry.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        {entry.meta && (
          <span className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 font-semibold">
            {entry.meta}
          </span>
        )}
        <ArrowRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
      </div>
    </Link>
  );
}

function SectionHeader({ kicker, title, blurb }: { kicker: string; title: string; blurb: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50 font-semibold mb-2">
        {kicker}
      </p>
      <h2 className="font-display text-[26px] sm:text-[30px] text-foreground tracking-[-0.02em] leading-tight">
        {title}
      </h2>
      <p className="mt-2.5 text-[14.5px] text-muted-foreground leading-relaxed">{blurb}</p>
    </div>
  );
}

/**
 * Resources index.
 *
 * Organised as a path rather than a bucket: orient yourself, learn the vocabulary,
 * then take the downloads. The database-backed resource grid sits last because
 * it's currently the thinnest part — a beginner shouldn't land on an empty grid.
 */
export default function ResourcesPage() {
  const [active, setActive] = useState<FilterKey>("all");
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Resources — Start here if you're new | RealToolbox.ai";
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
      "Setup guide, glossary of deal terms, how to verify comps, and a pre-offer checklist — the reference material a new real estate investor needs to use the skills well.",
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["resources", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select(
          "id, title, slug, type, description, access_level, file_url, cover_image_url, created_at",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ResourceRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (active === "all") return data;
    return data.filter((r) => r.type === active);
  }, [data, active]);

  const hasAny = (data?.length ?? 0) > 0;

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Resources
          </div>
          <h1 className="mt-5 font-display text-4xl lg:text-[56px] font-bold leading-[1.03] tracking-[-0.03em] text-foreground">
            Start here if this is{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              your first deal.
            </span>
          </h1>
          <p className="mt-5 text-[16.5px] lg:text-lg text-muted-foreground leading-[1.65]">
            The skills assume you know a handful of things. This is where those things are written
            down — how to run a skill, what the terms mean, how to check the numbers you feed it,
            and what should be true before you make an offer.
          </p>
        </div>
      </section>

      {/* Start here */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionHeader
          kicker="Step one"
          title="Get oriented."
          blurb="Twenty minutes here saves you from every avoidable mistake in the first two."
        />
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {START_HERE.map((e) => (
            <EntryCard key={e.to} entry={e} />
          ))}

          {/* The free skill, as a card in the same rhythm */}
          <Link
            to={freeDealScreenPath(!!user)}
            className="group relative rounded-2xl flex"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)] opacity-90" />
            <div className="relative m-[1px] rounded-[15px] bg-[hsl(230_18%_8%)] p-6 flex flex-col flex-1">
              <span className="inline-flex w-fit items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(229_94%_82%)] mb-3.5">
                Free forever
              </span>
              <h3 className="font-display text-[18px] text-foreground tracking-tight leading-snug">
                The free Deal Screen
              </h3>
              <p className="mt-2 text-[13.5px] text-muted-foreground leading-[1.65] flex-1">
                The fastest way to understand any of this: run a property you&apos;re actually
                looking at through it.
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 font-semibold">
                  No card
                </span>
                <ArrowRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Reference */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-14">
        <SectionHeader
          kicker="Step two"
          title="The reference shelf."
          blurb="The vocabulary and the checks. Come back to these while you're working a deal, not before."
        />
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {REFERENCE.map((e) => (
            <EntryCard key={e.to} entry={e} />
          ))}
        </div>
        <p className="mt-5 text-[13px] text-muted-foreground/70 leading-[1.65] max-w-2xl">
          Pages marked <span className="text-warning font-semibold">Draft</span> are structure only —
          the reasoning is there, the market-specific standards are still being written. They&apos;re
          published so you can see what&apos;s coming, not so you can rely on them yet.
        </p>
      </section>

      {/* Downloads (database-backed) */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        <SectionHeader
          kicker="Step three"
          title="Downloads and templates."
          blurb="Spreadsheets, prompt libraries, and worksheets. New ones land here as they ship."
        />

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => {
            const isActive = active === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={
                  isActive
                    ? "rounded-full bg-foreground text-background px-4 py-1.5 text-[13px] font-semibold transition-base"
                    : "rounded-full bg-foreground/[0.04] border border-foreground/10 text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground px-4 py-1.5 text-[13px] font-medium transition-base"
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl surface-card overflow-hidden animate-pulse">
                <div className="aspect-[16/9] w-full bg-foreground/[0.04]" />
                <div className="p-[22px] space-y-3">
                  <div className="h-4 w-20 rounded bg-foreground/[0.06]" />
                  <div className="h-5 w-3/4 rounded bg-foreground/[0.06]" />
                  <div className="h-3 w-full rounded bg-foreground/[0.04]" />
                  <div className="h-3 w-5/6 rounded bg-foreground/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasAny ? (
          <EmptyAll />
        ) : filtered.length === 0 ? (
          <EmptyFiltered onClear={() => setActive("all")} />
        ) : (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function EmptyAll() {
  return (
    <div className="rounded-2xl surface-card p-10 lg:p-12">
      <h3 className="font-display text-xl lg:text-2xl font-semibold tracking-[-0.02em] text-foreground">
        Nothing to download yet.
      </h3>
      <p className="mt-3 text-[14.5px] text-muted-foreground max-w-xl leading-[1.65]">
        The written guides above are the substance for now. Downloadable templates are queued behind
        them — the newsletter at the bottom of any page is where they get announced.
      </p>
      <Link
        to="/resources/glossary"
        className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.08] transition-base"
      >
        Read the glossary instead <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyFiltered({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl surface-card p-10 text-center">
      <h3 className="font-display text-xl font-semibold text-foreground">Nothing here yet</h3>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Nothing in this category yet — check back soon.
      </p>
      <button
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-foreground/[0.04] transition-base"
      >
        Clear filter
      </button>
    </div>
  );
}
