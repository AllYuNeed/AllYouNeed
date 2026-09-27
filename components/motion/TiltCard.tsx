"use client";

import { useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";

type Props = { max?: number; className?: string; children: React.ReactNode };

export function TiltCard({ max = 8, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const interactive = useInteractive();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 });
  // A compositor-layer hint only while the pointer is over a card that can tilt, not for the page's lifetime.
  const willChange = useMotionValue("auto");

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * max * 2);
    ry.set(px * max * 2);
  };

  const onEnter = () => {
    if (interactive) willChange.set("transform");
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    willChange.set("auto");
  };

  return (
    <div className="perspective">
      <m.div
        ref={ref}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={interactive ? { rotateX, rotateY, transformStyle: "preserve-3d", willChange } : undefined}
        className={className}
      >
        {children}
      </m.div>
    </div>
  );
}
