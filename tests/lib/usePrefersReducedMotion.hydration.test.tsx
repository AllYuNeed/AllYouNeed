import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { JourneyTimeline } from "@/components/sections/JourneyTimeline";
import { AiWorkflow } from "@/components/sections/AiWorkflow";
import { MobileApp } from "@/components/sections/MobileApp";
import { Hero } from "@/components/sections/Hero";
import { ModuleShowcase } from "@/components/sections/ModuleShowcase";
import { SplitWords } from "@/components/motion/SplitWords";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";

// The static export is rendered without a reduced-motion preference; the visitor's browser then reports one.
// This fake matchMedia lets the test flip that answer and notifies listeners the way a real MediaQueryList does,
// so any library that cached the value during the server render sees the visitor's setting before hydration.
let reduce = false;
const listeners = new Set<() => void>();
const originalMatchMedia = window.matchMedia;

function fakeMatchMedia(query: string) {
  return {
    get matches() {
      return query.includes("prefers-reduced-motion") ? reduce : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

function setReduce(value: boolean) {
  reduce = value;
  for (const cb of [...listeners]) cb();
}

let consoleError: MockInstance<typeof console.error>;
let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  window.matchMedia = fakeMatchMedia;
  setReduce(false);
  consoleError = vi.spyOn(console, "error");
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container?.remove();
  container = null;
  // Listeners are kept: a library may subscribe once per module lifetime (motion does) and must keep hearing changes.
  setReduce(false);
  window.matchMedia = originalMatchMedia;
  consoleError.mockRestore();
});

/** Server-render with no preference, then hydrate that HTML in a browser that prefers reduced motion. */
async function hydrateUnderReducedMotion(ui: ReactElement) {
  const html = renderToString(<MotionProvider>{ui}</MotionProvider>);
  container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  setReduce(true);
  const recoverable: unknown[] = [];
  await act(async () => {
    root = hydrateRoot(container!, <MotionProvider>{ui}</MotionProvider>, {
      onRecoverableError: (error) => recoverable.push(error),
    });
  });
  return { container, recoverable };
}

function hiddenInlineStyles(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLElement>("[style]")]
    .map((node) => node.getAttribute("style") ?? "")
    .filter((style) => /opacity:\s*0(?![.\d])/.test(style));
}

/**
 * Inline styles still in (or part-way through) an entrance: opacity below 1, or a non-zero blur (the settled filter
 * is blur(0px)). Checking "below 1" rather than "exactly 0" also catches a short fade that jsdom's real-time frame
 * loop has already started by the time the assertion runs.
 */
function entranceInlineStyles(el: HTMLElement) {
  return [...el.querySelectorAll<Element>("[style]")]
    .map((node) => node.getAttribute("style") ?? "")
    .filter((style) => {
      const opacity = /opacity:\s*([\d.]+)/.exec(style);
      return (opacity !== null && Number(opacity[1]) < 1) || /blur\((?!0(?:px)?\))/.test(style);
    });
}

function hydrationWarnings() {
  return consoleError.mock.calls.map((args) => args.map(String).join(" ")).filter((msg) => /hydrat|didn't match/i.test(msg));
}

describe("reduced-motion decision is stable across SSR and hydration", () => {
  test("Reveal content is visible after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(
      <Reveal>
        <p>Reveal body</p>
      </Reveal>
    );
    expect(recoverable.map(String)).toEqual([]);
    expect(container.querySelector("[data-reveal]")).toHaveTextContent("Reveal body");
    expect(hiddenInlineStyles(container)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
  });

  test("StaggerItem content is visible after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(
      <Stagger>
        <StaggerItem>One</StaggerItem>
        <StaggerItem>Two</StaggerItem>
      </Stagger>
    );
    expect(recoverable.map(String)).toEqual([]);
    expect(container.querySelectorAll("[data-reveal]")).toHaveLength(2);
    expect(hiddenInlineStyles(container)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
  });

  test("RollingNumber hydrates without errors, then shows the plain reduced-motion value", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<RollingNumber value={1499} />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container).toHaveTextContent(/^1499$/);
    // The rolling digit columns are gone once the reduced-motion preference applies.
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  test("Marquee hydrates without errors, then shows the static wrapped list", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(
      <Marquee>
        <span>Acme</span>
      </Marquee>
    );
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container.querySelector(".animate-marquee")).toBeNull();
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  test("JourneyTimeline milestones are lit and the progress line is drawn after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<JourneyTimeline />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    const dots = [...container.querySelectorAll<HTMLElement>("ol > li > span[aria-hidden]")];
    expect(dots.length).toBeGreaterThan(0);
    for (const dot of dots) expect(dot).toHaveClass("bg-primary");
    const line = container.querySelector<HTMLElement>("ol > div.bg-primary")!;
    expect(line.getAttribute("style") ?? "").not.toMatch(/scale[XY]?\(0\)/);
  });

  test("AiWorkflow steps are lit and the progress line is drawn after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<AiWorkflow />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    const steps = [...container.querySelectorAll<HTMLElement>("ol > li > span")];
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) expect(step).toHaveClass("bg-primary-solid");
    const line = container.querySelector<HTMLElement>("ol > div.from-primary")!;
    expect(line.getAttribute("style") ?? "").not.toMatch(/scale[XY]?\(0\)/);
  });

  test("CountUp shows its final value, not the zeroed start, after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<CountUp value={40} suffix="K+" />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container).toHaveTextContent(/^40K\+$/);
  });

  test("SplitWords and AnimatedLogo render settled, not mid-entrance, after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(
      <>
        <AnimatedLogo />
        <SplitWords as="h1" text="Everything your business runs on." />
      </>
    );
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container.querySelectorAll("[data-reveal]").length).toBeGreaterThan(0);
    expect(entranceInlineStyles(container)).toEqual([]);
  });

  test("Hero copy, mock and chips render settled, not mid-entrance, after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<Hero />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container.querySelector("h1")).toHaveTextContent("Everything your business runs on. One OS.");
    expect(entranceInlineStyles(container)).toEqual([]);
  });

  test("ModuleShowcase panels render settled, not mid-entrance, after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<ModuleShowcase />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    expect(container.querySelector('[role="tabpanel"]')).not.toBeNull();
    expect(entranceInlineStyles(container)).toEqual([]);
  });

  test("MobileApp phones rest without the scroll parallax offset after hydrating under reduced motion", async () => {
    const { container, recoverable } = await hydrateUnderReducedMotion(<MobileApp />);
    expect(recoverable.map(String)).toEqual([]);
    expect(hydrationWarnings()).toEqual([]);
    const phones = [...container.querySelectorAll<HTMLElement>("div.mx-auto.max-w-md > div.absolute")];
    expect(phones).toHaveLength(2);
    for (const phone of phones) expect(phone.getAttribute("style") ?? "").not.toMatch(/translateY\(|rotate\(/);
  });
});
