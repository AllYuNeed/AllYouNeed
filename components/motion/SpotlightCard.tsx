"use client";

import { useRef } from "react";
import Link from "next/link";
import { m, useMotionValue, useSpring } from "motion/react";
import { useInteractive } from "@/lib/useInteractive";
import { cn } from "@/lib/cn";

type Props = { id?: string; className?: string; as?: "div" | "article" | "li" | "a"; href?: string; children: React.ReactNode };

const MAX_TILT = 3; // degrees at the card's edge
// Critically damped (TiltCard's stiffness, more damping) so the spring never overshoots MAX_TILT.
const tiltSpring = { stiffness: 200, damping: 30 };
const MotionLink = m.create(Link);
const tags = { div: m.div, article: m.article, li: m.li, a: MotionLink };
// Perspective only while tilted: at rest the card keeps `transform: none` rather than a 3D transform.
const withPerspective = (_: unknown, generated: string) => (generated ? `perspective(900px) ${generated}` : "none");
const clamp = (n: number) => Math.min(0.5, Math.max(-0.5, n));

export function SpotlightCard({ id, className, as = "div", href, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const interactive = useInteractive();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, tiltSpring);
  const rotateY = useSpring(ry, tiltSpring);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
    // No tilt on touch devices or under reduced motion (useInteractive), only the spotlight.
    if (!interactive || !r.width || !r.height) return;
    rx.set(-clamp((e.clientY - r.top) / r.height - 0.5) * MAX_TILT * 2);
    ry.set(clamp((e.clientX - r.left) / r.width - 0.5) * MAX_TILT * 2);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const Tag = tags[as] as React.ElementType;
  return (
    <Tag
      ref={ref}
      id={id}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={interactive ? { rotateX, rotateY } : undefined}
      transformTemplate={interactive ? withPerspective : undefined}
      className={cn(
        // `translate` (the hover lift), not `transform`, is transitioned: motion drives the tilt's transform per frame.
        "group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-soft transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 hover:shadow-lift [--x:50%] [--y:50%]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), color-mix(in srgb, var(--primary) 16%, transparent), transparent 60%)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
        style={{ background: "radial-gradient(300px circle at var(--x) var(--y), var(--primary), transparent 70%)" }}
      />
      <span className="relative z-10 block">{children}</span>
    </Tag>
  );
}
