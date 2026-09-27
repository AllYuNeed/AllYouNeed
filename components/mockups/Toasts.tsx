"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export function Toasts({ messages, interval = 3800, className }: { messages: string[]; interval?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = usePrefersReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), interval);
    return () => clearInterval(t);
  }, [inView, reduce, interval, messages.length]);

  return (
    // Decorative sample chrome: the messages are fictional, so they are hidden from assistive tech rather than
    // announced as if they were real account activity.
    <div ref={ref} className={cn("pointer-events-none absolute right-3 top-3 z-20", className)} aria-hidden="true">
      {/* Keyed on the preference (not the ref'd wrapper, which useInView observes) so a reduced-motion visitor gets
          a fresh toast mounted with initial={false} after hydration instead of the entrance fade. */}
      <AnimatePresence key={reduce ? "still" : "anim"} mode="wait">
        <m.div
          key={i}
          data-reveal
          initial={reduce ? false : { opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={spring}
          className="flex items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs font-medium text-text shadow-lift backdrop-blur"
        >
          <CircleCheck aria-hidden="true" className="size-4 text-emerald-500" />
          {messages[i]}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
