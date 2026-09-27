import { afterEach, beforeEach, expect, test } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { BackToTop } from "@/components/motion/BackToTop";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

// Navigation layers: navbar z-50, drawer backdrop z-[60], drawer z-[70]. Floating utilities must sit below the
// modal layers, or Back to top covers the drawer's "Start free" CTA and takes its taps.
const zIndex = (el: Element) => {
  const cls = [...el.classList].find((c) => /^z-(\d+|\[\d+\])$/.test(c));
  return cls ? Number(cls.replace(/^z-\[?(\d+)\]?$/, "$1")) : NaN;
};

// motion's useScroll measures document.scrollingElement, which jsdom lacks.
const root = document.documentElement;
beforeEach(() => {
  Object.defineProperty(document, "scrollingElement", { configurable: true, value: root });
});
afterEach(() => {
  Reflect.deleteProperty(document, "scrollingElement");
  Reflect.deleteProperty(root, "scrollTop");
});

test("Back to top sits under the navbar and the drawer layers", async () => {
  render(
    <MotionProvider>
      <BackToTop />
    </MotionProvider>
  );
  await act(async () => {
    Object.defineProperty(root, "scrollTop", { configurable: true, value: window.innerHeight * 3 });
    window.dispatchEvent(new Event("scroll"));
  });
  const button = await screen.findByRole("button", { name: /back to top/i });
  expect(zIndex(button)).toBeLessThan(50);
});

test("the scroll progress bar sits above the navbar but under the drawer backdrop", () => {
  const { container } = render(
    <MotionProvider>
      <ScrollProgress />
    </MotionProvider>
  );
  const z = zIndex(container.firstElementChild!);
  expect(z).toBeGreaterThan(50);
  expect(z).toBeLessThan(60);
});
