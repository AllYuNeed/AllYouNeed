"use client";

import { useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(HOVER_QUERY).matches;
const getServerSnapshot = () => false;

/** True only on devices with a hover pointer and no reduced-motion preference. False during SSR. */
export function useInteractive() {
  const hover = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduce = usePrefersReducedMotion();
  return hover && !reduce;
}
