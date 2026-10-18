const TRACKING = /^(utm_|fbclid$|gclid$|mc_|ref$|_hs)/i;

/** Lowercase host, strip fragment, tracking params, trailing slash; sort params. */
export function canonicalizeUrl(u: URL): string {
  const c = new URL(u.toString());
  c.hash = "";
  c.hostname = c.hostname.toLowerCase();
  const keep = [...c.searchParams.entries()].filter(([k]) => !TRACKING.test(k)).sort(([a], [b]) => a.localeCompare(b));
  c.search = "";
  keep.forEach(([k, v]) => c.searchParams.append(k, v));
  if (c.pathname.length > 1 && c.pathname.endsWith("/")) c.pathname = c.pathname.slice(0, -1);
  return c.toString();
}

/** Normalize text so cosmetic whitespace/case/quote changes don't count as changes. */
export function canonicalizeText(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** FNV-1a 64-bit, hex. Deterministic and synchronous; for change detection, not security. */
export function hashText(s: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < s.length; i++) {
    h ^= BigInt(s.charCodeAt(i));
    h = (h * prime) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

export function contentHash(title: string, date: string, body: string): string {
  return hashText(`${canonicalizeText(title)}|${date}|${canonicalizeText(body)}`);
}

/** Longest shared run of words between two texts (copyright guard). */
export function longestSharedWordRun(a: string, b: string): number {
  const wa = canonicalizeText(a).split(" ");
  const wb = canonicalizeText(b).split(" ");
  let best = 0;
  const prev = new Array(wb.length + 1).fill(0);
  for (let i = 1; i <= wa.length; i++) {
    let diag = 0;
    for (let j = 1; j <= wb.length; j++) {
      const tmp = prev[j];
      prev[j] = wa[i - 1] === wb[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) best = prev[j];
      diag = tmp;
    }
  }
  return best;
}
