"use client";

import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { workflowSteps } from "@/content/workflow";
import { cn } from "@/lib/cn";

export function AiWorkflow() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(reduce ? workflowSteps.length : 0);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(workflowSteps.length, Math.floor(v * workflowSteps.length + 0.35)));
  });

  // Explicit final values (not undefined) so motion rewrites the transform it drew during hydration.
  const lineStyle = reduce ? { scaleX: 1, scaleY: 1 } : { scaleX: progress, scaleY: progress };

  return (
    <Section tone="surface" id="workflow">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Record once. Everything else follows." lead="Four things happen every time someone in your company does their job. You only do the first one." />
        </Reveal>
        <ol ref={ref} className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden="true" className="absolute left-6 top-0 h-full w-px bg-border lg:left-0 lg:top-6 lg:h-px lg:w-full" />
          <m.div aria-hidden="true" style={lineStyle} className="absolute left-6 top-0 h-full w-px origin-top bg-gradient-to-b from-primary to-accent lg:left-0 lg:top-6 lg:h-px lg:w-full lg:origin-left lg:bg-gradient-to-r" />
          {workflowSteps.map((s, i) => {
            const on = reduce || i < active;
            return (
              <li key={s.title} className="relative pl-16 lg:pl-0 lg:pt-16">
                <m.span
                  animate={{ scale: on ? 1 : 0.85 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn("absolute left-0 top-0 grid size-12 place-items-center rounded-full border-2 transition-colors duration-500 lg:left-0 lg:top-0", on ? "border-primary-solid bg-primary-solid text-white shadow-lift" : "border-border bg-background text-text-muted")}
                >
                  <s.icon aria-hidden="true" className="size-5" />
                </m.span>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step {i + 1}</p>
                <h3 className={cn("mt-1 font-display text-xl font-bold transition-colors duration-500", on ? "text-text" : "text-text-muted")}>{s.title}</h3>
                <p className="mt-2 text-text-muted">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
