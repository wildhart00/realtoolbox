import { useState } from "react";

interface ToolLogoProps {
  domain?: string | null;
  name: string;
  size?: number;
  customUrl?: string | null;
  className?: string;
}

function domainFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Detect URLs that are likely low-quality favicons we should skip in favor of Clearbit/apple-touch-icon. */
function looksLikeFavicon(url: string): boolean {
  const u = url.toLowerCase();
  if (u.endsWith(".ico")) return true;
  if (u.includes("favicon")) return true;
  // common small-size hints
  if (/[?&](sz|size)=(\d+)/.test(u)) {
    const m = u.match(/[?&](?:sz|size)=(\d+)/);
    if (m && parseInt(m[1], 10) <= 48) return true;
  }
  return false;
}

/**
 * Logo with smart fallback chain:
 * customUrl (if not a small favicon) → Clearbit → apple-touch-icon → Google favicon → letter.
 * Renders on a light tile so dark/transparent brand marks pop on the dark cards.
 */
export function ToolLogo({ domain, name, size = 40, customUrl, className = "" }: ToolLogoProps) {
  const resolvedDomain = domain ?? domainFromUrl(customUrl ?? null);
  const usableCustom = customUrl && !looksLikeFavicon(customUrl) ? customUrl : null;

  const sources = [
    usableCustom,
    resolvedDomain ? `https://logo.clearbit.com/${resolvedDomain}` : null,
    resolvedDomain ? `https://${resolvedDomain}/apple-touch-icon.png` : null,
    resolvedDomain ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128` : null,
  ].filter(Boolean) as string[];

  const [idx, setIdx] = useState(0);
  const radius = size > 50 ? 14 : 10;

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {idx < sources.length ? (
        <img
          src={sources[idx]}
          alt={`${name} logo`}
          className="object-contain"
          style={{ width: "82%", height: "82%" }}
          onError={() => setIdx((i) => i + 1)}
          loading="lazy"
        />
      ) : (
        <span
          className="font-bold text-foreground/70 font-sans"
          style={{ fontSize: size * 0.4 }}
        >
          {name[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export { domainFromUrl };
