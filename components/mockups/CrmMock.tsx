"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LayoutGroup, m, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

type Lead = { id: string; name: string; value: string; source: string };
const columns = ["New", "Qualified", "Proposal"] as const;
const initial: Record<(typeof columns)[number], Lead[]> = {
  New: [
    { id: "l1", name: "Kaveri Textiles", value: "₹2.4L", source: "Instagram" },
    { id: "l2", name: "Arka Dental Care", value: "₹86K", source: "Website" },
  ],
  Qualified: [{ id: "l3", name: "Nimbus Logistics", value: "₹5.1L", source: "Referral" }],
  Proposal: [{ id: "l4", name: "Suryodaya Schools", value: "₹3.7L", source: "Google" }],
};

export function CrmMock({ compact, className }: { compact?: boolean; className?: string }) {
  const groupId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = usePrefersReducedMotion();
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => {
      setBoard((b) => {
        const from = columns.find((c) => b[c].length > 0)!;
        const fromIdx = columns.indexOf(from);
        const to = columns[(fromIdx + 1) % columns.length];
        const [lead, ...rest] = b[from];
        return { ...b, [from]: rest, [to]: [...b[to], lead] };
      });
    }, 3200);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <LayoutGroup id={groupId}>
      <div ref={ref} className={cn("grid grid-cols-3 gap-2", className)}>
        {columns.map((col) => (
          <div key={col} className="min-w-0 rounded-xl border border-border bg-surface p-2">
            <p className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {col} <span className="rounded-full bg-background px-1.5 text-[9px]">{board[col].length}</span>
            </p>
            <div className={cn("mt-2 flex flex-col gap-1.5", compact ? "min-h-20" : "min-h-28")}>
              {board[col].map((lead) => (
                <m.div key={lead.id} layoutId={lead.id} layout transition={{ type: "spring", stiffness: 260, damping: 26 }} className="rounded-lg border border-border bg-background p-2 text-[10px] shadow-soft">
                  <p className="truncate font-semibold text-text">{lead.name}</p>
                  <p className="mt-0.5 flex justify-between gap-1 text-text-muted"><span className="truncate">{lead.source}</span><span className="shrink-0 font-medium text-primary">{lead.value}</span></p>
                </m.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
