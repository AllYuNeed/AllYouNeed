"use client";

import { Fragment } from "react";
import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Props = {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  delay?: number;
  highlightLast?: number; // number of trailing words to render with the brand gradient
};

export function SplitWords({ text, as: Tag = "h1", className, delay = 0, highlightLast = 0 }: Props) {
  const reduce = usePrefersReducedMotion();
  const words = text.split(" ");
  const firstHighlight = words.length - highlightLast;

  return (
    // Keyed on the preference: the server and hydration renders always see "no preference", so a reduced-motion
    // visitor needs a fresh mount (initial={false}) rather than words left fading in from their entrance state.
    <Tag key={reduce ? "still" : "anim"} aria-label={text} className={cn(className)}>
      {words.map((word, i) => {
        const highlighted = i >= firstHighlight;
        return (
          <Fragment key={i}>
            <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <m.span
                data-reveal
                className={cn("inline-block", highlighted && "text-gradient")}
                initial={reduce ? false : { opacity: 0, y: "60%", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease, delay: delay + i * 0.06 }}
              >
                {word}
              </m.span>
            </span>
            {/* The space must sit outside the inline-block, where trailing whitespace would collapse. */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
