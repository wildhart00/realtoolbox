import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillDownloadDialog } from "./SkillDownloadDialog";
import { CaptureDialog } from "@/components/capture/CaptureDialog";

const AUDIENCE_LABEL: Record<string, string> = {
  agent: "For Agents",
  investor: "For Investors",
  both: "For Agents + Investors",
};

export interface SkillCardData {
  name: string;
  slug: string;
  tagline: string | null;
  audience: string;
  file_url: string | null;
  access_level: string;
  price: number;
}

export function SkillPreviewCard({
  name,
  slug,
  tagline,
  audience,
  file_url,
  access_level,
  price,
}: SkillCardData) {
  const [open, setOpen] = useState(false);
  const isPaid = access_level === "paid" && Number(price) > 0;
  const label = isPaid ? `Get — $${Number(price).toFixed(2)}` : "Download";

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl p-[22px] surface-card">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] px-2 py-[3px] rounded-md border bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25 font-semibold uppercase tracking-[0.06em]">
            {AUDIENCE_LABEL[audience] ?? audience}
          </span>
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.01em] text-foreground leading-tight">
          {name}
        </h3>

        {tagline ? (
          <p className="mt-2 text-[14px] text-muted-foreground leading-[1.6] flex-1">
            {tagline}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <Button
          onClick={() => setOpen(true)}
          disabled={!file_url}
          variant="hero"
          size="sm"
          className="mt-5 self-start gap-1.5"
        >
          <Download className="h-4 w-4" />
          {label}
        </Button>
      </div>

      <SkillDownloadDialog
        open={open}
        onOpenChange={setOpen}
        skillName={name}
        skillSlug={slug}
        fileUrl={file_url}
      />
    </>
  );
}
