import { cn } from "@/lib/cn";

export function BrowserFrame({ url = "app.allyouneed.in", className, children }: { url?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-background shadow-lift", className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-center text-xs text-text-muted">{url}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
