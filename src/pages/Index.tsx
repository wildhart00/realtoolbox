import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { FeaturedTabsSection } from "@/components/home/FeaturedTabsSection";
import { BrowseSection } from "@/components/home/BrowseSection";
import { NewsletterCard } from "@/components/home/NewsletterCard";
import { BrowseByTagSection } from "@/components/home/BrowseByTagSection";
import { SkillsAnnouncementStrip } from "@/components/home/SkillsAnnouncementStrip";
import {
  useTools,
  useFeaturedTools,
  useJustLaunchedTools,
  useCategories,
} from "@/hooks/useDirectory";

const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();
  const { data: justLaunched = [] } = useJustLaunchedTools();
  const { data: categories = [] } = useCategories();

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <FeaturedTabsSection featured={featured} justLaunched={justLaunched} />
      <div className="mx-auto h-px bg-foreground/[0.06]" style={{ maxWidth: 1100 }} />
      <BrowseSection tools={tools} categories={categories} />
      <BrowseByTagSection />
      <SkillsAnnouncementStrip />
      <div className="mx-auto h-px bg-foreground/[0.06]" style={{ maxWidth: 1100 }} />
      <NewsletterCard />
    </AppLayout>
  );
};

export default Index;
