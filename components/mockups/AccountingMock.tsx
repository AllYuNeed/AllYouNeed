"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";

const rows = [
  ["Sales — Meridian Foods", "INV-1042", "1,18,000", "Reconciled"],
  ["Purchase — Bluefin Exports", "PUR-388", "64,900", "Reconciled"],
  ["Payroll — August", "PAY-08", "18,92,400", "Posted"],
  ["GST payable — 3B", "GST-08", "2,14,760", "Ready"],
  ["Rent — Indiranagar office", "EXP-211", "1,85,000", "Reconciled"],
];

export function AccountingMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-text">Trial balance · September 2026</p>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Books balanced</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="text-text-muted">
            <tr className="border-b border-border">
              <th className="px-3 py-1.5 font-medium">Entry</th>
              <th className="hidden px-3 py-1.5 font-medium sm:table-cell">Voucher</th>
              <th className="px-3 py-1.5 text-right font-medium">Amount (₹)</th>
              {!compact ? <th className="px-3 py-1.5 font-medium">Status</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, compact ? 4 : rows.length).map((r, i) => (
              <m.tr
                key={r[1]}
                data-reveal
                className="border-b border-border/60 last:border-0"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              >
                <td className="px-3 py-1.5 text-text">{r[0]}</td>
                <td className="hidden px-3 py-1.5 font-mono text-text-muted sm:table-cell">{r[1]}</td>
                <td className="px-3 py-1.5 text-right font-medium text-text">{r[2]}</td>
                {!compact ? (
                  <td className="px-3 py-1.5">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", r[3] === "Reconciled" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-primary-soft text-primary-ink")}>{r[3]}</span>
                  </td>
                ) : null}
              </m.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
