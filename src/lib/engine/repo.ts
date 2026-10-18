import type { Candidate, EngineSettings, ReviewState, SourceHealth } from "./types";
import { SEED_SETTINGS } from "./types";
import { emptyHealth } from "./health";
import { transition } from "./review";

/**
 * Preview-only in-memory repository. Never writes to the backend. Publishing is
 * disabled: "published" transitions throw, so simulations cannot go live.
 * Settings default to the fail-closed seed (paused, untested policy); `null`
 * models a missing settings row and blocks all runs.
 */
export class InMemoryRepo {
  readonly mode = "preview_simulation" as const;
  candidates = new Map<string, Candidate>();
  health = new Map<string, SourceHealth>();
  settings: EngineSettings | null = { ...SEED_SETTINGS };
  log: { at: string; sourceId: string; message: string }[] = [];

  getHealth(id: string): SourceHealth {
    return this.health.get(id) ?? emptyHealth(id);
  }
  setHealth(h: SourceHealth) {
    this.health.set(h.sourceId, h);
  }
  /** Exact revision lookup: same source + same content hash. */
  findRevision(sourceId: string, hash: string): Candidate | undefined {
    return this.candidates.get(`${sourceId}:${hash}`);
  }
  /** Latest revision for a canonical URL (insertion order). */
  latestByUrl(sourceId: string, url: string): Candidate | undefined {
    let last: Candidate | undefined;
    for (const c of this.candidates.values()) if (c.sourceId === sourceId && c.canonicalUrl === url) last = c;
    return last;
  }
  findByHashAnywhere(hash: string): Candidate | undefined {
    for (const c of this.candidates.values()) if (c.contentHash === hash) return c;
    return undefined;
  }
  /** Insert-only: never overwrites an existing revision. */
  add(c: Candidate) {
    if (this.candidates.has(c.id)) throw new Error("revision_exists");
    this.candidates.set(c.id, c);
  }
  /** Re-seen identical content: refresh source check time only; state/history untouched. */
  touchChecked(id: string, at: string) {
    const c = this.candidates.get(id);
    if (c) this.candidates.set(id, { ...c, sourceCheckedAt: at });
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
