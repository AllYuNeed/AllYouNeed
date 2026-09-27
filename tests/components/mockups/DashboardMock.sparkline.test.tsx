import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { DashboardMock } from "@/components/mockups/DashboardMock";

// A matchMedia whose reduced-motion answer can flip and notify subscribers, like a real MediaQueryList.
let reduce = false;
const listeners = new Set<() => void>();
const originalMatchMedia = window.matchMedia;
const fakeMatchMedia = (query: string) =>
  ({
    get matches() {
      return query.includes("prefers-reduced-motion") ? reduce : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
const setReduce = (value: boolean) => {
  reduce = value;
  for (const cb of [...listeners]) cb();
};

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  window.matchMedia = fakeMatchMedia;
  setReduce(false);
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container?.remove();
  container = null;
  setReduce(false);
  window.matchMedia = originalMatchMedia;
});

const line = (scope: ParentNode) => scope.querySelector<SVGPathElement>("[data-sparkline] path")!;
const undrawn = (path: Element) => /^0[\s,]/.test(path.getAttribute("stroke-dasharray") ?? "");

describe("collections sparkline", () => {
  test.each([false, true])("compact=%s: the dashboard labels a 'Collections, last 30 days' line chart", (compact) => {
    const { container } = render(
      <MotionProvider>
        <DashboardMock compact={compact} />
      </MotionProvider>
    );
    expect(screen.getByText("Collections, last 30 days")).toBeInTheDocument();
    const path = line(container);
    expect(path).not.toBeNull();
    expect(path.getAttribute("d")).toMatch(/^M[\d.]+[ ,][\d.]+( L[\d.]+[ ,][\d.]+){8,}$/);
    expect(path.closest("svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("the server paints the line undrawn (pathLength 0) and marks it data-reveal for the no-JS rule", () => {
    const el = document.createElement("div");
    el.innerHTML = renderToString(
      <MotionProvider>
        <DashboardMock />
      </MotionProvider>
    );
    const path = line(el);
    expect(undrawn(path)).toBe(true);
    expect(path).toHaveAttribute("data-reveal");
  });

  test("under reduced motion the line renders fully drawn", () => {
    setReduce(true);
    const { container } = render(
      <MotionProvider>
        <DashboardMock />
      </MotionProvider>
    );
    expect(undrawn(line(container))).toBe(false);
  });

  test("hydrating the static HTML in a reduced-motion browser ends with the line fully drawn", async () => {
    const ui = (
      <MotionProvider>
        <DashboardMock />
      </MotionProvider>
    );
    container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);
    expect(undrawn(line(container))).toBe(true);

    setReduce(true);
    const recoverable: unknown[] = [];
    await act(async () => {
      root = hydrateRoot(container!, ui, { onRecoverableError: (e) => recoverable.push(e) });
    });
    expect(recoverable).toEqual([]);
    expect(undrawn(line(container))).toBe(false);
  });
});
