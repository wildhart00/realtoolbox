import { AppLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/home/Hero";
import { SkillsHomeSection } from "@/components/home/SkillsHomeSection";
import { ChooseYourStageSection } from "@/components/home/ChooseYourStageSection";
import { useTools } from "@/hooks/useDirectory";

const Index = () => {
  const { data: tools = [] } = useTools();

  return (
    <AppLayout>
      <Hero toolCount={tools.length} />
      <ChooseYourStageSection />
      <SkillsHomeSection />
    </AppLayout>
  );
};

export default Index;
