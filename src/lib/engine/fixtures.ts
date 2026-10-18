/**
 * SYNTHETIC FIXTURES — invented test data shaped like official release pages.
 * Titles and bodies are fabricated for testing and must never be shown as real news.
 */
import type { FetchResult, RawItem, SourceDef } from "./types";
import { SOURCE_REGISTRY } from "./registry";

export const FIXTURE_NOW = "2026-10-18T15:00:00Z";

export const fixtureSource = (id: "realtor-mediaroom" | "appfolio-newsroom"): SourceDef => ({
  ...SOURCE_REGISTRY.find((s) => s.id === id)!,
  enabled: true, // enabled only inside the simulation
});

export const realtorItem = (n: number, over: Partial<RawItem> = {}): RawItem => ({
  url: `https://mediaroom.realtor.com/2026-10-0${(n % 9) + 1}-Synthetic-Release-${n}`,
  title: `[SYNTHETIC] Example agent workspace note ${n}`,
  publishedDate: `2026-10-0${(n % 9) + 1}`,
  body: `Synthetic fixture body ${n}. This text is invented for tests and describes an example workflow note for agents.`,
  ...over,
});

export const appfolioItem = (n: number, over: Partial<RawItem> = {}): RawItem => ({
  url: `https://www.appfolio.com/newsroom/synthetic-release-${n}`,
  title: `[SYNTHETIC] Example operations note ${n}`,
  publishedDate: `2026-09-${String(10 + (n % 18)).padStart(2, "0")}`,
  body: `Synthetic fixture body ${n}. Invented text describing an example maintenance workflow note.`,
  ...over,
});

export const ok = (finalUrl: string, items: RawItem[], fetchedAt = FIXTURE_NOW): FetchResult => ({
  status: "ok", finalUrl, fetchedAt, items,
});

export const REALTOR_INDEX = "https://mediaroom.realtor.com/news-releases";
export const APPFOLIO_INDEX = "https://www.appfolio.com/newsroom";
