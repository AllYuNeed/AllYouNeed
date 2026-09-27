import { afterEach, expect, test, vi } from "vitest";
import { act } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";

// Record every ReactLenis render (tests/setup.ts only stubs it as a Fragment) so the test can tell Lenis switched on.
const lenisRenders = vi.hoisted(() => [] as Array<{ root: unknown }>);
vi.mock("lenis/react", async () => {
  const { createElement, Fragment } = await import("react");
  return {
    ReactLenis: ({ root, children }: { root?: boolean; children?: ReactNode }) => {
      lenisRenders.push({ root });
      return createElement(Fragment, null, children);
    },
    useLenis: () => null,
  };
});

import { SmoothScroll } from "@/components/motion/SmoothScroll";

const originalMatchMedia = window.matchMedia;
let root: Root | null = null;
let container: HTMLDivElement | null = null;

function stubMatchMedia(matches: (query: string) => boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container?.remove();
  container = null;
  lenisRenders.length = 0;
  window.matchMedia = originalMatchMedia;
});

async function serverRenderThenHydrate() {
  const ui = (
    <SmoothScroll>
      <p id="probe">x</p>
    </SmoothScroll>
  );
  container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  document.body.appendChild(container);
  const serverProbe = container.querySelector("#probe")!;
  const recoverable: unknown[] = [];
  await act(async () => {
    root = hydrateRoot(container!, ui, { onRecoverableError: (error) => recoverable.push(error) });
  });
  return { serverProbe, recoverable };
}

test("switching Lenis on after hydration keeps the server-rendered children in place", async () => {
  // A desktop: fine hover pointer, no reduced-motion preference.
  stubMatchMedia((q) => q.includes("hover: hover") || q.includes("pointer: fine"));
  const { serverProbe, recoverable } = await serverRenderThenHydrate();

  expect(recoverable.map(String)).toEqual([]);
  expect(lenisRenders.some((r) => r.root === true)).toBe(true);
  expect(serverProbe.isConnected).toBe(true);
  expect(container!.querySelector("#probe")).toBe(serverProbe);
});

test("touch devices and reduced motion never start Lenis", async () => {
  stubMatchMedia((q) => q.includes("hover: none") || q.includes("prefers-reduced-motion: reduce"));
  const { serverProbe, recoverable } = await serverRenderThenHydrate();

  expect(recoverable.map(String)).toEqual([]);
  expect(lenisRenders).toEqual([]);
  expect(serverProbe.isConnected).toBe(true);
});
