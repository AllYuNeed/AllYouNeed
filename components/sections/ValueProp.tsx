"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Database, RefreshCw, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { LogoMark } from "@/components/brand/LogoMark";
import { modules } from "@/content/modules";
import { ease, viewport } from "@/lib/motion";

const points = [
  { icon: Database, title: "One database", body: "Sales, payroll, stock and books share the same records. Nothing is exported, imported or re-keyed." },
  { icon: RefreshCw, title: "Instant sync", body: "Approve a salary and the ledger, the TDS register and the cash-flow forecast update together." },
  { icon: ShieldCheck, title: "Always audit-ready", body: "Every change is logged with who, when and why — the trail your auditor and the Companies Act expect." },
];

const ring = modules.slice(0, 8);
const R = 150;

export function ValueProp() {
  const reduce = usePrefersReducedMotion();
  return (
    <Section>
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Not just an ERP" title={<>Your whole business. <span className="text-gradient">In one OS.</span></>} lead="Most tools bolt departments together with exports and integrations. Allyouneed starts from a single source of truth, so duplicate entry simply doesn't exist." />
            </Reveal>
            <ul className="mt-10 space-y-6">
              {points.map((p, i) => (
                <Reveal key={p.title} as="li" delay={i * 0.1}>
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-ink">
                      <p.icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text">{p.title}</h3>
                      <p className="mt-1 text-text-muted">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal variant="scaleIn" className="relative mx-auto aspect-square w-full max-w-md">
            <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle r={R} fill="none" stroke="var(--border)" strokeDasharray="4 8" />
              {ring.map((_, i) => {
                const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <m.line
                    key={i}
                    data-reveal
                    x1={0}
                    y1={0}
                    x2={Math.cos(a) * R}
                    y2={Math.sin(a) * R}
                    stroke="var(--primary)"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={viewport}
                    transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.08 }}
                  />
                );
              })}
            </svg>
            <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-border bg-background shadow-lift">
              <LogoMark size={48} title="" />
              {!reduce ? <span className="absolute inset-0 -z-10 animate-ping rounded-3xl bg-primary/20 [animation-duration:3s]" /> : null}
            </div>
            {ring.map((mod, i) => {
              const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + (Math.cos(a) * R) / 4;
              const y = 50 + (Math.sin(a) * R) / 4;
              return (
                <m.div
                  key={mod.slug}
                  data-reveal
                  className="absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-border bg-background text-primary shadow-soft"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={mod.name}
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.5 + i * 0.08 }}
                >
                  <mod.icon aria-hidden="true" className="size-5" />
                  <span className="sr-only">{mod.name}</span>
                </m.div>
              );
            })}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
