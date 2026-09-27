"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: string };

type Props = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  indicator?: React.ReactNode; // rendered inside the active tab (e.g. a layoutId pill)
  className?: string;
  tabClassName?: string;
};

export function Tabs({ tabs, value, onChange, ariaLabel, indicator, className, tabClassName }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      Home: () => select(0),
      End: () => select(tabs.length - 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("relative flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1", className)}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${t.id}-tab`}
            type="button"
            aria-selected={active}
            // Only the selected tab's panel is rendered, so only it is referenced.
            aria-controls={active ? `${t.id}-panel` : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative isolate rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
              active ? "text-white" : "text-text-muted hover:text-text",
              tabClassName
            )}
          >
            {active ? indicator : null}
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
