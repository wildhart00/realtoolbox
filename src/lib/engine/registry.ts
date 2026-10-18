import type { SourceDef } from "./types";

/** Initial allowlist: official release pages only. Disabled until approved. */
export const SOURCE_REGISTRY: SourceDef[] = [
  {
    id: "realtor-mediaroom",
    vendor: "Realtor.com",
    kind: "press_release_index",
    indexUrl: "https://mediaroom.realtor.com/news-releases",
    allowedHosts: ["mediaroom.realtor.com"],
    allowedPathPrefixes: ["/20"],
    enabled: false,
    cadenceHours: 24,
    staleAfterHours: 72,
  },
  {
    id: "appfolio-newsroom",
    vendor: "AppFolio",
    kind: "press_release_index",
    indexUrl: "https://www.appfolio.com/newsroom",
    allowedHosts: ["www.appfolio.com"],
    allowedPathPrefixes: ["/newsroom/"],
    enabled: false,
    cadenceHours: 24,
    staleAfterHours: 72,
  },
];

const PRIVATE_V4 = [
  /^10\./, /^127\./, /^0\./, /^169\.254\./, /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
];

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Rejects anything that is not an https URL on an exact allowlisted host. */
export function checkUrl(raw: string, src: SourceDef, requirePathPrefix = true): UrlCheck {
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, reason: "invalid_url" }; }
  if (u.protocol !== "https:") return { ok: false, reason: "not_https" };
  if (u.username || u.password) return { ok: false, reason: "credentials_in_url" };
  if (u.port && u.port !== "443") return { ok: false, reason: "non_default_port" };
  const host = u.hostname.toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return { ok: false, reason: PRIVATE_V4.some((r) => r.test(host)) ? "private_ip" : "ip_literal" };
  }
  if (host.startsWith("[") || host.includes(":")) return { ok: false, reason: "ip_literal" };
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "private_host" };
  }
  if (!src.allowedHosts.includes(host)) return { ok: false, reason: "host_not_allowlisted" };
  if (requirePathPrefix && !src.allowedPathPrefixes.some((p) => u.pathname.startsWith(p))) {
    return { ok: false, reason: "path_not_allowlisted" };
  }
  return { ok: true, url: u };
}

export function getSource(id: string): SourceDef | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}
