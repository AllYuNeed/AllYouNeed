import { expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// A running Lenis instance, as useLenis() returns on a desktop pointer.
const lenis = vi.hoisted(() => ({ stop: vi.fn(), start: vi.fn() }));
vi.mock("lenis/react", () => ({ ReactLenis: () => null, useLenis: () => lenis }));

import { MobileNav } from "@/components/layout/MobileNav";
import { mainNav } from "@/content/nav";

test("the open drawer pauses Lenis alongside the body scroll lock, and closing resumes it", () => {
  const onClose = vi.fn();
  const { rerender } = render(<MobileNav open={false} onClose={onClose} links={mainNav} />);
  expect(lenis.stop).not.toHaveBeenCalled();

  rerender(<MobileNav open onClose={onClose} links={mainNav} />);
  expect(lenis.stop).toHaveBeenCalledTimes(1);
  expect(lenis.start).not.toHaveBeenCalled();
  expect(document.body.style.overflow).toBe("hidden");

  rerender(<MobileNav open={false} onClose={onClose} links={mainNav} />);
  expect(lenis.start).toHaveBeenCalledTimes(1);
  expect(document.body.style.overflow).toBe("");
});

test("Tab and Shift+Tab wrap focus between the first and last controls of the open drawer", async () => {
  const user = userEvent.setup();
  render(
    <>
      <button type="button">Page behind the drawer</button>
      <MobileNav open onClose={vi.fn()} links={mainNav} />
    </>
  );
  const dialog = screen.getByRole("dialog", { name: /menu/i });
  const first = within(dialog).getByRole("link", { name: /allyouneed home/i });
  const last = within(dialog).getByRole("link", { name: /start free/i });

  last.focus();
  await user.tab();
  expect(first).toHaveFocus();

  await user.tab({ shift: true });
  expect(last).toHaveFocus();
});

test("the drawer scrolls on its own when it is taller than a landscape phone", () => {
  render(<MobileNav open onClose={vi.fn()} links={mainNav} />);
  expect(screen.getByRole("dialog", { name: /menu/i })).toHaveClass("overflow-y-auto", "overscroll-contain");
});

test("wheel scrolling inside the drawer is left to the browser while Lenis is stopped", () => {
  // Lenis checks data-lenis-prevent before its isStopped preventDefault, so the drawer's own overflow still scrolls.
  render(<MobileNav open onClose={vi.fn()} links={mainNav} />);
  expect(screen.getByRole("dialog", { name: /menu/i })).toHaveAttribute("data-lenis-prevent");
});
