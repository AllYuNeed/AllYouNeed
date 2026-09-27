"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { BrowserFrame, MockupFor } from "@/components/mockups";
import type { MockupKind } from "@/content/modules";
import { ease, spring } from "@/lib/motion";

const AUTOPLAY_MS = 6000;

const showcase: { id: string; label: string; kind: MockupKind; title: string; points: string[]; href: string }[] = [
  { id: "dashboard", label: "Dashboard", kind: "dashboard", title: "See the whole company at 9 am", points: ["Cash, receivables, payroll and pipeline on one screen", "Drill from any KPI to the voucher behind it", "Filing calendar with live status"], href: "/features/#reports" },
  { id: "accounting", label: "Accounting", kind: "accounting", title: "Books that balance themselves", points: ["Every module posts to the ledger automatically", "Bank reconciliation with rule-based matching", "GST-ready P&L, balance sheet and cash flow"], href: "/features/#accounting" },
  { id: "inventory", label: "Inventory", kind: "inventory", title: "Stock across every location", points: ["Batch, serial and expiry tracking", "Reorder alerts before you run out", "Valuation and HSN summaries for GST"], href: "/features/#inventory" },
  { id: "pos", label: "POS Billing", kind: "pos", title: "Bill fast, file automatically", points: ["Touch-friendly counter with barcode scanning", "UPI, card and cash with split payments", "Every bill lands in accounting and GSTR-1"], href: "/features/#inventory" },
  { id: "crm", label: "CRM & Leads", kind: "crm", title: "Every lead, owned and followed up", points: ["Leads from WhatsApp, Instagram and your website", "Kanban pipeline with rotting alerts", "Quotes that convert to invoices"], href: "/features/#crm" },
];

export function ModuleShowcase() {
  const [active, setActive] = useState(showcase[0].id);
  const [paused, setPaused] = useState(false);
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const autoplay = !paused && !reduce && inView;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => {
      setActive((cur) => showcase[(showcase.findIndex((s) => s.id === cur) + 1) % showcase.length].id);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, autoplay]);

  const current = showcase.find((s) => s.id === active)!;

  return (
    // overflow-x-clip contains the panel's x:+32 entrance at 375px without creating a scroll container.
    <Section id="showcase" tone="surface" className="overflow-x-clip">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="One login" title="Every department, one screen away" lead="Switch between modules the way your team does during a day. The data underneath never changes hands." />
        </Reveal>
        <div ref={ref} className="mt-12" onMouseEnter={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
          <div className="mx-auto w-fit max-w-full overflow-x-auto">
            <Tabs
              tabs={showcase.map((s) => ({ id: s.id, label: s.label }))}
              value={active}
              onChange={(id) => {
                setPaused(true);
                setActive(id);
              }}
              ariaLabel="Modules"
              indicator={
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <m.span layoutId="showcase-pill" className="absolute inset-0 rounded-full bg-primary-solid" transition={spring} />
                  {autoplay ? <m.span key={active} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white/70" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} /> : null}
                </span>
              }
            />
          </div>

          {/* Keyed on the preference so both panels remount with initial={false} (no exit/enter) once a reduced-motion
              preference resolves after hydration; the server and hydration renders always see "no preference". */}
          <div key={reduce ? "still" : "anim"} className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
            <AnimatePresence mode="wait">
              <m.div key={current.id + "-copy"} data-reveal initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
                <h3 className="font-display text-2xl font-bold text-text sm:text-3xl">{current.title}</h3>
                <ul className="mt-6 space-y-3">
                  {current.points.map((p) => (
                    <li key={p} className="flex gap-3 text-text-muted">
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink">
                        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Button href={current.href} variant="ghost" arrow className="mt-6 -ml-4">Explore {current.label}</Button>
              </m.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                role="tabpanel"
                id={`${current.id}-panel`}
                aria-labelledby={`${current.id}-tab`}
                tabIndex={0}
                data-reveal
                initial={reduce ? false : { opacity: 0, x: 32, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -32, scale: 0.98 }}
                transition={{ duration: 0.45, ease }}
              >
                <BrowserFrame url={`app.allyouneed.in/${current.id}`}>
                  <MockupFor kind={current.kind} />
                </BrowserFrame>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
