"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { CircleCheck, IndianRupee, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { SplitWords } from "@/components/motion/SplitWords";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { AuroraBackground } from "@/components/motion/AuroraBackground";
import { CursorSpotlight } from "@/components/motion/CursorSpotlight";
import { BrowserFrame, DashboardMock } from "@/components/mockups";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const chips = [
  { icon: CircleCheck, text: "GSTR-3B filed", className: "-left-6 top-10 lg:-left-12", z: 60, delay: 1.1, duration: 5 },
  { icon: IndianRupee, text: "₹4.2L collected today", className: "-right-3 top-1/3 2xl:-right-10", z: 90, delay: 1.3, duration: 6 },
  { icon: Users, text: "12 new leads", className: "-left-2 bottom-8 lg:-left-8", z: 40, delay: 1.5, duration: 7 },
];

export function Hero() {
  const reduce = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-20">
      <AuroraBackground />
      <CursorSpotlight />
      <Container>
        {/* Keyed on the preference: the server and hydration renders always see "no preference", so this remounts
            the copy and mock columns with initial={false} once a reduced-motion preference resolves. */}
        <div key={reduce ? "still" : "anim"} className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <AnimatedLogo size={72} />
            <m.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease }} data-reveal className="mt-6">
              <Badge tone="primary">
                <Sparkles aria-hidden="true" className="size-3.5" /> The business OS for India
              </Badge>
            </m.div>
            <SplitWords
              as="h1"
              text="Everything your business runs on. One OS."
              highlightLast={2}
              delay={0.6}
              className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl xl:text-7xl"
            />
            <m.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6, ease }} data-reveal className="mt-6 max-w-xl text-lg text-text-muted sm:text-xl">
              HR, payroll, accounting, CRM, inventory, projects and GST filing on one platform. Enter a fact once — a sale, a salary, a stock receipt — and every department, report and return follows.
            </m.p>
            <m.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: 0.6, ease }} data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton>
                <Button href="/register/" size="lg" arrow>Start free</Button>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <Button href="/contact/" size="lg" variant="outline">Book a demo</Button>
              </MagneticButton>
            </m.div>
            <m.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} data-reveal className="mt-5 text-sm text-text-muted">
              Free for up to 5 users · No card needed · GST-ready in a day
            </m.p>
          </div>

          <m.div
            initial={reduce ? false : { opacity: 0, y: 48, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease }}
            data-reveal
            className="relative mx-auto w-full max-w-xl perspective lg:max-w-none"
          >
            <TiltCard max={7} className="relative">
              <BrowserFrame url="app.allyouneed.in/dashboard">
                <DashboardMock />
              </BrowserFrame>
              {chips.map((c, i) => (
                <m.div
                  key={c.text}
                  aria-hidden="true"
                  data-reveal
                  className={cn("absolute hidden items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-text shadow-lift backdrop-blur sm:flex", c.className)}
                  style={{ z: c.z }}
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
                  transition={reduce ? undefined : { opacity: { delay: c.delay, duration: 0.4 }, scale: { delay: c.delay, duration: 0.4 }, y: { delay: c.delay + i * 0.3, duration: c.duration, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <c.icon aria-hidden="true" className="size-4 text-primary" />
                  {c.text}
                </m.div>
              ))}
            </TiltCard>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
