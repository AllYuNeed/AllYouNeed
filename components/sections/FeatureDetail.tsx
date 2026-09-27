import { Check } from "lucide-react";
import type { Module } from "@/content/modules";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { MockupFor } from "@/components/mockups";
import { cn } from "@/lib/cn";

export function FeatureDetail({ module: mod, index }: { module: Module; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section id={mod.slug} aria-labelledby={`${mod.slug}-title`} className="scroll-mt-28 py-12 first:pt-0 lg:py-16">
      <div className={cn("grid items-center gap-10 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
        <div>
          <Reveal>
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-ink">
              <mod.icon aria-hidden="true" className="size-6" />
            </span>
            <h2 id={`${mod.slug}-title`} className="mt-5 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">{mod.name}</h2>
            <p className="mt-3 text-lg text-text-muted">{mod.description}</p>
          </Reveal>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {mod.bullets.map((b, i) => (
              <Reveal key={b} as="li" delay={0.05 * i}>
                <div className="flex gap-2.5 text-sm text-text">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                  {b}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal variant="scaleIn">
          <TiltCard max={5}>
            <div className="rounded-2xl border border-border bg-background p-4 shadow-lift">
              {mod.mockup === "none" ? (
                <div className="grid min-h-56 place-items-center rounded-xl bg-surface p-6">
                  <div className="text-center">
                    <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-[#7F77DD] text-white shadow-lift dark:from-primary-solid dark:to-[#4B43A6]"><mod.icon aria-hidden="true" className="size-9" /></span>
                    <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                      {(mod.chips ?? []).map((chip) => (
                        <span key={chip} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-text-muted">{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MockupFor kind={mod.mockup} compact />
              )}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
