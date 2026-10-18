import type { Candidate, ReviewState, SourceHealth } from "./types";
import { emptyHealth } from "./health";
import { transition } from "./review";

/**
 * Preview-only in-memory repository. Never writes to the backend. Publishing is
 * disabled: "published" transitions throw, so simulations cannot go live.
 */
export class InMemoryRepo {
  readonly mode = "preview_simulation" as const;
  candidates = new Map<string, Candidate>();
  health = new Map<string, SourceHealth>();
  paused = false;
  log: { at: string; sourceId: string; message: string }[] = [];

  getHealth(id: string): SourceHealth {
    return this.health.get(id) ?? emptyHealth(id);
  }
  setHealth(h: SourceHealth) {
    this.health.set(h.sourceId, h);
  }
  findByUrl(url: string): Candidate | undefined {
    for (const c of this.candidates.values()) if (c.canonicalUrl === url) return c;
    return undefined;
  }
  findByHash(hash: string): Candidate | undefined {
    for (const c of this.candidates.values()) if (c.contentHash === hash) return c;
    return undefined;
  }
  add(c: Candidate) {
    this.candidates.set(c.id, c);
  }
  update(id: string, to: ReviewState, at: string, note?: string): Candidate {
    if (to === "published") throw new Error("publish_disabled_in_preview");
    const c = this.candidates.get(id);
    if (!c) throw new Error("not_found");
    const next = transition(c, to, at, note);
    this.candidates.set(id, next);
    return next;
  }
  byState(s: ReviewState): Candidate[] {
    return [...this.candidates.values()].filter((c) => c.state === s);
  }
}
