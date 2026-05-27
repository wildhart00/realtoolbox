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

/** Logo with Clearbit → Google favicon → initial fallback. */
export function ToolLogo({ domain, name, size = 40, customUrl, className = "" }: ToolLogoProps) {
  const resolvedDomain = domain ?? domainFromUrl(customUrl ?? null);
  const sources = [
    customUrl ?? null,
    resolvedDomain ? `https://logo.clearbit.com/${resolvedDomain}` : null,
    resolvedDomain ? `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128` : null,
  ].filter(Boolean) as string[];

  const [idx, setIdx] = useState(0);
  const radius = size > 50 ? 14 : 10;
  const padding = idx === 0 && customUrl ? "0%" : idx === sources.length - 1 ? "12%" : "0%";

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center bg-foreground/[0.06] border border-foreground/[0.07] ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {idx < sources.length ? (
        <img
          src={sources[idx]}
          alt={`${name} logo`}
          className="object-contain transition-opacity"
          style={{ width: `calc(100% - ${padding})`, height: `calc(100% - ${padding})` }}
          onError={() => setIdx((i) => i + 1)}
          loading="lazy"
        />
      ) : (
        <span
          className="font-bold text-muted-foreground font-sans"
          style={{ fontSize: size * 0.4 }}
        >
          {name[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export { domainFromUrl };
