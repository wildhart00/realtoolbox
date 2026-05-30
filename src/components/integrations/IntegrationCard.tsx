import { ArrowUpRight, Plug } from "lucide-react";

export type Difficulty = "easy" | "medium" | "advanced";

export interface Integration {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  logo_url: string | null;
  setup_url: string;
  difficulty: Difficulty;
}

const difficultyStyles: Record<Difficulty, string> = {
  easy: "bg-success/15 text-success border-success/25",
  medium: "bg-yellow-400/10 text-yellow-300 border-yellow-400/25",
  advanced: "bg-orange-400/10 text-orange-300 border-orange-400/25",
};

const difficultyLabel: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  advanced: "Advanced",
};

// Neutral-but-tinted fallback for missing logos by category
const categoryTints: Record<string, string> = {
  "property-data": "from-emerald-500/30 to-emerald-700/10",
  crm: "from-sky-500/30 to-sky-700/10",
  communication: "from-indigo-500/30 to-indigo-700/10",
  productivity: "from-violet-500/30 to-violet-700/10",
  "content-creation": "from-pink-500/30 to-pink-700/10",
  automation: "from-amber-500/30 to-amber-700/10",
  developer: "from-slate-400/30 to-slate-700/10",
};

export function categoryLabel(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function IntegrationCard({ item }: { item: Integration }) {
  const tint = categoryTints[item.category] ?? "from-foreground/10 to-foreground/5";
  return (
    <div className="group flex flex-col rounded-2xl p-[22px] surface-card hover:surface-card-hover hover:-translate-y-0.5 hover:border-[hsl(229_94%_82%)]/30 transition-base">
      <div className="flex items-start gap-[11px] mb-[14px]">
        {item.logo_url ? (
          <img
            src={item.logo_url}
            alt={`${item.name} logo`}
            className="h-10 w-10 shrink-0 rounded-xl object-cover bg-foreground/[0.04]"
          />
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} border border-foreground/10`}
          >
            <Plug className="h-4 w-4 text-foreground/60" strokeWidth={2.25} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-foreground leading-tight truncate">
            {item.name}
          </div>
          <div className="text-[11px] text-foreground/30 mt-0.5 truncate">
            {categoryLabel(item.category)}
          </div>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground leading-[1.6] mb-[16px] line-clamp-2 min-h-[42px]">
        {item.tagline}
      </p>

      <div className="flex flex-wrap items-center gap-[6px] mt-auto">
        <span className="text-[10px] px-[7px] py-[2px] rounded bg-foreground/[0.05] text-foreground/50 font-medium">
          {categoryLabel(item.category)}
        </span>
        <span
          className={`text-[10px] px-[7px] py-[2px] rounded font-medium border ${difficultyStyles[item.difficulty]}`}
        >
          {difficultyLabel[item.difficulty]}
        </span>
        <a
          href={item.setup_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[hsl(229_94%_82%)] hover:text-foreground transition-base"
        >
          Learn how to connect <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
