"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

type Props = { speed?: number; pauseOnHover?: boolean; className?: string; children: React.ReactNode };

export function Marquee({ speed = 40, pauseOnHover = true, className, children }: Props) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <div className={cn("flex flex-wrap justify-center gap-x-10 gap-y-4", className)}>{children}</div>;
  }

  return (
    <div className={cn("group relative overflow-hidden mask-fade-x", className)}>
      <div
        className={cn("flex w-max animate-marquee gap-10 pr-10", pauseOnHover && "group-hover:[animation-play-state:paused]")}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
