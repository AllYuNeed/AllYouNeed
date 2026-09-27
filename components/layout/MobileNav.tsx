"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import type { NavLink } from "@/content/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { ease } from "@/lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  /** The control that opened the drawer; it gets focus back when the drawer closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav({ open, onClose, links, returnFocusRef }: Props) {
  const drawer = useRef<HTMLDivElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap: Tab / Shift+Tab wrap between the drawer's first and last controls (aria-modal alone moves nothing).
      if (e.key !== "Tab" || !drawer.current) return;
      const focusables = [...drawer.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && drawer.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const opener = returnFocusRef?.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  // Lenis scrolls the window from script, which the body overflow lock does not stop, so pause it while open.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <m.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-[#0B1020]/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.div
            key="drawer"
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            // Lenis is stopped while open and would preventDefault every wheel event; this makes it bail out first so
            // the drawer's own overflow scrolls (overscroll-contain keeps the page behind still).
            data-lenis-prevent
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col overflow-y-auto overscroll-contain bg-background p-6 shadow-lift lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between">
              <Logo href="/" onClick={onClose} />
              <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full border border-border">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
              {links.map((l, i) => (
                <m.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05, ease }}>
                  <Link ref={i === 0 ? firstLink : undefined} href={l.href} onClick={onClose} className="block rounded-xl px-3 py-3 text-lg font-medium text-text hover:bg-primary-soft hover:text-primary-ink">
                    {l.label}
                  </Link>
                </m.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <Button href="/login/" variant="outline" onClick={onClose}>Log in</Button>
              <Button href="/register/" arrow onClick={onClose}>Start free</Button>
            </div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
