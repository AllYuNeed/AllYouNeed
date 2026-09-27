import { test, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("motion/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("motion/react")>();
  return { ...mod, useInView: () => true };
});
vi.mock("@/lib/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: () => true }));

import { ModuleShowcase } from "@/components/sections/ModuleShowcase";

afterEach(() => vi.useRealTimers());

test("renders five tabs and switches panels on click", async () => {
  const user = userEvent.setup();
  render(<ModuleShowcase />);
  expect(screen.getAllByRole("tab")).toHaveLength(5);
  expect(screen.getByRole("tabpanel")).toHaveTextContent(/cash in bank/i);
  expect(screen.getByRole("tabpanel")).toHaveAttribute("data-reveal");
  await user.click(screen.getByRole("tab", { name: /crm/i }));
  expect(screen.getByRole("tabpanel")).toHaveTextContent(/qualified/i);
});

test("does not auto-advance under reduced motion", () => {
  vi.useFakeTimers();
  render(<ModuleShowcase />);
  act(() => {
    vi.advanceTimersByTime(7000);
  });
  expect(screen.getByRole("tab", { name: /dashboard/i })).toHaveAttribute("aria-selected", "true");
});

test("the tabpanel is focusable and every aria-controls resolves to it", async () => {
  const user = userEvent.setup();
  render(<ModuleShowcase />);
  const check = () => {
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("tabindex", "0");
    for (const tab of screen.getAllByRole("tab")) {
      const id = tab.getAttribute("aria-controls");
      if (id !== null) expect(document.getElementById(id)).toBe(panel);
    }
    expect(screen.getByRole("tab", { selected: true })).toHaveAttribute("aria-controls", panel.id);
  };
  check();
  await user.click(screen.getByRole("tab", { name: /crm/i }));
  check();
});

test("the section clips the panel's sideways entrance instead of widening the page", () => {
  // The panel enters from x:+32 while autoplay runs on phones; overflow-x-clip (not hidden) contains it without
  // creating a scroll container.
  const { container } = render(<ModuleShowcase />);
  const section = container.querySelector("section#showcase")!;
  expect(section).toHaveClass("overflow-x-clip");
  expect(section).not.toHaveClass("overflow-hidden");
  expect(section).not.toHaveClass("overflow-x-hidden");
});
