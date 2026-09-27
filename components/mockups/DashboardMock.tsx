"use client";

import { m } from "motion/react";
import { TrendingUp } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Toasts } from "./Toasts";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const kpis = [
  { label: "Cash in bank", value: 42.6, prefix: "₹", suffix: "L", decimals: 1, delta: "+8.2%" },
  { label: "Receivables due", value: 11.3, prefix: "₹", suffix: "L", decimals: 1, delta: "-3.1%" },
  { label: "Payroll this month", value: 18.9, prefix: "₹", suffix: "L", decimals: 1, delta: "+2 hires" },
  { label: "Open leads", value: 128, prefix: "", suffix: "", decimals: 0, delta: "+14 today" },
];

const bars = [42, 58, 51, 74, 66, 88, 79, 95, 84, 102, 97, 118];
const months = ["A", "M", "J", "J", "A", "S", "O", "N", "D", "J", "F", "M"];

// Collections over the last 30 days, sampled every other day: a line chart that draws itself (pathLength).
const collections = [9, 11, 10, 13, 12, 15, 14, 17, 16, 18, 20, 19, 22, 21, 24, 26];
const SPARK_W = 160;
const SPARK_H = 28;
const sparkPath = (() => {
  const lo = Math.min(...collections);
  const hi = Math.max(...collections);
  return collections
    .map((v, i) => {
      const x = +((i / (collections.length - 1)) * SPARK_W).toFixed(1);
      const y = +(SPARK_H - 2 - ((v - lo) / (hi - lo)) * (SPARK_H - 4)).toFixed(1);
      return `${i ? "L" : "M"}${x} ${y}`;
    })
    .join(" ");
})();

export function DashboardMock({ compact, className }: { compact?: boolean; className?: string }) {
  const reduce = usePrefersReducedMotion();
  return (
    <div className={cn("relative", className)}>
      <Toasts messages={["Invoice #1042 paid · ₹1,18,000", "GSTR-3B filed for August", "Payroll run approved · 46 employees", "New lead from Instagram: Kaveri Textiles"]} />
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] font-medium text-text-muted">{k.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-text">
              <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} />
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-300">
              <TrendingUp aria-hidden="true" className="size-3" /> {k.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text">Revenue, last 12 months</p>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary-ink">FY 2026–27</span>
          </div>
          <div className={cn("mt-3 flex items-end gap-1.5", compact ? "h-20" : "h-28")}>
            {bars.map((b, i) => (
              <m.div
                key={i}
                data-reveal
                className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-primary to-[#7F77DD]"
                style={{ height: `${(b / 120) * 100}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={viewport}
                transition={{ duration: 0.7, ease, delay: i * 0.05 }}
              />
            ))}
          </div>
          <div className="mt-1 flex gap-1.5 text-[9px] text-text-muted">
            {months.map((mo, i) => (
              <span key={i} className="flex-1 text-center">{mo}</span>
            ))}
          </div>
          <div data-sparkline className="mt-3 border-t border-border pt-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-medium text-text-muted">Collections, last 30 days</p>
              <p className="text-[11px] font-semibold text-text">₹18.4L</p>
            </div>
            <svg aria-hidden="true" viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" className="mt-1.5 block h-7 w-full overflow-visible">
              {/* Keyed on the preference so a reduced-motion visitor gets a freshly mounted, fully drawn line after
                  hydration (initial={false}); the server and the hydration render always see "no preference". */}
              <m.path
                key={reduce ? "still" : "draw"}
                data-reveal
                d={sparkPath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease, delay: 0.4 }}
              />
            </svg>
          </div>
        </div>
        {!compact ? (
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-text">Filing calendar</p>
            <ul className="mt-2 space-y-1.5 text-[11px]">
              {[["11 Sep", "GSTR-1", "Filed"], ["20 Sep", "GSTR-3B", "Ready"], ["30 Sep", "PT Karnataka", "Due"]].map(([d, t, s]) => (
                <li key={t} className="flex items-center justify-between rounded-lg bg-surface px-2 py-1.5">
                  <span className="text-text-muted">{d}</span>
                  <span className="font-medium text-text">{t}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", s === "Filed" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : s === "Ready" ? "bg-primary-soft text-primary-ink" : "bg-accent/20 text-[#854F0B] dark:text-accent")}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
