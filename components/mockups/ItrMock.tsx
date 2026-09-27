"use client";

import { m } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring, viewport } from "@/lib/motion";

const fields = [
  ["PAN", "ABCPK1234F"],
  ["Employer", "Meridian Foods Pvt Ltd"],
  ["Gross salary (Form 16)", "₹14,20,000"],
  ["80C deductions", "₹1,50,000"],
  ["TDS deducted", "₹1,02,400"],
  ["Refund due", "₹6,800"],
];

export function ItrMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("relative rounded-xl border border-border p-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text">ITR-1 · AY 2026–27</p>
        <m.span data-reveal initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={viewport} transition={{ ...spring, delay: 0.9 }} className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          Filed in 4 minutes
        </m.span>
      </div>
      <ul className="mt-2 divide-y divide-border/60 text-[11px]">
        {fields.slice(0, compact ? 4 : 6).map(([k, v], i) => (
          <li key={k} className="flex items-center justify-between py-1.5">
            <span className="text-text-muted">{k}</span>
            <span className="flex items-center gap-1.5 font-medium text-text">
              {v}
              <m.span data-reveal initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={viewport} transition={{ ...spring, delay: 0.15 + i * 0.12 }} className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                <Check aria-hidden="true" className="size-2.5" strokeWidth={3} />
              </m.span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-text-muted">Pre-filled from payroll and Form 16. Review, e-verify with Aadhaar OTP, done.</p>
    </div>
  );
}
