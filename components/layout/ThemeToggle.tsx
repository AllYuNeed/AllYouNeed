"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useMounted } from "@/lib/useMounted";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

// Feature-detected: browsers without the View Transitions API just switch.
type DocWithVT = { startViewTransition?: Document["startViewTransition"] };

type Choice = "system" | "light" | "dark";
const nextChoice: Record<Choice, Choice> = { system: "light", light: "dark", dark: "system" };
const icons = { system: Monitor, light: Sun, dark: Moon };

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = usePrefersReducedMotion();

  // `theme` is the stored choice (system/light/dark); `resolvedTheme` is what the page actually shows.
  const current: Choice = theme === "light" || theme === "dark" ? theme : "system";
  const next = nextChoice[current];
  const Icon = icons[current];

  const toggle = () => {
    const doc = document as DocWithVT;
    const os = systemTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nextResolved = next === "system" ? os : next;
    // The circular reveal only makes sense when the colours actually change (system -> light on a light OS does not).
    if (nextResolved === resolvedTheme || !doc.startViewTransition || reduce || !ref.current) {
      setTheme(next);
      return;
    }
    const r = ref.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    // A quick second activation (a held Enter key auto-repeats) skips this transition, which rejects `ready`
    // (and `finished`). The theme still switches, so the rejection is expected and must not go unhandled.
    transition.finished.catch(() => {});
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
  };

  if (!mounted) {
    return <span aria-hidden="true" className={cn("inline-block size-10 rounded-full border border-border", className)} />;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${current}. Switch to ${next} theme`}
      className={cn(
        "relative grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-background/60 text-text transition-colors hover:border-primary hover:text-primary",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={current}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="grid place-items-center"
        >
          <Icon aria-hidden="true" className="size-[18px]" />
        </m.span>
      </AnimatePresence>
    </button>
  );
}
