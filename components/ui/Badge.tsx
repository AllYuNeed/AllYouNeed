import { cn } from "@/lib/cn";

type Tone = "primary" | "accent" | "neutral" | "success";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-ink",
  accent: "bg-accent/15 text-[#854F0B] dark:text-accent",
  neutral: "bg-surface text-text-muted border border-border",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function Badge({ tone = "primary", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
