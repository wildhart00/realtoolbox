import type { Candidate, CandidateFlag, FetchResult, RunOutcome, SourceDef } from "./types";
import { checkUrl } from "./registry";
import { canonicalizeUrl, contentHash, hashText, longestSharedWordRun } from "./canonical";
import { validateItem, LIMITS } from "./extract";
import { classifyRisk, routeCandidate, DEFAULT_POLICY, type AutoPolicy } from "./risk";
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
  policy?: AutoPolicy;
  /** Source treats fetch as pre-reserved by caller when true. */
}

/**
 * Process one fetch result for one source against the in-memory repo.
 * The caller supplies the FetchResult (fixtures today); no network here.
 */
export function processFetch(src: SourceDef, result: FetchResult, repo: InMemoryRepo, opts: RunOptions): RunOutcome {
  const policy = opts.policy ?? DEFAULT_POLICY;
  if (repo.paused) return { kind: "skipped", reason: "paused" };
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
  const snapshot = hashText(items.map((i) => `${i?.url}|${i?.title}|${i?.publishedDate}`).join("\n"));
  if (snapshot === h.lastGoodSnapshotHash) {
    repo.setHealth(recordSuccess(h, opts.now, snapshot, false));
    return { kind: "no_change" };
  }

  let created = 0, duplicates = 0, rejected = 0;
  for (const raw of items) {
    if (!reserve(opts.budget, "item")) { rejected++; continue; }
    const v = validateItem(raw, src, result.fetchedAt);
    if (v.ok !== true) { rejected++; repo.log.push({ at: opts.now, sourceId: src.id, message: `item_rejected: ${(v as { reason: string }).reason}` }); continue; }
    if (v.expired) { rejected++; repo.log.push({ at: opts.now, sourceId: src.id, message: "item_rejected: expired" }); continue; }

    const url = canonicalizeUrl(v.url);
    const hash = contentHash(v.title, v.date, v.body);
    const sameUrl = repo.findByUrl(url);
    if (sameUrl && sameUrl.contentHash === hash) { duplicates++; continue; }
    if (!sameUrl && repo.findByHash(hash)) { duplicates++; continue; }

    const flags: CandidateFlag[] = [];
    const contradictions: string[] = [];
    if (v.injection) flags.push("injection_suspected");
    if (sameUrl) {
      flags.push("contradiction");
      if (sameUrl.publishedDate !== v.date) contradictions.push(`date: ${sameUrl.publishedDate} vs ${v.date}`);
      if (sameUrl.title !== v.title) contradictions.push(`title: "${sameUrl.title}" vs "${v.title}"`);
      if (contradictions.length === 0) contradictions.push("body changed at same URL");
    }
    const risk = classifyRisk(v.title, v.body);
    if (risk.risk === "high") flags.push("high_risk");
    const summary = templateSummary(src.vendor, v.title, v.date);
    if (longestSharedWordRun(summary, v.body) > LIMITS.verbatimRunMax) flags.push("verbatim_overlap");
    if (!reserve(opts.budget, "draft")) { rejected++; continue; }

    const state = routeCandidate(risk, flags, policy);
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
      history: [{ at: opts.now, from: null, to: state }],
    };
    repo.add(c);
    created++;
  }

  repo.setHealth(recordSuccess(h, opts.now, snapshot, created > 0));
  return { kind: "changed", created, duplicates, rejected };
}
