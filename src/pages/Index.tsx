import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { FeaturedStrip } from "@/components/home/FeaturedStrip";
import { BrowseSection } from "@/components/home/BrowseSection";
import { NewsletterCard } from "@/components/home/NewsletterCard";
import { useTools, useFeaturedTools, useCategories } from "@/hooks/useDirectory";
import { useSearch } from "@/hooks/useSearch";

const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();
  const { data: categories = [] } = useCategories();
  const { setQuery } = useSearch();

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <FeaturedStrip
        tools={featured}
        onViewAll={() => {
          setQuery("");
          document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <div className="mx-auto h-px bg-foreground/[0.06]" style={{ maxWidth: 1100 }} />
      <BrowseSection tools={tools} categories={categories} />
      <div className="mx-auto h-px bg-foreground/[0.06]" style={{ maxWidth: 1100 }} />
      <NewsletterCard />
    </AppLayout>
  );
};

export default Index;
