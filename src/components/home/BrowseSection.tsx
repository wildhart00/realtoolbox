import { useMemo, useState } from "react";
import type { Tool, Category } from "@/lib/types";
import { CategoryRail } from "./CategoryRail";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { useSearch } from "@/hooks/useSearch";

type SortKey = "relevant" | "newest" | "az";

export function BrowseSection({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  const { query } = useSearch();
  const [activeSlug, setActiveSlug] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevant");

  const filtered = useMemo(() => {
    let list = tools;
    if (activeSlug !== "all") {
      list = list.filter((t) => t.categories?.some((c) => c.slug === activeSlug));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          t.categories?.some((c) => c.name.toLowerCase().includes(q)),
      );
    }
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "newest")
      list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    return list;
  }, [tools, activeSlug, query, sort]);

  return (
    <section id="browse" className="px-6 lg:px-10 py-10 lg:py-12 mx-auto" style={{ maxWidth: 1100 }}>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-9">
        <CategoryRail categories={categories} active={activeSlug} onChange={setActiveSlug} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-[18px]">
            <span className="text-[12px] text-foreground/70">
              {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-foreground/[0.05] border border-foreground/[0.09] rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground outline-none cursor-pointer"
            >
              <option value="relevant">Most relevant</option>
              <option value="newest">Newest</option>
              <option value="az">A–Z</option>
            </select>
          </div>
          <ToolGrid tools={filtered} />
        </div>
      </div>
    </section>
  );
}
