"use client";

import { useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { spring } from "@/lib/motion";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const reduce = usePrefersReducedMotion();
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > window.innerHeight));

  const toTop = () => {
    if (lenis && !reduce) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show ? (
        <m.button
          key="top"
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={spring}
          className="fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-border bg-background/80 text-text shadow-lift backdrop-blur transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
