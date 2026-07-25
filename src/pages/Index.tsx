import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { GuardrailsSection } from "@/components/home/GuardrailsSection";
import { DealScreenStrip } from "@/components/home/DealScreenStrip";
import { InvestorArcSection } from "@/components/home/InvestorArcSection";
import { AgentRoutingBand } from "@/components/home/AgentRoutingBand";
import { HowYouRunItSection } from "@/components/home/HowYouRunItSection";
import { OfferBand } from "@/components/home/OfferBand";
import { DirectorySection } from "@/components/home/DirectorySection";
import { useTools, useFeaturedTools } from "@/hooks/useDirectory";

/**
 * Homepage — one narrative, in this order:
 *
 *   1. What this is            Hero
 *   2. Why it's trustworthy    GuardrailsSection
 *   3. Try it free             DealScreenStrip   ← primary conversion
 *   4. What's in the toolbox   InvestorArcSection
 *      ↳ secondary audience    AgentRoutingBand   → /for-agents
 *   5. How you run it          HowYouRunItSection → /how-it-works
 *   6. Price and routing       OfferBand         → /toolbox, /toolbox/investor
 *   7. The directory           DirectorySection  → /browse
 *
 * Newsletter capture is not repeated here — the footer carries it on every page.
 */
const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();

  return (
    <AppLayout>
      <Hero />
      <GuardrailsSection />
      <DealScreenStrip />
      <InvestorArcSection />
      <AgentRoutingBand />
      <HowYouRunItSection />
      <OfferBand />
      <DirectorySection featured={featured} toolCount={tools.length} />
    </AppLayout>
  );
};

export default Index;
