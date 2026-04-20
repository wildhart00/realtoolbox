import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MouseEvent } from "react";

const pricingStyles: Record<string, string> = {
  free: "bg-success/10 text-success border-success/20",
  freemium: "bg-accent/10 text-accent border-accent/20",
  paid: "bg-muted text-muted-foreground border-border",
};

const pricingLabels: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function gradientForSlug(slug: string) {
  const palettes = [
    "from-accent to-accent-glow",
    "from-primary to-primary/70",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-blue-500 to-indigo-600",
    "from-fuchsia-500 to-violet-600",
    "from-cyan-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

export function ToolCard({ tool, isSaved = false }: { tool: Tool; isSaved?: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const toggleSave = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save tools", { description: "Create a free account to start your collection." });
      return;
    }
    if (isSaved) {
      const { error } = await supabase.from("saved_tools").delete().eq("user_id", user.id).eq("tool_id", tool.id);
      if (error) return toast.error(error.message);
      toast.success("Removed from saved");
    } else {
      const { error } = await supabase.from("saved_tools").insert({ user_id: user.id, tool_id: tool.id });
      if (error) return toast.error(error.message);
      toast.success("Saved to your collection");
    }
    qc.invalidateQueries({ queryKey: ["saved-tools", user.id] });
  };

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-sm transition-base hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevated"
    >
      <button
        onClick={toggleSave}
        aria-label={isSaved ? "Remove from saved" : "Save tool"}
        className={cn(
          "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80 backdrop-blur transition-base hover:border-accent/40",
          isSaved && "border-accent/40 text-accent"
        )}
      >
        <Heart className={cn("h-4 w-4", isSaved && "fill-accent")} />
      </button>

      <div className="flex items-start gap-3 pr-10">
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={`${tool.name} logo`} className="h-12 w-12 rounded-xl object-cover shadow-md" />
        ) : (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white shadow-md",
              gradientForSlug(tool.slug)
            )}
          >
            {getInitials(tool.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold leading-tight">{tool.name}</h3>
            {tool.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
            <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-base group-hover:text-accent group-hover:opacity-100" />
          </div>
          {tool.categories && tool.categories[0] && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{tool.categories[0].name}</p>
          )}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{tool.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
        <Badge
          variant="outline"
          className={cn("text-[10px] font-medium uppercase tracking-wide", pricingStyles[tool.pricing])}
        >
          {pricingLabels[tool.pricing]}
        </Badge>
        {tool.is_featured && (
          <Badge
            variant="outline"
            className="border-accent/30 bg-accent-soft text-[10px] font-medium uppercase tracking-wide text-accent"
          >
            Featured
          </Badge>
        )}
      </div>
    </Link>
  );
}
