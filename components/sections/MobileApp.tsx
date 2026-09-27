"use client";

import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Check, Smartphone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneFrame, DashboardMock, PosMock } from "@/components/mockups";

const bullets = ["Approve leave, expenses and payroll on the go", "Geo-fenced attendance for field teams", "Bill customers and share UPI links from the counter", "Follow up leads with WhatsApp in one tap", "Founder dashboard in light or dark mode"];

export function MobileApp() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-30, 90]);
  const r1 = useTransform(scrollYProgress, [0, 1], [-4, 3]);
  const r2 = useTransform(scrollYProgress, [0, 1], [5, -4]);

  return (
    <Section id="mobile">
      <Container>
        <div ref={ref} className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Mobile app" title="Run the business from your phone" lead="The same modules, the same data, sized for a screen you already carry. Light or dark — your choice." />
            </Reveal>
            <ul className="mt-8 space-y-3">
              {bullets.map((b, i) => (
                <Reveal key={b} as="li" delay={i * 0.06}>
                  <div className="flex gap-3 text-text-muted">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                    {b}
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
              <Badge tone="neutral" className="px-4 py-2 text-sm"><Smartphone aria-hidden="true" className="size-4" /> Android · Coming soon</Badge>
              <Badge tone="neutral" className="px-4 py-2 text-sm"><Smartphone aria-hidden="true" className="size-4" /> iOS · Coming soon</Badge>
            </Reveal>
          </div>
          <div className="relative mx-auto flex h-[560px] w-full max-w-md items-center justify-center">
            <m.div style={reduce ? { y: 0, rotate: 0 } : { y: y1, rotate: r1 }} className="absolute left-0 top-6 z-10">
              <PhoneFrame tone="light">
                <p className="text-xs font-semibold">Good morning, Rhea</p>
                <div className="mt-3"><DashboardMock compact /></div>
              </PhoneFrame>
            </m.div>
            <m.div style={reduce ? { y: 0, rotate: 0 } : { y: y2, rotate: r2 }} className="absolute right-0 top-24 z-20">
              <PhoneFrame tone="dark">
                <p className="text-xs font-semibold">Counter 2</p>
                <div className="mt-3"><PosMock compact /></div>
              </PhoneFrame>
            </m.div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
