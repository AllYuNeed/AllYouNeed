import { afterEach, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const state = vi.hoisted(() => ({ interactive: true }));
vi.mock("@/lib/useInteractive", () => ({ useInteractive: () => state.interactive }));

import { MotionProvider } from "@/components/motion/MotionProvider";
import { TiltCard } from "@/components/motion/TiltCard";

afterEach(() => {
  state.interactive = true;
});

function renderCard() {
  render(
    <MotionProvider>
      <TiltCard>
        <p>Dashboard</p>
      </TiltCard>
    </MotionProvider>
  );
  return screen.getByText("Dashboard").parentElement!;
}

const promoted = (el: HTMLElement) => el.style.willChange === "transform" || el.classList.contains("will-change-transform");

// Motion writes motion-value changes to the DOM on its next frame, hence waitFor.
test("the card is promoted to its own layer only while the pointer is over it", async () => {
  const card = renderCard();
  expect(promoted(card)).toBe(false);
  fireEvent.mouseEnter(card);
  await waitFor(() => expect(card.style.willChange).toBe("transform"));
  fireEvent.mouseLeave(card);
  await waitFor(() => expect(promoted(card)).toBe(false));
});

test("a card that never tilts (touch or reduced motion) is never promoted", async () => {
  state.interactive = false;
  const card = renderCard();
  fireEvent.mouseEnter(card);
  fireEvent.mouseMove(card, { clientX: 10, clientY: 10 });
  await act(() => new Promise((r) => setTimeout(r, 100)));
  expect(promoted(card)).toBe(false);
});
