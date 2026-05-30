import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const TITLES: Record<string, { title: string; blurb: string }> = {
  "/mcps": {
    title: "MCPs",
    blurb: "A curated index of Model Context Protocol servers for real estate workflows. Coming soon.",
  },
  "/skills": {
    title: "Skills",
    blurb: "Reusable AI skills you can drop into Claude, ChatGPT, and your stack. Coming soon.",
  },
  "/agents": {
    title: "Agents",
    blurb: "Production-ready agents built for brokers, investors, and operators. Coming soon.",
  },
  "/resources": {
    title: "Resources",
    blurb: "Guides, prompt libraries, templates, and downloads. Coming soon.",
  },
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: "Coming soon", blurb: "This section is under construction." };

  return (
    <AppLayout>
      <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(229_94%_82%)]" />
            Coming soon
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-foreground">
            {meta.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{meta.blurb}</p>
        </div>
      </section>
    </AppLayout>
  );
}
