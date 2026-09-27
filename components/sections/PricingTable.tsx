"use client";

import { useRef, useState } from "react";
import { m } from "motion/react";
import { Check } from "lucide-react";
import { plans } from "@/content/pricing";
import { priceFor, formatInr, type Billing } from "@/lib/pricing";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

const options: { id: Billing; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export function PricingTable() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  const onRadioKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    setBilling(options[next].id);
    radios.current[next]?.focus();
  };

  return (
    <Container>
      <div role="radiogroup" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1">
        {options.map((o, i) => {
          const on = billing === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} ref={(el) => { radios.current[i] = el; }} tabIndex={on ? 0 : -1} onClick={() => setBilling(o.id)} onKeyDown={(e) => onRadioKey(e, i)} className={cn("relative rounded-full px-5 py-2 text-sm font-semibold transition-colors", on ? "text-white" : "text-text-muted hover:text-text")}>
              {on ? <m.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-primary-solid" transition={spring} /> : null}
              <span className="relative z-10 flex items-center gap-2">
                {o.label}
                {o.id === "yearly" ? <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", on ? "bg-white text-primary-solid" : "bg-accent/20 text-[#854F0B] dark:text-accent")}>Save 20%</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      {/* The plan cards are h3s under the page h1; a visually hidden h2 keeps the outline from skipping a level. */}
      <h2 className="sr-only">Plans</h2>
      <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = priceFor(plan, billing);
          return (
            <StaggerItem key={plan.id} className="h-full">
              <div className={cn("h-full rounded-[1.35rem] p-px", plan.highlight ? "conic-border" : "bg-border")}>
                <article className={cn("relative flex h-full flex-col rounded-[1.3rem] bg-background p-6", plan.highlight && "shadow-lift")}>
                  {plan.highlight ? <Badge tone="accent" className="absolute -top-3 left-6">Most popular</Badge> : null}
                  <h3 className="font-display text-xl font-bold text-text">{plan.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{plan.users}</p>
                  <div className="mt-5 min-h-[4.5rem]">
                    {price.amount === null ? (
                      <p className="font-display text-4xl font-extrabold tracking-tight text-text">Custom</p>
                    ) : (
                      <p className="font-display text-4xl font-extrabold tracking-tight text-text">
                        <RollingNumber value={price.amount} format={formatInr} />
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">{price.note}</p>
                  </div>
                  <p className="mt-3 text-sm text-text-muted">{plan.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-sm text-text">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-ink"><Check aria-hidden="true" className="size-3" strokeWidth={3} /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="mt-8" strength={0.12}>
                    <Button href={plan.cta.href} variant={plan.highlight ? "primary" : "outline"} className="w-full" arrow={plan.highlight}>{plan.cta.label}</Button>
                  </MagneticButton>
                </article>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-6 text-center text-xs text-text-muted">Prices exclude GST. Yearly plans are billed upfront.</p>
    </Container>
  );
}
