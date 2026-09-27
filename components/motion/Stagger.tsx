"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { fadeUp, staggerContainer, viewport } from "@/lib/motion";

export function Stagger({ gap, className, children }: { gap?: number; className?: string; children: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <m.div className={className} variants={staggerContainer(gap)} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </m.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();
  if (reduce) return <div className={className} data-reveal>{children}</div>;
  return (
    <m.div className={className} variants={fadeUp} data-reveal>
      {children}
    </m.div>
  );
}
