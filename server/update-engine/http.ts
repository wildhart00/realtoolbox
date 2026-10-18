import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
import { SOURCE_REGISTRY, checkUrl } from "../../src/lib/engine/registry";
import { canonicalizeUrl } from "../../src/lib/engine/canonical";

export const HTTP_LIMITS = { timeoutMs: 8000, bytes: 512 * 1024, redirects: 2, details: 2 } as const;
export type WireResponse = { status: number; headers: Record<string, string>; body: string };
export type Wire = (url: URL, signal: AbortSignal) => Promise<WireResponse>;

/** Conservative IPv4-only transport: IPv6 and all special-use ranges fail closed. */
export function publicAddress(ip: string): boolean {
  if (isIP(ip) !== 4) return false;
  const [a, b, c] = ip.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 2))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

/** DNS is validated then pinned into the TLS request; no second unvalidated lookup. */
export const pinnedHttps: Wire = async (url, signal) => {
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error("unsafe_dns");
  const address = addresses[0];
  if (!address || signal.aborted) throw new Error("timeout");
  return new Promise((resolve, reject) => {
    const req = request(url, {
      signal, method: "GET", agent: false,
      headers: { "User-Agent": "RealToolbox-Shadow/0.1", Accept: "text/html, application/atom+xml, application/xml, text/xml", "Accept-Encoding": "identity" },
      lookup: (_host, _opts, cb) => cb(null, address.address, address.family),
    }, res => {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.headers)) if (typeof v === "string") headers[k] = v;
      const chunks: Buffer[] = []; let bytes = 0;
      res.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > HTTP_LIMITS.bytes) { res.destroy(new Error("byte_limit")); return; }
        chunks.push(chunk);
      });
      res.on("error", reject);
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject); req.end();
  });
};

function permitted(sourceId: string, raw: string): URL {
  const src = SOURCE_REGISTRY.find(s => s.id === sourceId);
  if (!src) throw new Error("unknown_source");
  if (/[\\\s]|%2f|%5c|%2e/i.test(raw)) throw new Error("ambiguous_url");
  const c = checkUrl(raw, src, raw !== src.indexUrl);
  if (!c.ok || c.url.search || c.url.hash) throw new Error("url_not_permitted");
  return c.url;
}

export async function fetchOfficial(sourceId: string, raw: string, wire: Wire = pinnedHttps): Promise<{ url: string; html: string }> {
  let url = permitted(sourceId, raw);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error("timeout")); }, HTTP_LIMITS.timeoutMs);
  });
  try {
    const work = async () => {
      for (let redirects = 0; ; redirects++) {
        const response = await wire(url, controller.signal);
        if (Buffer.byteLength(response.body) > HTTP_LIMITS.bytes) throw new Error("byte_limit");
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          if (redirects >= HTTP_LIMITS.redirects || !response.headers.location) throw new Error("redirect_limit");
          url = permitted(sourceId, new URL(response.headers.location, url).href); continue;
        }
        if (response.status !== 200) throw new Error("http_status");
        if (!/^text\/html(?:;|$)/i.test(response.headers["content-type"] ?? "") ||
          ![undefined, "identity"].includes(response.headers["content-encoding"])) throw new Error("unsupported_content");
        return { url: canonicalizeUrl(url), html: response.body };
      }
    };
    return await Promise.race([work(), deadline]);
  } finally { if (timer) clearTimeout(timer); controller.abort(); }
}

export function officialLinks(sourceId: string, html: string): string[] {
  const src = SOURCE_REGISTRY.find(s => s.id === sourceId);
  if (!src) throw new Error("unknown_source");
  const urls = new Set<string>();
  // Only quoted anchor hrefs; fetched HTML never executes. No search-result input.
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gi)) {
    try {
      const u = new URL(match[2], src.indexUrl).href;
      const accepted = permitted(sourceId, u);
      if (accepted.href !== src.indexUrl) urls.add(accepted.href);
    } catch { /* unvetted and malformed links are ignored */ }
  }
  return [...urls].sort().slice(0, HTTP_LIMITS.details);
}