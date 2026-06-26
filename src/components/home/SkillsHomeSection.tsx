import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  SkillPreviewCard,
  type SkillCardData,
} from "@/components/skills/SkillPreviewCard";

type SkillRow = SkillCardData & { id: string };

function useHomeSkills() {
  return useQuery({
    queryKey: ["home-skills"],
    queryFn: async (): Promise<SkillRow[]> => {
      const { data, error } = await supabase
        .from("skills" as any)
        .select("id, name, slug, tagline, description, audience, file_url, access_level, price")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(4);
      if (error) throw error;
      return (data as unknown as SkillRow[]) ?? [];
    },
  });
}

export function SkillsHomeSection() {
  const { data: skills = [] } = useHomeSkills();

  return (
    <section className="w-full px-6 lg:px-10 py-14">
      <div className="mx-auto max-w-[1200px]">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl px-8 py-10 lg:px-14 lg:py-12 shadow-glow bg-gradient-to-br from-[hsl(239_84%_60%)] via-[hsl(252_84%_64%)] to-[hsl(265_84%_60%)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[hsl(229_94%_82%)]/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-white">
                Now Live
              </span>
              <h2 className="mt-4 font-display text-3xl lg:text-[40px] font-bold tracking-[-0.02em] leading-[1.05] text-white">
                Real estate skills for any AI — now live
              </h2>
              <p className="mt-3 text-[15px] lg:text-base text-white/85 leading-[1.6]">
                Done-for-you instruction files that turn any AI assistant — ChatGPT, Claude, or Gemini — into an operator-grade deal partner: build your buy box, screen and triage leads, pick the right exit, and underwrite a safe offer. Built from real flipping and rental experience. Start free with the Deal Screen.
              </p>
            </div>

            <div className="shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-white text-[hsl(239_84%_55%)] hover:bg-white/90 shadow-elevated"
              >
                <Link to="/skills">
                  Browse the skills <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Skill cards */}
        {skills.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills.map((s) => (
                <SkillPreviewCard key={s.id} {...s} />
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                to="/skills"
                className="text-[12px] text-muted-foreground hover:text-foreground transition-base"
              >
                Browse all skills →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
