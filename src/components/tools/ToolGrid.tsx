import { ToolCard } from "./ToolCard";
import type { Tool } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useSavedToolIds } from "@/hooks/useDirectory";

export function ToolGrid({ tools }: { tools: Tool[] }) {
  const { user } = useAuth();
  const { data: savedIds } = useSavedToolIds(user?.id);

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
        <p className="text-sm text-muted-foreground">No tools match your filters yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((t) => (
        <ToolCard key={t.id} tool={t} isSaved={savedIds?.has(t.id) ?? false} />
      ))}
    </div>
  );
}
