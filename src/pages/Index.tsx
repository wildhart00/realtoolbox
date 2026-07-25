import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { WhatThisIsSection } from "@/components/home/WhatThisIsSection";
import { InvestorArcSection } from "@/components/home/InvestorArcSection";
import { OfferBand } from "@/components/home/OfferBand";
import { FeaturedTabsSection } from "@/components/home/FeaturedTabsSection";
import { BrowseSection } from "@/components/home/BrowseSection";
import { DealScreenStrip } from "@/components/home/DealScreenStrip";
import { StacksHomeStrip } from "@/components/stacks/StacksHomeStrip";
import { NewsletterCard } from "@/components/home/NewsletterCard";
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
      <WhatThisIsSection />
      <DealScreenStrip />
      <InvestorArcSection />
      <OfferBand />
      <FeaturedTabsSection featured={featured} justLaunched={justLaunched} />
      <StacksHomeStrip />
      <BrowseSection tools={homeTools} categories={categories} />
      <div className="px-6 lg:px-10 -mt-6 mb-4 mx-auto flex justify-end" style={{ maxWidth: 1100 }}>
        <Link to="/browse" className="text-[13px] font-semibold text-[hsl(229_94%_82%)] hover:text-[hsl(229_94%_90%)] transition-base">
          Browse all {tools.length} tools →
        </Link>
      </div>
      <NewsletterCard />
    </AppLayout>
  );
};

export default Index;
