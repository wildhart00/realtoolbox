import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll on navigation — and honours a hash when there is one.
 *
 * Without the hash branch, cross-page anchor links (/how-it-works#why-these-are-
 * different, /toolbox#pricing) navigate correctly and then get scrolled straight
 * back to the top. The rAF defers the lookup until after the new route has
 * painted, so the target element exists.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
