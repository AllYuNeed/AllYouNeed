"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ease } from "@/lib/motion";

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string };

export function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = usePrefersReducedMotion();

  // Server HTML shows the real value (readable without JS). With JS, start from 0 before paint so the count-up can play.
  // The hydration commit always sees reduce=false (hydration-stable hook), so it zeroes the text; when the
  // post-hydration re-render reports reduced motion, write the final value back since no count will run.
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = `${prefix}${(reduce ? value : 0).toFixed(decimals)}${suffix}`;
  }, [reduce, value, prefix, decimals, suffix]);

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease,
      onUpdate: (v) => {
        // Written straight to the DOM (no React state) so a 60fps count never re-renders.
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}
