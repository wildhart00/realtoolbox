import { cn } from "@/lib/utils";
import type { EvidenceLevel } from "@/lib/updates/seed";
import { isStale } from "@/lib/updates/logic";

const EVIDENCE: Record<EvidenceLevel, { label: string; title: string }> = {
  vendor_announced: {
    label: "Vendor announced",
    title: "Based on the vendor's own announcement. Not tested by RealToolbox.",
  },
  editorially_checked: { label: "Editorially checked", title: "Checked against public sources by an editor." },
  hands_on_tested: { label: "Hands-on tested", title: "Used directly by RealToolbox." },
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const e = EVIDENCE[level];
  return (
    <span
      title={e.title}
      className="inline-flex items-center rounded-md border border-foreground/15 bg-foreground/[0.04] px-2.5 py-1 text-[13px] font-medium text-foreground/85"
    >
      {e.label}
    </span>
  );
}

export function StaleBadge({ checkedAt, now = new Date() }: { checkedAt: string; now?: Date }) {
  const stale = isStale(checkedAt, now);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-[13px] font-medium",
        stale
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-foreground/15 text-foreground/75",
      )}
    >
      {stale ? "Source check is over 90 days old" : "Source recently checked"}
    </span>
  );
}

export function DraftBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-[13px] font-medium text-accent">
      Draft · preview only
    </span>
  );
}
