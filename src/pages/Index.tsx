import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { PricingSection } from "@/components/home/PricingSection";
import { InvestorArcSection } from "@/components/home/InvestorArcSection";
import { FeaturedTabsSection } from "@/components/home/FeaturedTabsSection";
import { BrowseSection } from "@/components/home/BrowseSection";
import { DealScreenStrip } from "@/components/home/DealScreenStrip";
import { Link } from "react-router-dom";
import { useTools, useCategories, useFeaturedTools, useJustLaunchedTools } from "@/hooks/useDirectory";

const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: categories = [] } = useCategories();
  const { data: featured = [] } = useFeaturedTools();
  const { data: justLaunched = [] } = useJustLaunchedTools();

  const homeTools = tools.slice(0, 12);

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <PricingSection />
      <InvestorArcSection />
      <FeaturedTabsSection featured={featured} justLaunched={justLaunched} />
      <BrowseSection tools={homeTools} categories={categories} />
      <div className="px-6 lg:px-10 -mt-6 mb-4 mx-auto flex justify-end" style={{ maxWidth: 1100 }}>
        <Link to="/browse" className="text-[13px] font-semibold text-[hsl(229_94%_82%)] hover:text-[hsl(229_94%_90%)] transition-base">
          Browse all {tools.length} tools →
        </Link>
      </div>
      <DealScreenStrip />
    </AppLayout>
  );
};

export default Index;
