import { Search } from "lucide-react";
import { ToolCard } from "./ToolCard";
import type { Tool } from "@/lib/types";

export function ToolGrid({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-20 text-foreground/30">
        <Search className="h-9 w-9 mx-auto mb-3.5" strokeWidth={1.5} />
        <p className="text-sm">No tools match — try adjusting your filters</p>
      </div>
    );
  }
  return (
    <div
      className="grid gap-[14px]"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))" }}
    >
      {tools.map((t) => (
        <ToolCard key={t.id} tool={t} />
      ))}
    </div>
  );
}
