import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { UpdateRecord } from "@/lib/updates/seed";
import { DraftBadge, EvidenceBadge, StaleBadge } from "./Badges";
import { cn } from "@/lib/utils";

function fmt(iso: string) {
  return new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function UpdateCard({ u, background }: { u: UpdateRecord; background?: boolean }) {
  const [open, setOpen] = useState(false);
  const detailsId = `update-details-${u.id}`;
  return (
    <article
      className={cn(
        "surface-card rounded-2xl border border-foreground/10 p-5 sm:p-6 flex flex-col gap-3",
        background && "opacity-90",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge level={u.evidence_level} />
        <StaleBadge checkedAt={u.checked_at_utc} />
        <DraftBadge />
      </div>
      <p className="text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
        {u.tool} · {u.recency_label}
      </p>
      <h3 className="font-display text-[20px] sm:text-[22px] leading-[1.2] tracking-[-0.01em] text-foreground">
        {u.headline}
      </h3>
      <p className="text-[14px] leading-[1.6] text-foreground/80">{u.summary}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
        <div><dt className="inline">Announced: </dt><dd className="inline text-foreground/80">{fmt(u.source_publication_date)}</dd></div>
        <div><dt className="inline">Source checked: </dt><dd className="inline text-foreground/80">{fmt(u.checked_at_utc)}</dd></div>
        <div><dt className="inline">For: </dt><dd className="inline text-foreground/80">{u.audience.map((a) => (a === "investor" ? "Investors" : "Agents")).join(", ")}</dd></div>
      </dl>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
        className="self-start inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {open ? "Hide" : "Why it matters, limits & next step"}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id={detailsId} className="space-y-2.5 text-[13.5px] leading-[1.6] text-foreground/80">
          <p><strong className="text-foreground">Possible benefit:</strong> {u.practical_benefit}</p>
          <p><strong className="text-foreground">Limitations:</strong> {u.limitations}</p>
          <p><strong className="text-foreground">Next step:</strong> {u.next_step}</p>
          <p className="text-[12.5px] text-muted-foreground">
            Pricing: {u.pricing}. Geography: {u.geography}. Basis: {u.application_basis}.
          </p>
        </div>
      )}
      <a
        href={u.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-[13px] text-foreground/80 hover:text-foreground underline-offset-4 hover:underline"
      >
        Read the vendor announcement <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </article>
  );
}
