import { useEffect, useRef, useState } from "react";

/**
 * Returns `active` = true only when:
 *  - the observed element is on-screen (IntersectionObserver, threshold ~10%)
 *  - the document/tab is visible
 *  - the user has NOT requested prefers-reduced-motion
 *
 * Attach the returned `ref` to the element that owns the animation. Use `active`
 * to toggle `animationPlayState` (running/paused) so decorative loops stop
 * consuming the compositor/main-thread when nobody can see them.
 */
export function useAnimationActive<T extends HTMLElement = HTMLDivElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const active = visible && tabVisible && !reduced;
  return { ref, active } as const;
}
