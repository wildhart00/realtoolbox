import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NewsletterCard } from "@/components/home/NewsletterCard";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { StackToolCard } from "@/components/stacks/StackToolCard";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tool } from "@/lib/types";

export type StackKind = "investor" | "agent";

interface Stack {
  id: string;
  kind: StackKind;
  title: string;
  subtitle: string | null;
  intro_md: string | null;
}

interface StackEntry {
  id: string;
  kind: StackKind;
  tool_id: string;
  group_name: string;
  sort_order: number;
  why_note: string | null;
  tool: Pick<Tool, "id" | "slug" | "name" | "tagline" | "website_url" | "logo_url" | "pricing">;
}

const INVESTOR_GROUPS = [
  "Deal Finding",
  "Deal Analysis & Data",
  "Skip Tracing & Outreach",
  "CRM & Follow-Up",
  "Project & Rehab Management",
  "Back Office",
];

const AGENT_GROUPS = [
  "CRM & Lead Gen",
  "Listing Marketing",
  "Transaction Management",
  "Content & AI",
  "Client Communication",
];

export const STACK_GROUPS: Record<StackKind, string[]> = {
  investor: INVESTOR_GROUPS,
  agent: AGENT_GROUPS,
};

const META: Record<
  StackKind,
  { title: string; description: string; eyebrow: string; refTag: string }
> = {
  investor: {
    title: "The Best Real Estate Investor Tool Stack (2026) — RealToolbox",
    description:
      "The toolset RealToolbox recommends for a real estate investor today — deal finding, analysis, skip tracing, CRM, rehab, and back office. Curated, not a directory dump.",
    eyebrow: "The Investor Stack",
    refTag: "stack-investor",
  },
  agent: {
    title: "The Best Real Estate Agent Tool Stack (2026) — RealToolbox",
    description:
      "The tools RealToolbox recommends for a new real estate agent on day one — CRM, listing marketing, transactions, AI content, and client communication.",
    eyebrow: "The Agent Stack",
    refTag: "stack-agent",
  },
};

function useDocumentMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", `https://realtoolbox.ai${path}`);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://realtoolbox.ai${path}`);
  }, [title, description, path]);
}

function StructuredData({
  kind,
  entries,
}: {
  kind: StackKind;
  entries: StackEntry[];
}) {
  useEffect(() => {
    if (!entries.length) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-stack-jsonld", kind);
    const list = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: META[kind].title,
      itemListElement: entries.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.tool.name,
        url: e.tool.website_url,
      })),
    };
    script.textContent = JSON.stringify(list);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [kind, entries]);
  return null;
}

export default function StackPage({ kind }: { kind: StackKind }) {
  const meta = META[kind];
  const groups = STACK_GROUPS[kind];
  const path = `/stacks/${kind}`;
  useDocumentMeta(meta.title, meta.description, path);

  const [stack, setStack] = useState<Stack | null>(null);
  const [entries, setEntries] = useState<StackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: stackRow }, { data: entryRows }] = await Promise.all([
        supabase.from("stacks" as any).select("*").eq("kind", kind).maybeSingle(),
        supabase
          .from("stack_entries" as any)
          .select(
            "id, kind, tool_id, group_name, sort_order, why_note, tool:tools(id, slug, name, tagline, website_url, logo_url, pricing)",
          )
          .eq("kind", kind)
          .order("sort_order", { ascending: true }),
      ]);
      if (cancelled) return;
      setStack(stackRow as any);
      setEntries(((entryRows ?? []) as any[]).filter((e) => e.tool) as StackEntry[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const grouped = useMemo(() => {
    const map = new Map<string, StackEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.group_name) ?? [];
      arr.push(e);
      map.set(e.group_name, arr);
    }
    return groups
      .map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((x) => x.items.length > 0);
  }, [entries, groups]);

  return (
    <AppLayout>
      <StructuredData kind={kind} entries={entries} />

      {/* Header */}
      <section className="px-6 lg:px-10 pt-10 pb-6">
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(229_94%_82%)] mb-4">
            <Layers className="h-3.5 w-3.5" />
            {meta.eyebrow}
          </div>
          <h1 className="font-display text-[42px] leading-[1.1] font-bold text-foreground tracking-[-0.03em] mb-4">
            {stack?.title ?? meta.eyebrow}
          </h1>
          {stack?.subtitle && (
            <p className="text-[17px] text-muted-foreground leading-[1.6] mb-5">
              {stack.subtitle}
            </p>
          )}
          <AffiliateDisclosure variant="inline" />
          {stack?.intro_md && (
            <div className="mt-6 space-y-3 text-[15px] text-foreground/80 leading-[1.75]">
              {stack.intro_md
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Groups */}
      {loading ? (
        <div className="px-6 lg:px-10 pb-12">
          <div className="mx-auto h-40 animate-pulse rounded-2xl bg-foreground/[0.04]" style={{ maxWidth: 1100 }} />
        </div>
      ) : grouped.length === 0 ? (
        <section className="px-6 lg:px-10 py-8">
          <div
            className="mx-auto surface-card rounded-2xl p-8 text-center"
            style={{ maxWidth: 720 }}
          >
            <Sparkles className="h-6 w-6 text-[hsl(229_94%_82%)] mx-auto mb-3" />
            <h2 className="font-display text-[20px] font-semibold text-foreground mb-2">
              This stack is being curated
            </h2>
            <p className="text-[14px] text-muted-foreground leading-[1.65]">
              The picks aren't published yet. Drop your email below and I'll ping you the moment
              this stack goes live.
            </p>
          </div>
        </section>
      ) : (
        <section className="px-6 lg:px-10 py-4">
          <div className="mx-auto space-y-14" style={{ maxWidth: 1100 }}>
            {grouped.map(({ group, items }, groupIdx) => (
              <div key={group}>
                <div className="flex items-baseline gap-3 mb-5">
                  <div className="text-[11px] font-semibold text-foreground/30 tabular-nums">
                    {String(groupIdx + 1).padStart(2, "0")}
                  </div>
                  <h2 className="font-display text-[24px] font-bold text-foreground tracking-[-0.02em]">
                    {group}
                  </h2>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((e) => (
                    <StackToolCard
                      key={e.id}
                      tool={e.tool}
                      whyNote={e.why_note}
                      refTag={meta.refTag}
                    />
                  ))}
                </div>

                {/* Mid-page cross-promo after ~half the groups */}
                {groupIdx === Math.floor(grouped.length / 2) - (grouped.length > 2 ? 0 : 0) &&
                  groupIdx < grouped.length - 1 && <CrossPromo kind={kind} onWaitlist={() => setWaitlistOpen(true)} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cross-promo fallback if only one group / empty */}
      {(grouped.length <= 1 || grouped.length === 0) && (
        <div className="px-6 lg:px-10 py-4">
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <CrossPromo kind={kind} onWaitlist={() => setWaitlistOpen(true)} />
          </div>
        </div>
      )}

      {/* Bottom disclosure */}
      <div className="px-6 lg:px-10 pt-10">
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <AffiliateDisclosure variant="block" />
        </div>
      </div>

      <NewsletterCard source={`stack_${kind}`} />

      <CaptureDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        mode="early-access"
        source="scaling_toolbox_waitlist"
      />
    </AppLayout>
  );
}

function CrossPromo({
  kind,
  onWaitlist,
}: {
  kind: StackKind;
  onWaitlist: () => void;
}) {
  if (kind === "investor") {
    return (
      <div className="my-10 rounded-2xl border border-[hsl(229_94%_82%)]/25 bg-gradient-to-br from-[hsl(252_84%_18%)]/40 via-transparent to-[hsl(265_84%_20%)]/30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[hsl(229_94%_82%)] mb-2">
            Go beyond the tools
          </div>
          <h3 className="font-display text-[22px] font-bold text-foreground tracking-[-0.02em] mb-1.5">
            The Investor Toolbox — AI skills that run these tools for you
          </h3>
          <p className="text-[14px] text-muted-foreground leading-[1.6]">
            AI skills that turn any assistant into your acquisitions analyst, deal screener, and
            negotiator. Pairs with the stack above.
          </p>
        </div>
        <Link
          to="/toolbox/investor"
          className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-[10px] px-5 py-2.5 text-[13px] font-semibold shadow-glow-indigo hover:opacity-95 transition-base shrink-0"
        >
          See the Investor Toolbox
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }
  return (
    <div className="my-10 rounded-2xl border border-[hsl(229_94%_82%)]/25 bg-gradient-to-br from-[hsl(252_84%_18%)]/40 via-transparent to-[hsl(265_84%_20%)]/30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[hsl(229_94%_82%)] mb-2">
          Coming soon
        </div>
        <h3 className="font-display text-[22px] font-bold text-foreground tracking-[-0.02em] mb-1.5">
          The Scaling Toolbox — AI skills for the business layer
        </h3>
        <p className="text-[14px] text-muted-foreground leading-[1.6]">
          Lead economics, cost per contract, channel performance, and finding the constraint
          that's capping the operation. Join the waitlist to hear when it lands.
        </p>
      </div>
      <button
        type="button"
        onClick={onWaitlist}
        className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-[10px] px-5 py-2.5 text-[13px] font-semibold shadow-glow-indigo hover:opacity-95 transition-base shrink-0"
      >
        Join the waitlist
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
