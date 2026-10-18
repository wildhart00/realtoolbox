import type { Candidate, CandidateFlag, FetchResult, RunOutcome, SourceDef } from "./types";
import { checkUrl } from "./registry";
import { canonicalizeUrl, contentHash, hashText, longestSharedWordRun } from "./canonical";
import { validateItem, LIMITS } from "./extract";
import { classifyRisk, routeCandidate } from "./risk";
import { recordFailure, recordSuccess } from "./health";
import { reserve, type JobBudget } from "./budget";
import type { InMemoryRepo } from "./repo";

/** Template summary from metadata only — never copies body text. */
export function templateSummary(vendor: string, title: string, date: string): string {
  return `${vendor} published an announcement on ${date}: "${title}". Vendor announced; not tested by RealToolbox.`;
}

export interface RunOptions {
  now: string;
  budget: JobBudget;
}

/** Snapshot covers URL, title, date AND canonical body, so body-only corrections are detected. */
type LooseItem = { url?: unknown; title?: unknown; publishedDate?: unknown; body?: unknown } | null | undefined;
export function snapshotHash(items: LooseItem[]): string {
  return hashText(
    items
      .map((i) => {
        const t = typeof i?.title === "string" ? i.title : "";
        const d = typeof i?.publishedDate === "string" ? i.publishedDate : "";
        const b = typeof i?.body === "string" ? i.body : "";
        return `${String(i?.url)}|${contentHash(t, d, b)}`;
      })
      .join("\n"),
  );
}

/**
 * Process one fetch result for one source against the in-memory repo.
 * Settings are read from the repo and fail closed when missing. The snapshot is
 * committed only when every eligible item was processed; a budget-truncated run
 * returns "partial" and leaves the previous snapshot so a later run retries.
 */
export function processFetch(src: SourceDef, result: FetchResult, repo: InMemoryRepo, opts: RunOptions): RunOutcome {
  const settings = repo.settings;
  if (!settings) return { kind: "skipped", reason: "settings_missing" };
  if (settings.paused) return { kind: "skipped", reason: "paused" };
  if (!src.enabled) return { kind: "skipped", reason: "source_disabled" };
  if (!reserve(opts.budget, "fetch")) return { kind: "skipped", reason: "budget_exhausted" };

  const h = repo.getHealth(src.id);
  const fail = (reason: string): RunOutcome => {
    repo.setHealth(recordFailure(h, opts.now, reason));
    repo.log.push({ at: opts.now, sourceId: src.id, message: `failed: ${reason}` });
    return { kind: "failed", reason };
  };

  if (result.status === "http_error") return fail(`http_${result.httpStatus}`);
  if (result.status === "timeout") return fail("timeout");
  if (result.status === "malformed") return fail("malformed_response");
  if (result.status === "redirect") {
    const c = checkUrl(result.finalUrl, src, false);
    return fail(c.ok === true ? "redirect_not_followed" : `redirect_blocked:${(c as { reason: string }).reason}`);
  }
  const finalCheck = checkUrl(result.finalUrl, src, false);
  if (finalCheck.ok !== true) return fail(`final_url_blocked:${(finalCheck as { reason: string }).reason}`);
  if (!Array.isArray(result.items)) return fail("malformed_response");

  const items = result.items.slice(0, LIMITS.itemsPerFetch);
  const snapshot = snapshotHash(items);
  if (snapshot === h.lastGoodSnapshotHash) {
    // No change: refresh source health AND each exact known revision's check time.
    for (const raw of items) {
      const v = validateItem(raw, src, result.fetchedAt);
      if (v.ok !== true || v.expired) continue;
      const known = repo.findRevision(src.id, contentHash(v.title, v.date, v.body));
      if (known) repo.touchChecked(known.id, result.fetchedAt);
    }
    repo.setHealth(recordSuccess(h, opts.now, snapshot, false));
    return { kind: "no_change" };
  }

  let created = 0, duplicates = 0, rejected = 0, deferred = 0;
  for (const raw of items) {
    const v = validateItem(raw, src, result.fetchedAt);
    if (v.ok !== true) { rejected++; repo.log.push({ at: opts.now, sourceId: src.id, message: `item_rejected: ${(v as { reason: string }).reason}` }); continue; }
    if (v.expired) { rejected++; repo.log.push({ at: opts.now, sourceId: src.id, message: "item_rejected: expired" }); continue; }

    const url = canonicalizeUrl(v.url);
    const hash = contentHash(v.title, v.date, v.body);

    // 1) Exact source+content revision already known: keep its decision/history, refresh check time.
    const existing = repo.findRevision(src.id, hash);
    if (existing) { repo.touchChecked(existing.id, result.fetchedAt); duplicates++; continue; }
    // Same content republished under a different URL: duplicate.
    if (repo.findByHashAnywhere(hash)) { duplicates++; continue; }

    // Budget is reserved only for real new work; exhaustion defers, not drops.
    if (!reserve(opts.budget, "item")) { deferred++; continue; }
    if (!reserve(opts.budget, "draft")) { deferred++; continue; }

    // 2) New revision of a known URL: new candidate linked to the latest prior revision.
    const prior = repo.latestByUrl(src.id, url);
    const flags: CandidateFlag[] = [];
    const contradictions: string[] = [];
    if (v.injection) flags.push("injection_suspected");
    if (prior) {
      flags.push("contradiction");
      if (prior.publishedDate !== v.date) contradictions.push(`date: ${prior.publishedDate} vs ${v.date}`);
      if (prior.title !== v.title) contradictions.push(`title: "${prior.title}" vs "${v.title}"`);
      if (contradictions.length === 0) contradictions.push("body changed at same URL");
    }
    const risk = classifyRisk(v.title, v.body);
    if (risk.risk === "high") flags.push("high_risk");
    const summary = templateSummary(src.vendor, v.title, v.date);
    if (longestSharedWordRun(summary, v.body) > LIMITS.verbatimRunMax) flags.push("verbatim_overlap");

    const state = routeCandidate(risk, flags, { templateAutoPublishTested: settings.templateAutoPublishTested });
    const c: Candidate = {
      id: `${src.id}:${hash}`,
      sourceId: src.id,
      vendor: src.vendor,
      canonicalUrl: url,
      contentHash: hash,
      title: v.title,
      publishedDate: v.date,
      draftSummary: summary,
      evidenceLevel: "vendor_announced",
      risk: risk.risk,
      riskReasons: risk.reasons,
      flags,
      contradictions,
      state,
      sourceCheckedAt: result.fetchedAt,
      firstSeenAt: opts.now,
      publishedAt: null,
      revisionOf: prior?.id ?? null,
      history: [{ at: opts.now, from: null, to: state }],
    };
    repo.add(c);
    created++;
  }

  if (deferred > 0) {
    // Do not commit the snapshot: next run re-reads and resumes via dedup.
    repo.setHealth({ ...h, lastAttemptAt: opts.now, lastChangeAt: created > 0 ? opts.now : h.lastChangeAt });
    repo.log.push({ at: opts.now, sourceId: src.id, message: `partial: ${deferred} deferred (budget)` });
    return { kind: "partial", created, duplicates, rejected, deferred };
  }
  repo.setHealth(recordSuccess(h, opts.now, snapshot, created > 0));
  return { kind: "changed", created, duplicates, rejected };
}
