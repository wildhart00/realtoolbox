import type { SourceDef, SourceHealth } from "./types";

export const FAILURE_ALERT_THRESHOLD = 3;
const HOUR = 3_600_000;

export function emptyHealth(sourceId: string): SourceHealth {
  return {
    sourceId, lastAttemptAt: null, lastSuccessAt: null, lastChangeAt: null,
    consecutiveFailures: 0, lastError: null, lastGoodSnapshotHash: null,
  };
}

/** Successful check. A no-change success refreshes health but NOT freshness. */
export function recordSuccess(h: SourceHealth, at: string, snapshotHash: string, changed: boolean): SourceHealth {
  return {
    ...h,
    lastAttemptAt: at,
    lastSuccessAt: at,
    lastChangeAt: changed ? at : h.lastChangeAt,
    consecutiveFailures: 0,
    lastError: null,
    lastGoodSnapshotHash: snapshotHash,
  };
}

/** Failure keeps the last good snapshot untouched. */
export function recordFailure(h: SourceHealth, at: string, error: string): SourceHealth {
  return { ...h, lastAttemptAt: at, consecutiveFailures: h.consecutiveFailures + 1, lastError: error };
}

export type HealthStatus = "never_checked" | "healthy" | "stale" | "failing" | "alert";

export function healthStatus(h: SourceHealth, src: SourceDef, now: Date): HealthStatus {
  if (h.consecutiveFailures >= FAILURE_ALERT_THRESHOLD) return "alert";
  if (!h.lastSuccessAt) return h.consecutiveFailures > 0 ? "failing" : "never_checked";
  if (now.getTime() - new Date(h.lastSuccessAt).getTime() > src.staleAfterHours * HOUR) return "stale";
  if (h.consecutiveFailures > 0) return "failing";
  return "healthy";
}
