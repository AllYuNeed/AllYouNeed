"use client";

import { useMemo } from "react";
import { m } from "motion/react";
import { useActiveSection } from "@/lib/useActiveSection";
import { cn } from "@/lib/cn";

export function FeatureSideNav({ items }: { items: { id: string; label: string }[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);

  return (
    <nav aria-label="On this page" className="sticky top-28 hidden self-start lg:block">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Modules</p>
      <ul className="mt-3 space-y-0.5 border-l border-border">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id} className="relative">
              {on ? <m.span layoutId="feature-nav-active" className="absolute -left-px top-0 h-full w-0.5 bg-primary" transition={{ type: "spring", stiffness: 400, damping: 30 }} /> : null}
              <a href={`#${it.id}`} aria-current={on ? "location" : undefined} className={cn("block px-4 py-1.5 text-sm transition-colors", on ? "font-semibold text-primary" : "text-text-muted hover:text-text")}>
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
