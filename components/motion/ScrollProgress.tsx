"use client";

import { m, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = usePrefersReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gradient-to-r from-primary to-accent"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}
