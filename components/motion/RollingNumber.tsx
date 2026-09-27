"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

type Props = { value: number; format?: (n: number) => string; className?: string };

const digits = Array.from({ length: 10 }, (_, i) => i);

export function RollingNumber({ value, format = (n) => String(n), className }: Props) {
  const reduce = usePrefersReducedMotion();
  const text = format(value);

  if (reduce) {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex overflow-hidden leading-none", className)}>
      <span className="sr-only">{text}</span>
      {text.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={`${i}-${ch}`} aria-hidden="true" className="inline-block">
              {ch}
            </span>
          );
        }
        const d = Number(ch);
        return (
          <span key={`${i}-col`} aria-hidden="true" className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <m.span
              initial={false}
              className="absolute left-0 top-0 flex flex-col items-center"
              animate={{ y: `-${d}em` }}
              transition={{ ...spring, stiffness: 220, damping: 26 }}
            >
              {digits.map((n) => (
                <span key={n} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </m.span>
          </span>
        );
      })}
    </span>
  );
}
