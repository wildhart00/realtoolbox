import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrowseSection } from "@/components/home/BrowseSection";
import { useCategories, useTools } from "@/hooks/useDirectory";

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
  const { data: tools = [] } = useTools();
  const { data: categories = [] } = useCategories();

  const spec = slug ? SPECIALTIES[slug] : undefined;

  const filtered = useMemo(() => {
    if (!spec) return [];
    const tagLc = spec.tag.toLowerCase();
    return tools.filter((t) => t.tags?.some((x) => x.toLowerCase() === tagLc));
  }, [tools, spec]);

  if (!spec) return <Navigate to="/404" replace />;

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-10 pb-2 mx-auto" style={{ maxWidth: 1100 }}>
        <Link
          to="/browse"
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
        <p className="mt-2 text-[14px] text-muted-foreground max-w-2xl">{spec.blurb}</p>
        <p className="mt-3 text-[13px] text-foreground/50">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        </p>
      </section>
      <BrowseSection tools={filtered} categories={categories} lockCategory />
    </AppLayout>
  );
};

export default SpecialtyPage;
