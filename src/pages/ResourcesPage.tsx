import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { ResourceCard, type ResourceRow } from "@/components/resources/ResourceCard";

type FilterKey = "all" | "guide" | "prompt-library" | "template" | "download" | "video";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "guide", label: "Guides" },
  { key: "prompt-library", label: "Prompt Libraries" },
  { key: "template", label: "Templates" },
  { key: "download", label: "Downloads" },
  { key: "video", label: "Videos" },
];

export default function ResourcesPage() {
  const [active, setActive] = useState<FilterKey>("all");

  useEffect(() => {
    document.title = "Resources for Real Estate Pros — RealToolbox.ai";
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
      "Prompt libraries, workflow guides, downloadable templates and curated content — built for real estate professionals working smarter with AI.",
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
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Resources
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
            Tools for the serious{" "}
            <span className="bg-gradient-to-r from-[hsl(229_94%_82%)] to-[hsl(265_84%_75%)] bg-clip-text text-transparent">
              real estate operator
            </span>
          </h1>
          <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65] max-w-3xl">
            Prompt libraries, workflow guides, downloadable templates and curated content — all
            built for real estate professionals who want to work smarter with AI.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-8">
        <div className="flex flex-wrap gap-2">
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
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-20">
        {isLoading ? (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl surface-card overflow-hidden animate-pulse"
              >
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

      {/* Bottom callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Get resource drop alerts
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground max-w-xl mx-auto">
            Be the first to know when a new guide, template or prompt pack ships. One email,
            zero fluff.
          </p>
          <Link
            to="/#newsletter"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
          >
            Subscribe <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

function EmptyAll() {
  return (
    <div className="rounded-2xl surface-card p-10 lg:p-14 text-center">
      <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
        Resources coming soon
      </h3>
      <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto leading-[1.6]">
        New guides, templates and prompt packs added weekly. Subscribe to the newsletter to get
        notified when each one drops.
      </p>
      <Link
        to="/#newsletter"
        className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
      >
        Subscribe to newsletter <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyFiltered({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl surface-card p-10 text-center">
      <h3 className="font-display text-xl font-semibold text-foreground">
        Nothing here yet
      </h3>
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
