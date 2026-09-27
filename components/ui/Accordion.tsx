"use client";

import { useState } from "react";
import { m } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type AccordionItem = { id: string; q: string; a: string };

export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  // Only answers the visitor opens fade in; the default-open one is already in its final state in the server HTML.
  const [touched, setTouched] = useState(false);
  const reduce = usePrefersReducedMotion();

  return (
    <div className={cn("divide-y divide-border rounded-2xl border border-border bg-background", className)}>
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={`${item.id}-trigger`}
                aria-expanded={expanded}
                aria-controls={`${item.id}-panel`}
                onClick={() => {
                  setTouched(true);
                  setOpen(expanded ? null : item.id);
                }}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-text transition-colors hover:text-primary"
              >
                {item.q}
                <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0 text-text-muted transition-transform duration-300", expanded && "rotate-180 text-primary")} />
              </button>
            </h3>
            {/* Every panel is always rendered: collapsed ones sit behind `hidden`, so aria-controls always resolves and
                the <noscript> stylesheet can show every answer when JS is off. The height snaps; only the content
                animates, with transform and opacity. */}
            <div id={`${item.id}-panel`} role="region" aria-labelledby={`${item.id}-trigger`} hidden={!expanded} data-accordion-panel>
              <m.p
                key={expanded ? "open" : "closed"}
                initial={touched && expanded && !reduce ? { opacity: 0, y: -6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease }}
                className="px-6 pb-6 text-text-muted"
              >
                {item.a}
              </m.p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
