"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Menu } from "lucide-react";
import { mainNav } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const reduce = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  // The drawer remembers the path it was opened on, so any route change (a link, browser Back) closes it
  // without an effect: `open` is simply false once the pathname moves on.
  const [openOn, setOpenOn] = useState<string | null>(null);
  // Forget the old page once the route has moved on (React's adjust-state-during-render pattern), so history
  // returning to it (Back, then Forward) does not reopen the drawer.
  if (openOn !== null && openOn !== pathname) setOpenOn(null);
  const open = openOn === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(!open && y > 160 && y > prev);
  });

  const close = useCallback(() => setOpenOn(null), []);

  const isActive = (href: string) => pathname === href || pathname === href.replace(/\/$/, "");

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50"
        // Keyboard focus landing in the scrolled-away header brings it back; the next scroll-down hides it again.
        onFocusCapture={() => setHidden(false)}
        animate={{ y: hidden ? -96 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease }}
      >
        <Container>
          <div
            className={cn(
              "mt-3 flex origin-top items-center justify-between rounded-full border px-3 py-2.5 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4",
              scrolled ? "glass scale-[0.985] border-border shadow-soft" : "border-transparent"
            )}
          >
            <Logo href="/" />

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {mainNav.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors", active ? "text-primary-ink" : "text-text-muted hover:text-text")}
                  >
                    {active ? <m.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-primary-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} /> : null}
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login/" className="link-underline hidden px-2 text-sm font-medium text-text-muted hover:text-text sm:inline-block">
                Log in
              </Link>
              <MagneticButton className="hidden sm:block">
                <Button href="/register/" size="sm" arrow>Start free</Button>
              </MagneticButton>
              <button
                ref={menuButton}
                type="button"
                onClick={() => setOpenOn(pathname)}
                aria-label="Open menu"
                aria-expanded={open}
                className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </Container>
      </m.header>
      <MobileNav open={open} onClose={close} links={mainNav} returnFocusRef={menuButton} />
    </>
  );
}
