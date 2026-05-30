import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationCard, type Integration, categoryLabel } from "@/components/integrations/IntegrationCard";

const CATEGORIES = [
  "property-data",
  "crm",
  "communication",
  "productivity",
  "content-creation",
  "automation",
  "developer",
];

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Integrations — RealToolbox.ai";
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
      "Connect your AI assistant to the tools you use every day — CRM, email, calendar, property data, and more. A curated directory of integrations for real estate.",
    );
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("integrations" as any)
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      setItems((data as unknown as Integration[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-16 lg:pt-24 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Integrations Directory
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
            Integrations
          </h1>
          <p className="mt-6 text-[17px] lg:text-lg text-muted-foreground leading-[1.65]">
            Connect your AI assistant directly to the tools you already use — your CRM, email,
            calendar, property data, and more. Whether you're on Claude, ChatGPT, or another
            assistant, these integrations let your AI actually do things, not just talk about them.
            Most are powered by MCP (Model Context Protocol), an open standard for connecting AI to
            software.
          </p>
          <p className="mt-4 text-[13px] text-foreground/40 leading-[1.6]">
            New to this? Integrations are an emerging technology. Some take a few minutes to set
            up. We curate the ones worth knowing about for real estate work.
          </p>
        </div>
      </section>

      {/* Filter pills */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
              {categoryLabel(c)}
            </FilterPill>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-16">
        {loading ? (
          <div className="text-center py-20 text-sm text-foreground/40">Loading integrations…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-foreground/40">
            No integrations in this category yet.
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <IntegrationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Submit callout */}
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01] px-8 py-10 lg:px-12 lg:py-12 text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent" />
          <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.02em] text-foreground">
            Know an integration we should add?
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Help us keep this list sharp. Submissions reviewed weekly.
          </p>
          <Link
            to="/submit"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-foreground px-5 py-2.5 text-[13.5px] font-semibold text-background hover:bg-foreground/90 transition-base"
          >
            Submit it <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-base ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-foreground/[0.03] text-muted-foreground border-foreground/10 hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {children}
    </button>
  );
}
