import { describe, it, expect } from "vitest";
import { UPDATES } from "./seed";
import { splitUpdates, isStale } from "./logic";
import { tasksFor } from "./taskFinder";

const NOW = new Date("2026-10-18T15:30:00Z");

describe("what changed preview", () => {
  it("only two entries fall in the last 30 days, four are background", () => {
    const { recent, background } = splitUpdates(UPDATES, "both", NOW);
    expect(recent.map((u) => u.id)).toEqual([
      "realtor-realassist-agents-2026-10-06",
      "appfolio-realm-x-2026-09-29",
    ]);
    expect(background).toHaveLength(4);
  });

  it("every entry is vendor_announced and not hands-on tested", () => {
    expect(UPDATES.every((u) => u.evidence_level === "vendor_announced" && u.hands_on_tested === false)).toBe(true);
  });

  it("investor view excludes agent-only entries", () => {
    const { recent, background } = splitUpdates(UPDATES, "investor", NOW);
    const ids = [...recent, ...background].map((u) => u.id);
    expect(ids).not.toContain("realtor-realassist-agents-2026-10-06");
    expect(ids).toContain("appfolio-realm-x-2026-09-29");
  });

  it("source check older than 90 days is stale", () => {
    expect(isStale("2026-10-18T15:22:19Z", NOW)).toBe(false);
    expect(isStale("2026-07-01T00:00:00Z", NOW)).toBe(true);
  });

  it("agent task list omits investor-only tasks", () => {
    expect(tasksFor("agent").some((t) => t.id === "investor-crm")).toBe(false);
  });
});
