export const duration = { fast: 0.15, base: 0.3, slow: 0.6 } as const;

export const ease = [0.22, 1, 0.36, 1] as const;

export const spring = { type: "spring", stiffness: 300, damping: 24 } as const;

export const stagger = { sm: 0.06, md: 0.08 } as const;

export const viewport = { once: true, margin: "-10% 0px" } as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease } },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease } },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease } },
} as const;

export function staggerContainer(gap: number = stagger.md) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
  };
}
