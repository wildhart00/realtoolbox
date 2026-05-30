import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  TrendingUp,
  Building2,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SpecialtyCard = {
  slug: string;
  tag: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

const SPECIALTIES: SpecialtyCard[] = [
  {
    slug: "listing-agents",
    tag: "Listing Agent",
    title: "Listing Agents",
    blurb:
      "Listing copy, marketing automation, CMA tools, and client comms built for residential agents.",
    icon: Home,
  },
  {
    slug: "investors",
    tag: "Investor",
    title: "Real Estate Investors",
    blurb:
      "Deal analysis, market research, BRRRR underwriting, and portfolio tracking for buy-and-hold and flip investors.",
    icon: TrendingUp,
  },
  {
    slug: "property-managers",
    tag: "Property Manager",
    title: "Property Managers",
    blurb:
      "Tenant screening, maintenance coordination, lease management, and owner reporting tools.",
    icon: Building2,
  },
  {
    slug: "content-creators",
    tag: "Content Creator",
    title: "Content Creators",
    blurb:
      "Video creation, AI writers, image generators, and audience-building tools for agents and investors building their brand online.",
    icon: Clapperboard,
  },
];

function useSpecialtyCounts() {
  return useQuery({
    queryKey: ["specialty-counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("tools")
        .select("tags")
        .eq("status", "published");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of (data ?? []) as { tags: string[] | null }[]) {
        for (const tag of row.tags ?? []) {
          const key = tag.toLowerCase();
          counts[key] = (counts[key] ?? 0) + 1;
        }
      }
      return counts;
    },
  });
}

export function BuiltForSpecialtySection() {
  const { data: counts = {} } = useSpecialtyCounts();

  return (
    <section
      className="px-6 lg:px-10 py-10 lg:py-12 mx-auto"
      style={{ maxWidth: 1100 }}
    >
      <div className="mb-6 max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/50 font-semibold mb-1.5">
          Built for your specialty
        </p>
        <h2 className="font-display text-[28px] sm:text-[32px] text-foreground tracking-[-0.02em] leading-tight">
          Tools curated for how you work
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
          Whether you list, invest, manage, or create content — we've sorted the
          tools by what you actually do.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SPECIALTIES.map(({ slug, tag, title, blurb, icon: Icon }) => {
          const count = counts[tag.toLowerCase()] ?? 0;
          return (
            <Link
              key={slug}
              to={`/specialty/${slug}`}
              className="group relative surface-card hover:surface-card-hover rounded-2xl p-5 flex flex-col gap-4 min-h-[280px] hover:-translate-y-0.5 transition-base border border-transparent hover:border-[hsl(239_84%_67%)]/30"
            >
              <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[hsl(239_84%_60%)]/20 via-[hsl(252_84%_64%)]/12 to-[hsl(265_84%_60%)]/20 border border-[hsl(239_84%_67%)]/25">
                <Icon className="h-7 w-7 text-[hsl(229_94%_82%)]" strokeWidth={1.6} />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <h3 className="font-display text-[22px] text-foreground tracking-tight leading-tight">
                  {title}
                </h3>
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-foreground/40 font-semibold">
                  {count > 0
                    ? `${count} tool${count === 1 ? "" : "s"} curated for you`
                    : "Curating now"}
                </p>
                <p className="text-[12.5px] text-muted-foreground leading-[1.6] line-clamp-4">
                  {blurb}
                </p>
              </div>

              <div className="mt-auto text-[12px] text-foreground/70 group-hover:text-[hsl(229_94%_82%)] transition-base">
                <span className="inline-block group-hover:translate-x-0.5 transition-base">
                  Browse →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
