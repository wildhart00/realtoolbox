import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrowseSection } from "@/components/home/BrowseSection";
import { useTools, useCategories } from "@/hooks/useDirectory";
import { useSearch } from "@/hooks/useSearch";

const BrowsePage = () => {
  const [params] = useSearchParams();
  const { data: tools = [], isLoading } = useTools();
  const { data: categories = [] } = useCategories();
  const { setQuery } = useSearch();

  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? undefined;

  useEffect(() => {
    setQuery(q);
  }, [q, setQuery]);

  return (
    <AppLayout>
      <section className="px-6 lg:px-10 pt-10 pb-2 mx-auto" style={{ maxWidth: 1100 }}>
        <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/50 font-semibold">
          Browse
        </p>
        <h1 className="mt-1.5 font-display text-[40px] text-foreground tracking-[-0.025em] leading-tight">
          All tools
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {isLoading ? "Loading…" : `${tools.length} curated tools`}
        </p>
      </section>
      <BrowseSection tools={tools} categories={categories} initialCategory={cat} />
    </AppLayout>
  );
};

export default BrowsePage;
