import { afterEach, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const state = vi.hoisted(() => ({ interactive: true }));
vi.mock("@/lib/useInteractive", () => ({ useInteractive: () => state.interactive }));

import { MotionProvider } from "@/components/motion/MotionProvider";
import { SpotlightCard } from "@/components/motion/SpotlightCard";

afterEach(() => {
  state.interactive = true;
});

const rect = { left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;

function renderCard() {
  render(
    <MotionProvider>
      <SpotlightCard as="article">
        <p>GST</p>
      </SpotlightCard>
    </MotionProvider>
  );
  const card = screen.getByRole("article");
  vi.spyOn(card, "getBoundingClientRect").mockReturnValue(rect);
  return card;
}

/** Degrees of rotateX / rotateY in the element's inline transform; 0 when the transform is empty or none. */
const tilt = (el: HTMLElement) => {
  const t = el.style.transform;
  const deg = (axis: string) => Number(t.match(new RegExp(`rotate${axis}\\((-?[\\d.e-]+)deg\\)`))?.[1] ?? 0);
  return { x: deg("X"), y: deg("Y"), transform: t };
};

test("tilts toward the pointer by at most 3 degrees, with perspective, and springs flat on leave", async () => {
  const card = renderCard();
  expect(tilt(card).transform === "" || tilt(card).transform === "none").toBe(true);

  // Bottom-right corner: the furthest the pointer can be from the centre.
  fireEvent.mouseMove(card, { clientX: 200, clientY: 100 });
  await waitFor(
    () => {
      const { x, y } = tilt(card);
      expect(x).toBeCloseTo(-3, 1);
      expect(y).toBeCloseTo(3, 1);
    },
    { timeout: 3000 }
  );
  const settled = tilt(card);
  expect(Math.abs(settled.x)).toBeLessThanOrEqual(3);
  expect(Math.abs(settled.y)).toBeLessThanOrEqual(3);
  expect(settled.transform).toMatch(/^perspective\(\d+px\) /);

  fireEvent.mouseLeave(card);
  await waitFor(() => expect(card.style.transform === "" || card.style.transform === "none").toBe(true), { timeout: 3000 });
});

test("keeps the cursor spotlight while tilting", () => {
  const card = renderCard();
  fireEvent.mouseMove(card, { clientX: 150, clientY: 40 });
  expect(card.style.getPropertyValue("--x")).toBe("150px");
  expect(card.style.getPropertyValue("--y")).toBe("40px");
});

test("does not tilt on touch devices or under reduced motion, but the spotlight still follows the pointer", async () => {
  state.interactive = false;
  const card = renderCard();
  fireEvent.mouseMove(card, { clientX: 200, clientY: 100 });
  await act(() => new Promise((r) => setTimeout(r, 300)));
  expect(tilt(card)).toMatchObject({ x: 0, y: 0 });
  expect(card.style.transform === "" || card.style.transform === "none").toBe(true);
  expect(card.style.getPropertyValue("--x")).toBe("200px");
});
