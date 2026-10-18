import { createHash } from "node:crypto";
import { SOURCE_REGISTRY } from "../../src/lib/engine/registry";
import { isValidIsoDate } from "../../src/lib/engine/extract";
import { classifyRisk } from "../../src/lib/engine/risk";
import { templateSummary } from "../../src/lib/engine/pipeline";
import { fetchOfficial, officialLinks, type Wire } from "./http";

export type Rpc = (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Primary-page metadata only. No article body, description, script execution or model. */
export function parseMetadata(html: string, now: string): { title: string; date: string } {
  const entries: unknown[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data: unknown = JSON.parse(m[1]);
      if (Array.isArray(data)) entries.push(...data);
      else if (data && typeof data === "object" && "@graph" in data && Array.isArray(data["@graph"])) entries.push(...data["@graph"]);
      else entries.push(data);
    } catch { throw new Error("malformed_metadata"); }
  }
  const found = entries.filter((x): x is Record<string, unknown> => !!x && typeof x === "object" &&
    "@type" in x && ["NewsArticle", "Article", "PressRelease"].includes(String(x["@type"])));
  if (found.length !== 1) throw new Error("ambiguous_metadata");
  const record = found[0];
  if (!record || typeof record.headline !== "string" || typeof record.datePublished !== "string") throw new Error("missing_metadata");
  const title = record.headline.replace(/\s+/g, " ").trim();
  const date = record.datePublished.slice(0, 10);
  if (title.length < 8 || title.length > 200 || /[<>]/.test(title) || !isValidIsoDate(date)) throw new Error("invalid_metadata");
  const age = Date.parse(now) - Date.parse(date + "T00:00:00Z");
  if (!Number.isFinite(age) || age < -86400000 || age > 120 * 86400000) throw new Error("old_or_future_announcement");
  return { title, date };
}

async function call(rpc: Rpc, name: string, args: Record<string, unknown>) {
  const result = await rpc(name, args);
  if (result.error) throw new Error("rpc_refused");
  return result.data;
}

/** Not a handler. Caller must supply a server-only RPC client and explicit gate. */
export async function collectShadow(sourceId: string, deps: { authorized: boolean; rpc: Rpc; wire?: Wire; now: string }) {
  if (!deps.authorized) throw new Error("shadow_not_authorized");
  const src = SOURCE_REGISTRY.find(s => s.id === sourceId);
  if (!src) throw new Error("unknown_source");
  const run = await call(deps.rpc, "engine_begin_shadow_run", { _source_id: sourceId });
  if (typeof run !== "string") throw new Error("invalid_reservation");
  let outcome = "failed", snapshot: string | null = null, created = 0, requests = 0;
  try {
    requests++;
    const index = await fetchOfficial(sourceId, src.indexUrl, deps.wire);
    const links = officialLinks(sourceId, index.html);
    if (!links.length) throw new Error("no_supported_primary_links");
    const hashes: string[] = [];
    for (const link of links) {
      requests++;
      const page = await fetchOfficial(sourceId, link, deps.wire);
      const metadata = parseMetadata(page.html, deps.now);
      const hash = sha(`${page.url}|${metadata.title}|${metadata.date}`);
      hashes.push(hash);
      const risk = classifyRisk(metadata.title, "");
      const flags = ["metadata_only_primary", "hands_on_not_tested"];
      if (/ignore .*instructions|system prompt|publish .*automatically/i.test(metadata.title)) flags.push("injection_suspected");
      const result = await call(deps.rpc, "engine_record_revision", {
        _source_id: sourceId, _canonical_url: page.url, _content_hash: hash, _revision_of: null,
        _title: metadata.title, _published_date: metadata.date,
        _draft_summary: templateSummary(src.vendor, metadata.title, metadata.date),
        _risk: risk.risk, _risk_reasons: risk.reasons, _flags: flags, _contradictions: [],
        _source_checked_at: deps.now,
      });
      if (typeof result !== "string") throw new Error("invalid_revision_response");
      if (!result.startsWith("duplicate:")) created++;
    }
    snapshot = sha(hashes.join("\n")); outcome = created ? "changed" : "no_change";
  } catch { outcome = created ? "partial" : "failed"; }
  // Only fixed counters reach logs: no URLs, response text, credentials or raw errors.
  await call(deps.rpc, "engine_finish_shadow_run", {
    _run_id: run, _outcome: outcome, _snapshot: snapshot,
    _requests: requests, _created: created,
  });
  return { outcome, created, requests };
}