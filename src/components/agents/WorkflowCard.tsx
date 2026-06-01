import { useState } from "react";
import { Bell } from "lucide-react";
import { WorkflowNotifyDialog } from "./WorkflowNotifyDialog";

export interface WorkflowItem {
  name: string;
  stack: string[];
  description: string;
  guideHref?: string;
}

export function WorkflowCard({ item }: { item: WorkflowItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full rounded-2xl p-7 surface-card hover:surface-card-hover transition-base">
      <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
        {item.name}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.stack.map((s) => (
          <span
            key={s}
            className="text-[10.5px] font-medium px-2 py-[3px] rounded-md bg-foreground/[0.05] text-foreground/60 border border-foreground/10"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-4 text-[14px] text-muted-foreground leading-[1.65] flex-1">
        {item.description}
      </p>

      <div className="mt-auto pt-5 flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-foreground/15 px-4 py-2 text-[12.5px] font-semibold text-foreground hover:bg-foreground/[0.04] transition-base"
        >
          <Bell className="h-3.5 w-3.5" /> Notify me
        </button>
        <span className="text-[11px] text-muted-foreground">Guide coming soon</span>
      </div>

      <WorkflowNotifyDialog
        open={open}
        onOpenChange={setOpen}
        workflowName={item.name}
      />
    </div>
  );
}
