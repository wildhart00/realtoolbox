import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { UPDATES, SEED_META, type AudienceChoice } from "@/lib/updates/seed";
import { splitUpdates } from "@/lib/updates/logic";
import { tasksFor, TOOL_NAMES } from "@/lib/updates/taskFinder";
import { visibleUpdates, isPreviewHost } from "@/lib/updates/releaseGuard";
import { UpdateCard } from "./UpdateCard";
import { cn } from "@/lib/utils";

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
    <section aria-labelledby="what-changed-heading" className="w-full px-6 lg:px-10 py-12">
      <div className="mx-auto max-w-[1100px]">
        <div id="updates" className="scroll-mt-20" />
        {preview && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Preview · draft content, not approved for publication
          </p>
        )}
        <h2 id="what-changed-heading" className="mt-2 font-display text-[30px] sm:text-[38px] tracking-[-0.02em] leading-[1.1] text-foreground">
          What changed in real estate AI
        </h2>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.6] text-muted-foreground">
          Dated vendor announcements, with what they may mean for your work and what we have not verified.
          {" "}{SEED_META.coverage_note} A source check date is not a guarantee the feature is available in your account today.
        </p>

        <fieldset className="mt-6">
          <legend id="audience-legend" className="text-[12.5px] text-muted-foreground mb-2">Show updates for</legend>
          <RadioGroupPrimitive.Root
            aria-labelledby="audience-legend"
            value={choice}
            onValueChange={(v) => setChoice(v as AudienceChoice)}
            orientation="horizontal"
            loop
            onKeyUp={(e) => {
              // Ensure arrow-key focus also selects (WAI-ARIA radio pattern).
              if (!e.key.startsWith("Arrow")) return;
              const v = (document.activeElement as HTMLElement | null)?.getAttribute("value");
              if (v === "investor" || v === "agent" || v === "both") setChoice(v);
            }}
            className="inline-flex rounded-full border border-foreground/15 p-1 bg-background/40"
          >
            {OPTIONS.map((o) => (
              <RadioGroupPrimitive.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "min-h-11 rounded-full px-4 text-[13px] font-medium transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "text-foreground/70 hover:text-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
                )}
              >
                {o.label}
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroupPrimitive.Root>
        </fieldset>

        {nothingApproved ? (
          <p className="mt-8 text-[14px] text-muted-foreground" data-testid="no-approved">
            Updates are being reviewed and will appear here once approved.
          </p>
        ) : (
          <>
            <h3 className="mt-10 text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground/70">Last 30 days</h3>
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
          <p className="mt-2 max-w-2xl text-[13.5px] text-muted-foreground">
            Matches come from each vendor's own description of the tools in our directory. We have not tested them, and this is not a ranking.
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
                    "min-h-11 rounded-full border px-3.5 text-[13px] transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                    <Link to={`/tools/${s}`} className="inline-flex min-h-11 items-center rounded-lg border border-foreground/15 px-3 text-[13.5px] text-foreground hover:border-accent">
                      {TOOL_NAMES[s] ?? s} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {background.length > 0 && (
          <>
            <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
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
