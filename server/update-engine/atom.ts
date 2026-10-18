import { DOMParser, type Element } from "@xmldom/xmldom";
import { createHash } from "node:crypto";
import { HTTP_LIMITS, pinnedHttps, type Wire } from "./http";
import { isValidIsoDate } from "../../src/lib/engine/extract";

export const ATOM_SOURCE_PROPOSAL = {
  id: "google-workspace-atom", enabled: false,
  feedUrl: "https://feeds.feedburner.com/GoogleAppsUpdates",
  fetchHost: "feeds.feedburner.com", fetchPath: "/GoogleAppsUpdates",
  outputHost: "workspaceupdates.googleblog.com",
} as const;
const NS = "http://www.w3.org/2005/Atom";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const children = (e: Element, name: string) => Array.from(e.childNodes).filter(
  (n): n is Element => n.nodeType === 1 && n.namespaceURI === NS && n.localName === name,
);
function scalar(e: Element, name: string): string {
  const nodes = children(e, name);
  const node = nodes[0];
  if (nodes.length !== 1 || !node || Array.from(node.childNodes).some(n => n.nodeType === 1)) throw new Error("invalid_atom_field");
  return (node.textContent ?? "").trim();
}
function timestamp(raw: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(raw) || !isValidIsoDate(raw.slice(0,10))) throw new Error("invalid_atom_date");
  const value = Date.parse(raw);
  if (!Number.isFinite(value)) throw new Error("invalid_atom_date");
  return value;
}
function outputLink(entry: Element): string {
  const links = children(entry,"link").filter(e => !e.getAttribute("rel") || e.getAttribute("rel") === "alternate");
  if (links.length !== 1) throw new Error("ambiguous_alternate");
  const raw = links[0]?.getAttribute("href") ?? "";
  if (/[\\\s]|%2e|%2f|%5c/i.test(raw)) throw new Error("unsafe_output_link");
  const u = new URL(raw);
  if (u.protocol !== "https:" || u.hostname !== ATOM_SOURCE_PROPOSAL.outputHost || u.username || u.password || u.port || u.search || u.hash) throw new Error("unsafe_output_link");
  return u.href;
}
export interface AtomMetadata {
  id: string; title: string; published: string; updated: string; alternateLink: string;
  contentHash: string; chronology: "recent_publication" | "background"; updatedSeparately: boolean;
}
/** XML content/summary is ignored, never copied or treated as instructions. */
export function parseAtom(xml: string, now: string, knownHashes: ReadonlySet<string> = new Set()): AtomMetadata[] {
  if (Buffer.byteLength(xml) > HTTP_LIMITS.bytes || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("unsafe_xml");
  const doc = new DOMParser({ onError: () => { throw new Error("malformed_xml"); } }).parseFromString(xml,"application/xml");
  const root = doc.documentElement;
  if (!root || root.namespaceURI !== NS || root.localName !== "feed") throw new Error("not_atom");
  const nowMs = Date.parse(now); if (!Number.isFinite(nowMs)) throw new Error("invalid_clock");
  const parsed: AtomMetadata[] = [];
  const entries = children(root,"entry");
  if (entries.length > 100) throw new Error("entry_limit");
  for (const entry of entries) {
    try {
      const id = scalar(entry,"id"), title = scalar(entry,"title").replace(/\s+/g," ");
      const published = scalar(entry,"published"), updated = scalar(entry,"updated");
      const p = timestamp(published), u = timestamp(updated);
      if (!id || id.length > 1000 || title.length < 8 || title.length > 200 || /[<>]/.test(title) || u < p || p > nowMs || u > nowMs) throw new Error("invalid_metadata");
      const alternateLink = outputLink(entry);
      const contentHash = hash(JSON.stringify([id,title,published,updated,alternateLink]));
      if (knownHashes.has(contentHash)) continue;
      parsed.push({id,title,published,updated,alternateLink,contentHash,
        chronology: nowMs-p > 30*86400000 ? "background" : "recent_publication", updatedSeparately:u>p});
    } catch { /* Invalid individual metadata/link is rejected, never repaired or fetched. */ }
  }
  parsed.sort((a,b) => timestamp(b.published)-timestamp(a.published) || a.id.localeCompare(b.id));
  const ids = new Set<string>(), links = new Set<string>();
  return parsed.filter(e => { if(ids.has(e.id)||links.has(e.alternateLink))return false;ids.add(e.id);links.add(e.alternateLink);return true; }).slice(0,2);
}

/** Exact feed only, no redirects (especially no original atom.xml HTTP redirect). */
export async function fetchAtom(wire: Wire = pinnedHttps): Promise<string> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_,reject) => { timer=setTimeout(()=>{controller.abort();reject(new Error("timeout"));},HTTP_LIMITS.timeoutMs); });
  try {
    const response = await Promise.race([wire(new URL(ATOM_SOURCE_PROPOSAL.feedUrl),controller.signal),deadline]);
    if (response.status !== 200) throw new Error("feed_http_or_redirect_denied");
    if (!/^(?:text\/xml|application\/(?:xml|atom\+xml))(?:;|$)/i.test(response.headers["content-type"] ?? "") ||
      ![undefined,"identity"].includes(response.headers["content-encoding"])) throw new Error("unsupported_feed_content");
    if (Buffer.byteLength(response.body)>HTTP_LIMITS.bytes) throw new Error("byte_limit");
    return response.body;
  } finally { if(timer)clearTimeout(timer);controller.abort(); }
}

/** Prepared RPC arguments ONLY: no RPC calls, publication, article fetch or inference. */
export function atomDrafts(xml: string, now: string, knownHashes?: ReadonlySet<string>) {
  return parseAtom(xml,now,knownHashes).map(e => ({ metadata:e, rpcArguments:{
    _source_id:ATOM_SOURCE_PROPOSAL.id, _canonical_url:e.alternateLink, _content_hash:e.contentHash,
    _revision_of:null, _title:e.title, _published_date:e.published.slice(0,10),
    _draft_summary:`Workspace feed metadata dated ${e.published}: "${e.title}". Feed updated: ${e.updated}. Manual review required; not hands-on tested.`,
    _risk:"high", _risk_reasons:[], _flags:["feed_metadata_only","manual_review_required","hands_on_not_tested",...(e.chronology==="background"?["old_publication_not_new"]:[])],
    _contradictions:[], _source_checked_at:now,
  }}));
}