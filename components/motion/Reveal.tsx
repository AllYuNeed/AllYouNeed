"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { fadeUp, fadeIn, scaleIn, viewport } from "@/lib/motion";
import { cn } from "@/lib/cn";

const variantsMap = { fadeUp, fadeIn, scaleIn };

type Props = {
  as?: "div" | "section" | "li" | "article" | "span";
  variant?: keyof typeof variantsMap;
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ as = "div", variant = "fadeUp", delay = 0, className, children }: Props) {
  const reduce = usePrefersReducedMotion();
  const Comp = m[as];

  if (reduce) {
    const Plain = as;
    return (
      <Plain data-reveal className={className}>
        {children}
      </Plain>
    );
  }

  const v = variantsMap[variant];
  return (
    <Comp
      data-reveal
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ hidden: v.hidden, show: { ...v.show, transition: { ...v.show.transition, delay } } }}
    >
      {children}
    </Comp>
  );
}
