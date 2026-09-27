"use client";

import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { journey } from "@/content/journey";
import { cn } from "@/lib/cn";

export function JourneyTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(reduce ? journey.length : 0);
  useMotionValueEvent(progress, "change", (v) => setActive(Math.min(journey.length, Math.floor(v * journey.length + 0.5))));

  return (
    <Section tone="surface" id="journey">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="From incorporation to year end" title="Incorporation to year end, on one timeline" lead="Whether you're registering a new company or moving an established one, the same platform carries you through every stage." />
        </Reveal>
        <ol ref={ref} className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden="true" className="absolute left-[11px] top-0 h-full w-0.5 bg-border lg:left-0 lg:top-[11px] lg:h-0.5 lg:w-full" />
          <m.div aria-hidden="true" style={reduce ? { scaleX: 1, scaleY: 1 } : { scaleX: progress, scaleY: progress }} className="absolute left-[11px] top-0 h-full w-0.5 origin-top bg-primary lg:left-0 lg:top-[11px] lg:h-0.5 lg:w-full lg:origin-left" />
          {journey.map((mstone, i) => {
            const on = reduce || i < active;
            return (
              <li key={mstone.title} className="relative pl-10 lg:pl-0 lg:pt-10">
                <m.span
                  aria-hidden="true"
                  animate={on && !reduce ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className={cn("absolute left-0 top-0 size-6 rounded-full border-4 border-background transition-colors duration-500", on ? "bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_25%,transparent)]" : "bg-border")}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{mstone.when}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-text">{mstone.title}</h3>
                <p className="mt-2 text-text-muted">{mstone.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
