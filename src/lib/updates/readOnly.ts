import { safeHttps, validDate } from "./validation";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const PUBLIC_COLUMNS = "id,vendor,title,summary,source_url,source_published_date,source_checked_at,published_at,evidence_level" as const;
export const PUBLIC_LIMIT = 30;
export type PublicUpdate = { [K in keyof Database["public"]["Views"]["updates_public"]["Row"]]: string };
export const CANDIDATE_COLUMNS = "id,source_id,canonical_url,content_hash,revision_of,title,published_date,draft_summary,evidence_level,risk,risk_reasons,flags,contradictions,state,source_checked_at,first_seen_at,reviewed_at,published_at,withdrawn_at,updated_at" as const;
export const EVENT_COLUMNS = "id,candidate_id,from_state,to_state,note,actor_id,created_at" as const;
export const QUEUE_LIMIT = 50;
export const EVENT_LIMIT = 200;
export type QueueCandidate = Database["public"]["Tables"]["update_candidates"]["Row"];
export type ReviewEvent = Database["public"]["Tables"]["update_review_events"]["Row"];

export function parsePublicUpdates(rows: unknown): PublicUpdate[] {
  if (!Array.isArray(rows) || rows.length > PUBLIC_LIMIT) throw new Error("invalid_public_response");
  const ids = new Set<string>();
  return rows.map((row) => {
    if (!row || typeof row !== "object") throw new Error("invalid_public_record");
    const r = row as Record<string, unknown>;
    for (const key of PUBLIC_COLUMNS.split(",")) {
      if (typeof r[key] !== "string" || !(r[key] as string).trim() || (r[key] as string).length > 12000) throw new Error("invalid_public_record");
    }
    if (!safeHttps(r.source_url) || !validDate(r.source_published_date, true) || !validDate(r.source_checked_at) || !validDate(r.published_at) || ids.has(r.id as string)) throw new Error("invalid_public_provenance");
    ids.add(r.id as string);
    // Explicit projection prevents unexpected private columns entering display state.
    return Object.fromEntries(PUBLIC_COLUMNS.split(",").map(k => [k, r[k]])) as PublicUpdate;
  });
}
export async function readPublicUpdates(signal: AbortSignal): Promise<PublicUpdate[]> {
  const { data, error } = await supabase.from("updates_public").select(PUBLIC_COLUMNS)
    .order("published_at", { ascending: false }).limit(PUBLIC_LIMIT).abortSignal(signal);
  if (error || data === null) throw new Error("public_updates_unavailable");
  return parsePublicUpdates(data);
}
export async function readPrivateQueue(signal: AbortSignal): Promise<{ candidates: QueueCandidate[]; events: ReviewEvent[] }> {
  const result = await supabase.from("update_candidates").select(CANDIDATE_COLUMNS)
    .order("first_seen_at", { ascending: false }).limit(QUEUE_LIMIT).abortSignal(signal);
  if (result.error || !result.data) throw new Error("queue_unavailable");
  const candidates = result.data;
  for (const c of candidates) {
    if (!safeHttps(c.canonical_url) || !validDate(c.published_date, true) ||
        ![c.source_checked_at, c.first_seen_at, c.updated_at].every(d => validDate(d)) ||
        ![c.reviewed_at, c.published_at, c.withdrawn_at].every(d => d === null || validDate(d))) throw new Error("invalid_queue_provenance");
  }
  if (signal.aborted) throw new Error("read_cancelled");
  if (!candidates.length) return { candidates: [], events: [] };
  const events = await supabase.from("update_review_events").select(EVENT_COLUMNS)
    .in("candidate_id", candidates.map(c => c.id)).order("created_at", { ascending: false }).limit(EVENT_LIMIT).abortSignal(signal);
  if (events.error || !events.data || events.data.some(e => !validDate(e.created_at) || !candidates.some(c => c.id === e.candidate_id))) throw new Error("events_unavailable");
  return { candidates, events: events.data };
}
