import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { UpdateRecord } from "@/lib/updates/seed";
import { EvidenceBadge, StaleBadge } from "./Badges";
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
        "rounded-xl border border-foreground/12 bg-card p-5 sm:p-6 flex flex-col gap-3 min-w-0",
        background && "opacity-90",
      )}
    >
      <p className="text-[14px] font-semibold text-foreground/80">
        {u.tool} <span className="font-normal text-muted-foreground">· {u.recency_label}</span>
      </p>
      <h3 className="font-display text-[20px] sm:text-[22px] leading-[1.2] tracking-[-0.01em] text-foreground">
        {u.headline}
      </h3>
      <p className="text-[15px] leading-[1.6] text-foreground/85">{u.summary}</p>
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge level={u.evidence_level} />
        <StaleBadge checkedAt={u.checked_at_utc} />
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 border-t border-foreground/10 pt-3 text-[14px] text-muted-foreground">
        <div><dt className="inline">Announced: </dt><dd className="inline text-foreground">{fmt(u.source_publication_date)}</dd></div>
        <div><dt className="inline">Source checked: </dt><dd className="inline text-foreground">{fmt(u.checked_at_utc)}</dd></div>
        <div><dt className="inline">For: </dt><dd className="inline text-foreground">{u.audience.map((a) => (a === "investor" ? "Investors" : "Agents")).join(", ")}</dd></div>
      </dl>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
        className="self-start inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {open ? "Hide" : "Why it matters, limits & next step"}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id={detailsId} className="space-y-2.5 text-[14.5px] leading-[1.6] text-foreground/85">
          <p><strong className="text-foreground">Possible benefit:</strong> {u.practical_benefit}</p>
          <p><strong className="text-foreground">Limitations:</strong> {u.limitations}</p>
          <p><strong className="text-foreground">Next step:</strong> {u.next_step}</p>
          <p className="text-[14px] text-muted-foreground">
            Pricing: {u.pricing}. Geography: {u.geography}. Basis: {u.application_basis}.
          </p>
        </div>
      )}
      <a
        href={u.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-accent hover:text-foreground underline-offset-4 hover:underline"
      >
        Read the vendor announcement <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </article>
  );
}
