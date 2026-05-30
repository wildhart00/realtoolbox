import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { useTools } from "@/hooks/useDirectory";
import { useSearch } from "@/hooks/useSearch";

const SPECIALTIES: Record<
  string,
  { tag: string; title: string; blurb: string }
> = {
  "listing-agents": {
    tag: "Listing Agent",
    title: "Listing Agents",
    blurb:
      "Listing copy, marketing automation, CMA tools, and client comms built for residential agents.",
  },
  "investors": {
    tag: "Investor",
    title: "Real Estate Investors",
    blurb:
      "Deal analysis, market research, BRRRR underwriting, and portfolio tracking for buy-and-hold and flip investors.",
  },
  "property-managers": {
    tag: "Property Manager",
    title: "Property Managers",
    blurb:
      "Tenant screening, maintenance coordination, lease management, and owner reporting tools.",
  },
  "content-creators": {
    tag: "Content Creator",
    title: "Content Creators",
    blurb:
      "Video creation, AI writers, image generators, and audience-building tools for agents and investors building their brand online.",
  },
};

const SpecialtyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tools = [], isLoading } = useTools();
  const { query } = useSearch();

  const spec = slug ? SPECIALTIES[slug] : undefined;

  const filtered = useMemo(() => {
    if (!spec) return [];
    const tagLc = spec.tag.toLowerCase();
    let list = tools.filter((t) =>
      t.tags?.some((x) => x.toLowerCase() === tagLc),
    );
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [tools, spec, query]);

  if (!spec) return <Navigate to="/404" replace />;

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-10 pb-6 mx-auto" style={{ maxWidth: 1100 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-base"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tools
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-foreground/50 font-semibold">
          Built for your specialty
        </p>
        <h1 className="mt-1.5 font-display text-[40px] text-foreground tracking-[-0.025em] leading-tight">
          {spec.title}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground max-w-2xl">
          {spec.blurb}
        </p>
        <p className="mt-3 text-[13px] text-foreground/50">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        </p>
      </section>
      <section className="px-6 lg:px-10 pb-20 mx-auto" style={{ maxWidth: 1100 }}>
        {isLoading ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center">
            <p className="text-[14px] text-muted-foreground">
              Curating now — check back soon.
            </p>
          </div>
        ) : (
          <ToolGrid tools={filtered} />
        )}
      </section>
    </AppLayout>
  );
};

export default SpecialtyPage;
