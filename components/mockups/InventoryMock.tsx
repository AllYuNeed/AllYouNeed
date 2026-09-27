"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, viewport } from "@/lib/motion";

const items = [
  { sku: "TX-COT-42", name: "Cotton kurta, 42", stock: 184, max: 250, warehouse: "Bengaluru" },
  { sku: "TX-LIN-38", name: "Linen shirt, 38", stock: 22, max: 200, warehouse: "Hyderabad" },
  { sku: "TX-SLK-40", name: "Silk saree, plain", stock: 96, max: 120, warehouse: "Bengaluru" },
  { sku: "TX-DEN-32", name: "Denim, 32", stock: 8, max: 150, warehouse: "Chennai" },
];

export function InventoryMock({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-xs font-semibold text-text">Stock across 3 warehouses</p>
        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-[#854F0B] dark:text-accent">2 low stock</span>
      </div>
      <ul className="divide-y divide-border/60">
        {items.slice(0, compact ? 3 : 4).map((it, i) => {
          const pct = it.stock / it.max;
          const low = pct < 0.15;
          return (
            <m.li key={it.sku} data-reveal className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[11px]" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.5, ease, delay: i * 0.08 }}>
              <div>
                <p className="font-medium text-text">{it.name} <span className="font-mono text-text-muted">{it.sku}</span></p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <m.div data-reveal className={cn("h-full origin-left rounded-full", low ? "bg-red-500" : "bg-primary")} style={{ width: `${pct * 100}%` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={viewport} transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.08 }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text">{it.stock}</p>
                <p className="text-text-muted">{it.warehouse}</p>
              </div>
            </m.li>
          );
        })}
      </ul>
    </div>
  );
}
