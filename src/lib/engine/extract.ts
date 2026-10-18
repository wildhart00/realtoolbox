import type { RawItem, SourceDef } from "./types";
import { checkUrl } from "./registry";

export const LIMITS = {
  titleMin: 8,
  titleMax: 200,
  bodyMax: 20_000,
  itemsPerFetch: 25,
  maxAgeDays: 120,
  verbatimRunMax: 12,
};

const INJECTION = [
  /ignore (all |any )?(previous|prior|above) instructions/i,
  /disregard (the )?(system|previous)/i,
  /you are now/i,
  /system prompt/i,
  /<\s*script/i,
  /act as (an? )?(admin|assistant|ai)/i,
  /(approve|publish) this (update|item) automatically/i,
];

export type ItemCheck =
  | { ok: true; url: URL; title: string; date: string; body: string; injection: boolean; expired: boolean }
  | { ok: false; reason: string };

const DAY = 86_400_000;

export function isValidIsoDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = new Date(d + "T00:00:00Z");
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}

/**
 * Validates one extracted item. Fetched text is data only: injection-like
 * content is flagged and routed to review, never executed or followed.
 */
export function validateItem(item: RawItem, src: SourceDef, fetchedAt: string): ItemCheck {
  if (!item || typeof item.title !== "string" || typeof item.url !== "string") return { ok: false, reason: "malformed_item" };
  const urlCheck = checkUrl(item.url, src);
  if (urlCheck.ok !== true) return { ok: false, reason: (urlCheck as { reason: string }).reason };
  const title = item.title.replace(/\s+/g, " ").trim();
  if (title.length < LIMITS.titleMin) return { ok: false, reason: "title_too_short" };
  if (title.length > LIMITS.titleMax) return { ok: false, reason: "title_too_long" };
  if (!isValidIsoDate(item.publishedDate)) return { ok: false, reason: "invalid_date" };
  const pub = new Date(item.publishedDate + "T00:00:00Z").getTime();
  const fetched = new Date(fetchedAt).getTime();
  if (pub > fetched + DAY) return { ok: false, reason: "future_date" };
  const body = typeof item.body === "string" ? item.body : "";
  if (body.trim().length === 0) return { ok: false, reason: "empty_body" };
  if (body.length > LIMITS.bodyMax) return { ok: false, reason: "body_too_long" };
  const injection = INJECTION.some((r) => r.test(title) || r.test(body));
  const expired = fetched - pub > LIMITS.maxAgeDays * DAY;
  return { ok: true, url: urlCheck.url, title, date: item.publishedDate, body, injection, expired };
}
