import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

// Instant header transitions (the reduced-motion branch) so the hidden/shown state is readable from inline style.
vi.mock("@/lib/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: () => true }));

import { MotionProvider } from "@/components/motion/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";

// motion's useScroll measures document.scrollingElement and listens for "scroll" on window. jsdom has no
// scrollingElement (useScroll would never subscribe), so point it at the root element for this test.
const root = document.documentElement;

beforeEach(() => {
  Object.defineProperty(document, "scrollingElement", { configurable: true, value: root });
});

afterEach(() => {
  Reflect.deleteProperty(document, "scrollingElement");
  Reflect.deleteProperty(root, "scrollTop");
});

function scrollTo(y: number) {
  Object.defineProperty(root, "scrollTop", { configurable: true, value: y });
  window.dispatchEvent(new Event("scroll"));
}

const headerTransform = () => document.querySelector("header")!.style.transform;

test("keyboard focus moving into the scrolled-away header brings it back on screen", async () => {
  render(
    <MotionProvider>
      <Navbar />
    </MotionProvider>
  );
  await act(async () => scrollTo(100));
  await act(async () => scrollTo(600));
  await waitFor(() => expect(headerTransform()).toMatch(/translateY\(-96px\)/));

  act(() => screen.getByRole("button", { name: /open menu/i }).focus());
  await waitFor(() => expect(headerTransform()).not.toMatch(/translateY\(-96px\)/));
});
