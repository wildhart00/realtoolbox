import { SOURCE_REGISTRY, checkUrl } from "../../src/lib/engine/registry";
import { canonicalizeUrl } from "../../src/lib/engine/canonical";
import { HTTP_LIMITS, pinnedHttps, type Wire } from "./transport.ts";
export { HTTP_LIMITS, pinnedHttps, publicAddress, type Wire } from "./transport.ts";

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