import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Home,
  Calculator,
  Database,
  PenLine,
  Video,
  Image as ImageIcon,
  Zap,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TagCard = { label: string; slug: string; icon: LucideIcon };

const TAGS: TagCard[] = [
  { label: "Lead Generation", slug: "lead-generation", icon: Users },
  { label: "Listing Marketing", slug: "listing-marketing", icon: Home },
  { label: "Deal Analysis", slug: "deal-analysis", icon: Calculator },
  { label: "CRM & Pipeline", slug: "crm-pipeline", icon: Database },
  { label: "AI Writers", slug: "ai-writers", icon: PenLine },
  { label: "Video Creation", slug: "video-creation", icon: Video },
  { label: "Image Generation", slug: "image-generators", icon: ImageIcon },
  { label: "Automation", slug: "automation", icon: Zap },
];

function useCategoryCounts() {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("tool_categories")
        .select("categories!inner(slug), tools!inner(status)")
        .eq("tools.status", "published");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of (data ?? []) as any[]) {
        const slug = row.categories?.slug;
        if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
      }
      return counts;
    },
  });
}

export function BrowseByTagSection() {
  const { data: counts = {} } = useCategoryCounts();

  const scrollToBrowse = (e: React.MouseEvent) => {
    const el = document.getElementById("browse");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="px-6 lg:px-10 py-10 lg:py-12 mx-auto"
      style={{ maxWidth: 1100 }}
    >
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/50 font-semibold mb-1.5">
            Browse by Tag
          </p>
          <h2 className="text-[22px] sm:text-[24px] font-semibold text-foreground tracking-tight">
            Find tools by what they do
          </h2>
        </div>
        <Link
          to="/#browse"
          onClick={scrollToBrowse}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-base shrink-0"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TAGS.map(({ label, slug, icon: Icon }) => {
          const count = counts[slug] ?? 0;
          return (
            <Link
              key={slug}
              to={`/category/${slug}`}
              className="group surface-card hover:surface-card-hover rounded-2xl px-4 py-[14px] flex items-center gap-3 transition-base"
            >
              <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-foreground/[0.05] text-foreground/70 group-hover:text-[hsl(229_94%_82%)] group-hover:bg-foreground/[0.08] transition-base shrink-0">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-foreground truncate">
                  {label}
                </div>
                <div className="text-[11px] text-foreground/40 mt-0.5">
                  {count > 0 ? `${count} tool${count === 1 ? "" : "s"}` : "Coming soon"}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-base shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
