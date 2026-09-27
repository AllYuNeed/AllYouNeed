import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

// Hydration-stable: the server and the hydration render both see `false`; the real value arrives in the
// immediate post-hydration re-render. motion's own useReducedMotion() reads matchMedia during the first
// client render, which hydrates markup that differs from the server's.
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
