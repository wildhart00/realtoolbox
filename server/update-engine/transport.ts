import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";

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

