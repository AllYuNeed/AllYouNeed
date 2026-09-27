"use client";

import { useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";

type Props = { strength?: number; className?: string; children: React.ReactNode };

export function MagneticButton({ strength = 0.25, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const interactive = useInteractive();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 24 });
  const y = useSpring(my, { stiffness: 300, damping: 24 });

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <m.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={interactive ? { x, y } : undefined} className={className}>
      {children}
    </m.div>
  );
}
