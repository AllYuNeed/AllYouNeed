"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { spring, viewport } from "@/lib/motion";

const cart = [
  { name: "Cotton kurta, 42", qty: 2, price: 1499 },
  { name: "Linen shirt, 38", qty: 1, price: 2199 },
  { name: "Silk saree, plain", qty: 1, price: 4899 },
];

export function PosMock({ compact, className }: { compact?: boolean; className?: string }) {
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return (
    <div className={cn("rounded-xl border border-border p-3", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text">Counter 2 · Bill #2331</p>
          <p className="mt-0.5 text-[10px] tabular-nums text-text-muted">GSTIN 29ABCDE1234F1Z5</p>
        </div>
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary-ink">Walk-in</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {cart.slice(0, compact ? 2 : 3).map((c, i) => (
          <m.li key={c.name} data-reveal className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5 text-[11px]" initial={{ opacity: 0, scale: 0.96, x: 10 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} viewport={viewport} transition={{ ...spring, delay: i * 0.1 }}>
            <span className="text-text">{c.name} <span className="text-text-muted">× {c.qty}</span></span>
            <span className="font-medium text-text">₹{fmt(c.qty * c.price)}</span>
          </m.li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-[11px]">
        <div className="flex justify-between text-text-muted"><dt>Subtotal</dt><dd>₹{fmt(subtotal)}</dd></div>
        <div className="flex justify-between text-text-muted"><dt>GST 18% (CGST 9% + SGST 9%)</dt><dd>₹{fmt(gst)}</dd></div>
        <div className="flex justify-between border-t border-border pt-1 font-display text-sm font-bold text-text"><dt>Total</dt><dd>₹{fmt(total)}</dd></div>
      </dl>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-semibold">
        <span className="rounded-lg bg-primary-solid py-1.5 text-center text-white">UPI</span>
        <span className="rounded-lg border border-border py-1.5 text-center text-text">Card</span>
        <span className="rounded-lg border border-border py-1.5 text-center text-text">Cash</span>
      </div>
    </div>
  );
}
