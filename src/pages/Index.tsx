import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { DealScreenStrip } from "@/components/home/DealScreenStrip";
import { OfferBand } from "@/components/home/OfferBand";
import { DirectorySection } from "@/components/home/DirectorySection";
import { useTools, useFeaturedTools } from "@/hooks/useDirectory";
import { WhatChangedSection } from "@/components/updates/WhatChangedSection";

/**
 * Homepage — a concise editorial briefing:
 *   1. Short hero                      Hero
 *   2. Latest + Workflows (task finder) WhatChangedSection
 *   3. Free skill                       DealScreenStrip
 *   4. Toolbox purchases routing        OfferBand -> /toolbox, /toolbox/investor
 *   5. Tool directory doorway           DirectorySection -> /browse
 * Detailed trust, arc and agent material lives on /how-it-works, /toolbox/investor and /for-agents.
 */
const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();

  return (
    <AppLayout>
      <Hero />
      <WhatChangedSection />
      <DealScreenStrip />
      <OfferBand />
      <DirectorySection featured={featured} toolCount={tools.length} />
    </AppLayout>
  );
};

export default Index;
