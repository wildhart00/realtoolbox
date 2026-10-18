import { describe, it, expect } from "vitest";
import { InMemoryRepo } from "./repo";
import { processFetch } from "./pipeline";
import { createBudget } from "./budget";
import { canPublish } from "./review";
import { getSource } from "./registry";
import { fixtureSource, realtorItem, ok, REALTOR_INDEX, FIXTURE_NOW } from "./fixtures";
import { SEED_SETTINGS } from "./types";

const R = fixtureSource("realtor-mediaroom");
const mk = () => { const r = new InMemoryRepo(); r.settings = { paused: false, templateAutoPublishTested: false }; return r; };
const go = (repo: InMemoryRepo, items = [realtorItem(1)], budget = createBudget(), now = FIXTURE_NOW, fetchedAt = FIXTURE_NOW) =>
  processFetch(R, ok(REALTOR_INDEX, items, fetchedAt), repo, { now, budget });

describe("defect 1: body-only change", () => {
  it("same URL/title/date with corrected body creates a new revision end-to-end", () => {
    const repo = mk();
    go(repo, [realtorItem(1)]);
    const out = go(repo, [realtorItem(1, { body: "Synthetic corrected body text for the same release." })]);
    expect(out).toMatchObject({ kind: "changed", created: 1 });
    const revs = [...repo.candidates.values()];
    expect(revs).toHaveLength(2);
    expect(revs[1].revisionOf).toBe(revs[0].id);
    expect(revs[1].contradictions).toEqual(["body changed at same URL"]);
  });
});

describe("defect 2: budget exhaustion is resumable", () => {
  it("partial batch does not commit snapshot; fresh budget retry processes the rest", () => {
    const repo = mk();
    const items = [realtorItem(1), realtorItem(2), realtorItem(3)];
    const first = go(repo, items, createBudget({ draft: 1 }));
    expect(first).toMatchObject({ kind: "partial", created: 1, deferred: 2 });
    expect(repo.getHealth(R.id).lastGoodSnapshotHash).toBeNull();
    const retry = go(repo, items, createBudget());
    expect(retry).toMatchObject({ kind: "changed", created: 2, duplicates: 1 });
    expect(repo.candidates.size).toBe(3);
    expect(go(repo, items, createBudget()).kind).toBe("no_change");
  });
});

describe("defect 3: reviewed revisions are preserved", () => {
  it("repeat of an approved revision keeps state and history", () => {
    const repo = mk();
    go(repo, [realtorItem(1)]);
    const id = [...repo.candidates.keys()][0];
    repo.update(id, "approved", FIXTURE_NOW);
    const hist = repo.candidates.get(id)!.history.length;
    go(repo, [realtorItem(1), realtorItem(2)]);
    expect(repo.candidates.get(id)!.state).toBe("approved");
    expect(repo.candidates.get(id)!.history).toHaveLength(hist);
  });

  it("v1 approved -> v2 body change -> back to v1 content: no overwrite, no recreate", () => {
    const repo = mk();
    go(repo, [realtorItem(1)]);
    const v1 = [...repo.candidates.keys()][0];
    repo.update(v1, "approved", FIXTURE_NOW);
    go(repo, [realtorItem(1, { body: "Synthetic revision two body." })]);
    const v2 = [...repo.candidates.keys()][1];
    repo.update(v2, "rejected", FIXTURE_NOW, "regression");
    const out = go(repo, [realtorItem(1)]);
    expect(out).toMatchObject({ created: 0, duplicates: 1 });
    expect(repo.candidates.get(v1)!.state).toBe("approved");
    expect(repo.candidates.get(v2)!.state).toBe("rejected");
    expect(repo.candidates.size).toBe(2);
  });

  it("repo.add refuses to overwrite an existing revision id", () => {
    const repo = mk();
    go(repo);
    const c = [...repo.candidates.values()][0];
    expect(() => repo.add({ ...c, state: "queued" })).toThrow("revision_exists");
  });
});

describe("defect 5: source check time is separate", () => {
  it("re-seen content refreshes sourceCheckedAt only; firstSeen/publication/state unchanged", () => {
    const repo = mk();
    go(repo, [realtorItem(1)], createBudget(), "2026-10-17T00:00:00Z", "2026-10-17T00:00:00Z");
    const id = [...repo.candidates.keys()][0];
    go(repo, [realtorItem(1), realtorItem(2)], createBudget(), "2026-10-18T09:00:00Z", "2026-10-18T09:00:00Z");
    const c = repo.candidates.get(id)!;
    expect(c.sourceCheckedAt).toBe("2026-10-18T09:00:00Z");
    expect(c.firstSeenAt).toBe("2026-10-17T00:00:00Z");
    expect(c.publishedAt).toBeNull();
    expect(c.publishedDate).toBe(realtorItem(1).publishedDate);
  });
});

describe("defect 6: settings fail closed", () => {
  it("seed settings are paused with untested policy", () => {
    expect(SEED_SETTINGS).toEqual({ paused: true, templateAutoPublishTested: false });
    expect(go(new InMemoryRepo())).toEqual({ kind: "skipped", reason: "paused" });
  });
  it("missing settings skip runs", () => {
    const repo = mk();
    repo.settings = null;
    expect(go(repo)).toEqual({ kind: "skipped", reason: "settings_missing" });
    expect(repo.candidates.size).toBe(0);
  });
  it("publication gate respects settings", () => {
    const repo = mk();
    go(repo);
    const id = [...repo.candidates.keys()][0];
    const c = repo.update(id, "approved", FIXTURE_NOW);
    expect(canPublish(c, null)).toEqual({ ok: false, reason: "settings_missing" });
    expect(canPublish(c, { paused: true, templateAutoPublishTested: false })).toEqual({ ok: false, reason: "engine_paused" });
    expect(canPublish({ ...c, state: "queued" }, { paused: false, templateAutoPublishTested: false })).toEqual({ ok: false, reason: "not_approved" });
    expect(canPublish(c, { paused: false, templateAutoPublishTested: false })).toEqual({ ok: true });
  });
  it("unknown source id is not configured", () => expect(getSource("nope")).toBeUndefined());
});
