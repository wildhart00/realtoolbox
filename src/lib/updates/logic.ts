import type { AudienceChoice, UpdateRecord } from "./seed";

export const RECENT_WINDOW_DAYS = 30;
export const STALE_AFTER_DAYS = 90;
const DAY = 86_400_000;

export function daysBetween(fromIso: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(fromIso).getTime()) / DAY);
}

export function matchesAudience(u: UpdateRecord, choice: AudienceChoice): boolean {
  return choice === "both" || u.audience.includes(choice);
}

/** Recent = event date within the last 30 days of `now`. Everything else is background. */
export function isRecent(u: UpdateRecord, now: Date): boolean {
  const d = daysBetween(u.event_date, now);
  return d >= 0 && d <= RECENT_WINDOW_DAYS;
}

/** Stale = source check older than 90 days. A fresh check is not an availability guarantee. */
export function isStale(checkedAtIso: string, now: Date): boolean {
  return daysBetween(checkedAtIso, now) > STALE_AFTER_DAYS;
}

export function splitUpdates(list: UpdateRecord[], choice: AudienceChoice, now: Date) {
  const filtered = list
    .filter((u) => matchesAudience(u, choice))
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
  return {
    recent: filtered.filter((u) => isRecent(u, now)),
    background: filtered.filter((u) => !isRecent(u, now)),
  };
}
