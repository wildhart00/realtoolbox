import type { Audience } from "./seed";

/**
 * Conservative, static task → tool mapping over tools already in the directory.
 * Matches are based on each vendor's own description, not hands-on testing.
 */
export interface FinderTask {
  id: string;
  label: string;
  audience: Audience[];
  toolSlugs: string[];
}

export const FINDER_TASKS: FinderTask[] = [
  { id: "investor-crm", label: "Manage seller leads and follow-up", audience: ["investor"], toolSlugs: ["resimpli"] },
  { id: "lead-response", label: "Respond to new leads by call or text", audience: ["agent", "investor"], toolSlugs: ["structurely", "frontdesk"] },
  { id: "intake", label: "Turn intake forms into conversations", audience: ["agent", "investor"], toolSlugs: ["perspective-ai"] },
  { id: "meeting-notes", label: "Summarize client or team calls", audience: ["agent", "investor"], toolSlugs: ["fireflies-ai"] },
  { id: "automation", label: "Connect apps and automate routine steps", audience: ["agent", "investor"], toolSlugs: ["n8n"] },
  { id: "marketing", label: "Design listing or deal marketing materials", audience: ["agent", "investor"], toolSlugs: ["canva", "gamma"] },
  { id: "site", label: "Build a simple website or app", audience: ["agent", "investor"], toolSlugs: ["lovable"] },
];

export function tasksFor(choice: Audience | "both"): FinderTask[] {
  return choice === "both" ? FINDER_TASKS : FINDER_TASKS.filter((t) => t.audience.includes(choice));
}
