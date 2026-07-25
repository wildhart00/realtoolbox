import { useEffect } from "react";

const SITE_ORIGIN = "https://realtoolbox.ai";

/**
 * Sets document title, meta description, and an optional canonical URL.
 *
 * The canonical link is removed on unmount rather than left behind. Most pages
 * still set their meta inline and declare no canonical, so a persistent tag
 * would leak the last-visited page's canonical onto every route after it —
 * worse than having none at all.
 *
 * `canonicalPath` is a site-relative path ("/for-agents").
 */
export function useSeo({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description: string;
  canonicalPath?: string;
}) {
  useEffect(() => {
    document.title = title;

    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute("content", description);

    if (!canonicalPath) return;

    const href = SITE_ORIGIN + canonicalPath;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);

    return () => {
      // Only clear it if nothing else has claimed it since. Mount/unmount order
      // isn't guaranteed across a route change, so an unconditional remove can
      // strip the canonical the *incoming* page just set.
      const current = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (current?.getAttribute("href") === href) current.remove();
    };
  }, [title, description, canonicalPath]);
}
