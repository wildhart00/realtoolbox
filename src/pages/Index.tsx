import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { FeaturedTabsSection } from "@/components/home/FeaturedTabsSection";
import { NewsletterCard } from "@/components/home/NewsletterCard";
import { BrowseByTagSection } from "@/components/home/BrowseByTagSection";
import { BuiltForSpecialtySection } from "@/components/home/BuiltForSpecialtySection";
import { SkillsAnnouncementStrip } from "@/components/home/SkillsAnnouncementStrip";
import {
  useTools,
  useFeaturedTools,
  useJustLaunchedTools,
} from "@/hooks/useDirectory";

const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();
  const { data: justLaunched = [] } = useJustLaunchedTools();

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <FeaturedTabsSection featured={featured} justLaunched={justLaunched} />
      <BrowseByTagSection />
      <BuiltForSpecialtySection />
      <SkillsAnnouncementStrip />
      <NewsletterCard />
    </AppLayout>
  );
};

export default Index;
