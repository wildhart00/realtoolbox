import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { BrowseByTagSection } from "@/components/home/BrowseByTagSection";
import { BuiltForSpecialtySection } from "@/components/home/BuiltForSpecialtySection";
import { SkillsHomeSection } from "@/components/home/SkillsHomeSection";
import { ChooseYourStageSection } from "@/components/home/ChooseYourStageSection";
import { useTools, useFeaturedTools } from "@/hooks/useDirectory";

const Index = () => {
  const { data: tools = [] } = useTools();
  const { data: featured = [] } = useFeaturedTools();

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <ChooseYourStageSection />
      <SkillsHomeSection />
      <BuiltForSpecialtySection />
      <BrowseByTagSection />
      <FeaturedSection featured={featured} />
    </AppLayout>
  );
};

export default Index;
