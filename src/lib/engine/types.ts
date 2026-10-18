/**
 * Update-engine core types. Pure, provider-agnostic. Nothing here performs
 * network fetches, model calls, emails or database writes.
 */
export type SourceKind = "press_release_index";

export interface SourceDef {
  id: string;
  vendor: string;
  kind: SourceKind;
  indexUrl: string;
  /** Exact hostnames permitted for index, item and redirect targets. */
  allowedHosts: string[];
  /** Item URLs must start with one of these path prefixes. */
  allowedPathPrefixes: string[];
  enabled: boolean;
  cadenceHours: number;
  staleAfterHours: number;
}

export interface RawItem {
  url: string;
  title: string;
  publishedDate: string; // YYYY-MM-DD as reported by the source
  body: string;
}

/** What an adapter returns. Fixtures produce these; no live adapter exists yet. */
export type FetchResult =
  | { status: "ok"; finalUrl: string; fetchedAt: string; items: RawItem[] }
  | { status: "redirect"; finalUrl: string; fetchedAt: string }
  | { status: "http_error"; httpStatus: number; fetchedAt: string }
  | { status: "timeout"; fetchedAt: string }
  | { status: "malformed"; fetchedAt: string; detail: string };

export interface SourceAdapter {
  readonly sourceId: string;
  fetchIndex(): Promise<FetchResult>;
}

export type RiskCategory =
  | "pricing" | "availability" | "performance" | "ranking"
  | "privacy" | "legal" | "financial" | "sponsor";

export type CandidateFlag =
  | "injection_suspected" | "contradiction" | "expired" | "high_risk" | "verbatim_overlap";

export type ReviewState =
  | "queued" | "needs_correction" | "approved" | "rejected"
  | "auto_eligible" | "published" | "withdrawn";

export interface Candidate {
  id: string;
  sourceId: string;
  vendor: string;
  canonicalUrl: string;
  contentHash: string;
  title: string;
  publishedDate: string;
  /** Template-generated metadata line; never copied article text. */
  draftSummary: string;
  evidenceLevel: "vendor_announced";
  risk: "low" | "high";
  riskReasons: RiskCategory[];
  flags: CandidateFlag[];
  contradictions: string[];
  state: ReviewState;
  history: { at: string; from: ReviewState | null; to: ReviewState; note?: string }[];
}

export interface SourceHealth {
  sourceId: string;
  lastAttemptAt: string | null;
  /** Any successful check, including no-change. Health only. */
  lastSuccessAt: string | null;
  /** Last time new content was detected. Freshness. */
  lastChangeAt: string | null;
  consecutiveFailures: number;
  lastError: string | null;
  lastGoodSnapshotHash: string | null;
}

export type RunOutcome =
  | { kind: "skipped"; reason: "paused" | "source_disabled" | "budget_exhausted" }
  | { kind: "failed"; reason: string }
  | { kind: "no_change" }
  | { kind: "changed"; created: number; duplicates: number; rejected: number };
