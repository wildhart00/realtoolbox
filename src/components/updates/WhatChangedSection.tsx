import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { UPDATES, SEED_META, type AudienceChoice } from "@/lib/updates/seed";
import { splitUpdates } from "@/lib/updates/logic";
import { tasksFor, TOOL_NAMES } from "@/lib/updates/taskFinder";
import { visibleUpdates, isPreviewHost } from "@/lib/updates/releaseGuard";
import { UpdateCard } from "./UpdateCard";
import { cn } from "@/lib/utils";
import { UseCaseCard } from "./UseCaseCard";
import { PREVIEW_USE_CASES } from "@/lib/engine/useCases";

const KEY = "rt_audience";
const OPTIONS: { value: AudienceChoice; label: string }[] = [
  { value: "investor", label: "Investor" },
  { value: "agent", label: "Agent" },
  { value: "both", label: "Both" },
];

function readStored(): AudienceChoice {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "investor" || v === "agent" || v === "both") return v;
  } catch { /* ignore */ }
  return "both";
}

interface Props {
  now?: Date;
  hostname?: string;
}

export function WhatChangedSection({ now, hostname }: Props) {
  const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
  const [refNow] = useState(() => now ?? new Date());
  const [choice, setChoice] = useState<AudienceChoice>(readStored);
  const arrowRef = useRef(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  useEffect(() => {
    try { localStorage.setItem(KEY, choice); } catch { /* ignore */ }
    setTaskId(null);
  }, [choice]);

  const preview = isPreviewHost(host);
  const { recent, background } = useMemo(
    () => splitUpdates(visibleUpdates(UPDATES, host), choice, refNow),
    [choice, refNow, host],
  );
  const tasks = tasksFor(choice);
  const activeTask = tasks.find((t) => t.id === taskId);
  const nothingApproved = recent.length === 0 && background.length === 0;

  return (
    <section aria-labelledby="what-changed-heading" className="w-full px-6 lg:px-10 pt-6 pb-12">
      <div className="mx-auto max-w-[1100px]">
        <div id="updates" className="scroll-mt-20" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-foreground/12 pb-4">
          <h2 id="what-changed-heading" className="font-display text-[26px] sm:text-[32px] tracking-[-0.02em] leading-[1.1] text-foreground">
            Latest
          </h2>
        <fieldset>
          <legend id="audience-legend" className="sr-only">Show updates for</legend>
          <RadioGroupPrimitive.Root
            aria-labelledby="audience-legend"
            value={choice}
            onValueChange={(v) => setChoice(v as AudienceChoice)}
            orientation="horizontal"
            loop
            onKeyDown={(e) => {
              // WAI-ARIA radio pattern: arrow keys move focus AND select.
              if (e.key.startsWith("Arrow")) {
                arrowRef.current = true;
                window.setTimeout(() => { arrowRef.current = false; }, 150);
              }
            }}
            className="inline-flex rounded-full border border-foreground/15 p-1 bg-card"
          >
            {OPTIONS.map((o) => (
              <RadioGroupPrimitive.Item
                key={o.value}
                value={o.value}
                onFocus={() => { if (arrowRef.current) setChoice(o.value); }}
                className={cn(
                  "min-h-11 rounded-full px-4 text-[14px] font-medium transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "text-foreground/70 hover:text-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
                )}
              >
                {o.label}
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
        </fieldset>
        </div>

        <div className="mt-4 rounded-lg border border-foreground/12 bg-muted/60 px-4 py-3 text-[14px] leading-[1.55] text-foreground/80">
          <p className="font-semibold text-foreground">
            {preview
              ? <><span className="text-accent">Preview sample, not approved for publication.</span> Automatic updates aren't active; these tools are untested.</>
              : "Vendor-announced items, untested by us. Automatic updates aren't active."}
          </p>
          <details className="mt-1">
            <summary className="min-h-11 flex items-center cursor-pointer text-accent font-medium">About sources and dates</summary>
            <p className="pb-1">
              Each item is based on the vendor's own announcement unless marked otherwise. {SEED_META.coverage_note} "Announced" is the vendor's date; "Source checked" is when we last re-read it — neither guarantees availability in your account.
            </p>
          </details>
        </div>

        {nothingApproved ? (
          <p className="mt-8 text-[14px] text-muted-foreground" data-testid="no-approved">
            Updates are being reviewed and will appear here once approved.
          </p>
        ) : (
          <>
            <h3 className="mt-6 text-[14px] font-semibold text-foreground/75">Last 30 days</h3>
            {recent.length === 0 ? (
              <p className="mt-3 text-[14px] text-muted-foreground">No reviewed announcements for this audience in the last 30 days.</p>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {recent.map((u) => <UpdateCard key={u.id} u={u} />)}
              </div>
            )}
          </>
        )}

        <div id="find-a-tool" className="mt-14 scroll-mt-20" role="region" aria-labelledby="task-finder-heading">
          <h2 id="task-finder-heading" className="font-display text-[26px] sm:text-[30px] tracking-[-0.02em] text-foreground">
            Find a tool by task
          </h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-muted-foreground">
            Matches come from each vendor's own description of the tools in our directory. We have not tested them, and this is not a ranking. Looking for skills you own? See the <Link to="/toolbox" className="text-accent underline-offset-2 hover:underline">Toolbox</Link>; the full <Link to="/browse" className="text-accent underline-offset-2 hover:underline">tool directory</Link> is separate.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tasks.map((t) => {
              const active = t.id === taskId;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTaskId(active ? null : t.id)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-[14px] transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-accent bg-accent/15 text-foreground" : "border-foreground/15 text-foreground/75 hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div aria-live="polite" className="mt-4 min-h-[24px]">
            {activeTask && (
              <ul className="flex flex-wrap gap-3" aria-label={`Tools for: ${activeTask.label}`}>
                {activeTask.toolSlugs.map((s) => (
                  <li key={s}>
                    <Link to={`/tools/${s}`} className="inline-flex min-h-11 items-center rounded-lg border border-foreground/15 px-3 text-[14px] text-foreground hover:border-accent">
                      {TOOL_NAMES[s] ?? s} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {preview && <div className="mt-12" role="region" aria-labelledby="use-case-heading">
          <h3 id="use-case-heading" className="font-display text-[22px] text-foreground">Practical applications to evaluate</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {PREVIEW_USE_CASES.filter(c => choice === "both" || c.audience.includes(choice)).map(c => <UseCaseCard key={c.id} title={c.title} sourceUrl={c.sourceUrl} useCase={c.useCase} />)}
          </div>
        </div>}
        {background.length > 0 && (
          <>
            <h3 className="mt-14 text-[14px] font-semibold text-foreground/75">
              Background — earlier announcements, not new this month
            </h3>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {background.map((u) => <UpdateCard key={u.id} u={u} background />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
