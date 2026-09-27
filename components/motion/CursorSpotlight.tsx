"use client";

import { useEffect } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";

// Diameter of the pre-rendered glow. It is painted once; only transform and opacity change per frame.
const SIZE = 1200;

export function CursorSpotlight() {
  const interactive = useInteractive();
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const sx = useSpring(x, { stiffness: 120, damping: 24 });
  const sy = useSpring(y, { stiffness: 120, damping: 24 });
  const opacity = useMotionValue(0);

  useEffect(() => {
    if (!interactive) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
      opacity.set(1);
    };
    const leave = () => opacity.set(0);
    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [interactive, x, y, opacity]);

  if (!interactive) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <m.div
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          x: sx,
          y: sy,
          opacity,
          width: SIZE,
          height: SIZE,
          background: "radial-gradient(circle closest-side, color-mix(in srgb, var(--primary) 10%, transparent), transparent)",
        }}
      />
    </div>
  );
}
