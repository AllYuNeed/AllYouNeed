"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ease } from "@/lib/motion";

type Props = { size?: number; delay?: number; className?: string };

const tiles = [
  { x: 2, y: 2, rx: 6, fill: "#534AB7", from: { x: -40, y: -40 } },
  { x: 26, y: 2, rx: 6, fill: "#7F77DD", from: { x: 40, y: -40 } },
  { x: 2, y: 26, rx: 6, fill: "#7F77DD", from: { x: -40, y: 40 } },
];

// Motion treats `x`/`y` on SVG elements as translate transforms, so the static rect
// attributes live on a plain <rect> and each tile is animated through a wrapping <m.g>.
const groupStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

export function AnimatedLogo({ size = 96, delay = 0, className }: Props) {
  const reduce = usePrefersReducedMotion();

  return (
    // Keyed on the preference so a reduced-motion visitor gets a fresh mount with initial={false} after hydration;
    // the server and hydration renders always see "no preference" and would otherwise play the entrance.
    <svg key={reduce ? "still" : "anim"} viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true" data-reveal>
      {tiles.map((t, i) => (
        <m.g
          key={i}
          initial={reduce ? false : { opacity: 0, x: t.from.x, y: t.from.y, rotate: -12 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease, delay: delay + i * 0.12 }}
          style={groupStyle}
          data-reveal
        >
          <rect x={t.x} y={t.y} width={20} height={20} rx={t.rx} fill={t.fill} />
        </m.g>
      ))}
      <m.g
        initial={reduce ? false : { opacity: 0, scale: 0.2, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 18, delay: delay + 0.5 }}
        style={groupStyle}
        data-reveal
      >
        <rect x={26} y={26} width={20} height={20} rx={10} fill="#EF9F27" />
      </m.g>
    </svg>
  );
}
