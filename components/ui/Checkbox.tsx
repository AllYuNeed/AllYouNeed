import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox({ className, label, id, ...props }, ref) {
  return (
    <label htmlFor={id} className={cn("group inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary-ink hover:border-primary/50", className)}>
      <input ref={ref} id={id} type="checkbox" className="size-4 accent-[var(--primary)]" {...props} />
      {label}
    </label>
  );
});
