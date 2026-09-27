"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

// Smooth scrolling is off on touch devices and under reduced motion.
const DISABLE_QUERY = "(hover: none), (prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DISABLE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSnapshot = () => !window.matchMedia(DISABLE_QUERY).matches;
const getServerSnapshot = () => false;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Lenis is a childless sibling so the children keep their tree position when it switches on after hydration;
  // wrapping them would remount the whole app. With `root`, ReactLenis still creates the instance and publishes
  // it to the root store (read by useLenis()) before it returns null for missing children.
  return (
    <>
      {enabled ? <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }} /> : null}
      {children}
    </>
  );
}
