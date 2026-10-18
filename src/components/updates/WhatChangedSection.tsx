import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type AudienceChoice } from "@/lib/updates/seed";
import { tasksFor, TOOL_NAMES } from "@/lib/updates/taskFinder";
import { PublicUpdatesFeed } from "./PublicUpdatesFeed";
import { Button } from "@/components/ui/button";
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

export function WhatChangedSection(_props: Props) {
  const [choice, setChoice] = useState<AudienceChoice>(readStored);
  const arrowRef = useRef(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  useEffect(() => {
    try { localStorage.setItem(KEY, choice); } catch { /* ignore */ }
    setTaskId(null);
  }, [choice]);

  const tasks = tasksFor(choice);
  const activeTask = tasks.find((t) => t.id === taskId);

  return (
    <section aria-labelledby="what-changed-heading" className="w-full px-6 lg:px-10 pt-6 pb-12">
      <div className="mx-auto max-w-[1100px]">
        <div id="updates" className="scroll-mt-20" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-foreground/12 pb-4">
          <h2 id="what-changed-heading" className="font-display text-[26px] sm:text-[32px] tracking-[-0.02em] leading-[1.1] text-foreground">
            Latest
          </h2>

        </div>

        <div className="mt-4 rounded-lg border border-foreground/12 bg-muted/60 px-4 py-3 text-[14px] leading-[1.55] text-foreground/80">
          <p className="font-semibold text-foreground">
            Published updates only. Automatic updates aren't active.
          </p>
          <details className="mt-1">
            <summary className="min-h-11 flex items-center cursor-pointer text-accent font-medium">About sources and dates</summary>
            <p className="pb-1">
              Source publication is the vendor’s date; source checked is the recorded verification time; editorial publication is when the item was published here. Reading this page changes none of these dates. Evidence labels do not imply hands-on testing. The feed has no audience filter.
            </p>
          </details>
        </div>

        <PublicUpdatesFeed />

        <div id="find-a-tool" className="mt-14 scroll-mt-20" role="region" aria-labelledby="task-finder-heading">
          <h2 id="task-finder-heading" className="font-display text-[26px] sm:text-[30px] tracking-[-0.02em] text-foreground">
            Find a tool by task
          </h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-muted-foreground">
            Matches come from each vendor's own description of the tools in our directory. We have not tested them, and this is not a ranking. Looking for skills you own? See the <Link to="/toolbox" className="text-accent underline-offset-2 hover:underline">Toolbox</Link>; the full <Link to="/browse" className="text-accent underline-offset-2 hover:underline">tool directory</Link> is separate.
          </p>
        <fieldset>
          <legend id="audience-legend" className="sr-only">Find tools for</legend>
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
          <div className="mt-5 flex flex-wrap gap-2">
            {tasks.map((t) => {
              const active = t.id === taskId;
              return (
                <Button
                  key={t.id}
                  variant="outline"
                  aria-pressed={active}
                  onClick={() => setTaskId(active ? null : t.id)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-[14px] transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-accent bg-accent/15 text-foreground" : "border-foreground/15 text-foreground/75 hover:text-foreground",
                  )}
                >
                  {t.label}
                </Button>
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


      </div>
    </section>
  );
}
