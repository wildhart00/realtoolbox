import type { Candidate, ReviewState } from "./types";

export const TRANSITIONS: Record<ReviewState, ReviewState[]> = {
  queued: ["approved", "rejected", "needs_correction"],
  needs_correction: ["queued", "rejected"],
  auto_eligible: ["approved", "queued", "rejected"],
  approved: ["published", "queued"],
  rejected: [],
  published: ["withdrawn"],
  withdrawn: [],
};

export class TransitionError extends Error {}

export function canTransition(from: ReviewState, to: ReviewState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(c: Candidate, to: ReviewState, at: string, note?: string): Candidate {
  if (!canTransition(c.state, to)) throw new TransitionError(`invalid_transition:${c.state}->${to}`);
  if ((to === "rejected" || to === "needs_correction" || to === "withdrawn") && !note?.trim()) {
    throw new TransitionError("note_required");
  }
  if (to === "approved" && c.flags.includes("injection_suspected") && !note?.trim()) {
    throw new TransitionError("note_required_for_flagged");
  }
  return { ...c, state: to, history: [...c.history, { at, from: c.state, to, note }] };
}

/** Apply an editor correction; returns candidate to queued for re-review. */
export function applyCorrection(c: Candidate, patch: Partial<Pick<Candidate, "title" | "draftSummary">>, at: string, note: string): Candidate {
  if (c.state !== "needs_correction") throw new TransitionError("not_awaiting_correction");
  return transition({ ...c, ...patch }, "queued", at, note);
}
