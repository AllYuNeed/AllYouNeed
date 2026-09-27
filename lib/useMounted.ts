import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Hydration-safe "mounted" flag without a state setter in an effect: `false` on the server and during the
 * hydration render, `true` in the immediate post-hydration re-render (and on any plain client render).
 */
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
