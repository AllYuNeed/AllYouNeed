import { afterEach, test, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The route is a module-level variable so a test can "navigate" (browser Back, a link) and rerender.
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { Navbar } from "@/components/layout/Navbar";

afterEach(() => {
  route.pathname = "/";
});

test("renders primary navigation, login and CTA", () => {
  render(<Navbar />);
  const nav = screen.getByRole("navigation", { name: /primary/i });
  expect(nav).toBeInTheDocument();
  for (const label of ["Features", "Tax & Compliance", "Pricing", "About", "Contact"]) {
    expect(screen.getAllByRole("link", { name: label })[0]).toBeInTheDocument();
  }
  expect(screen.getAllByRole("link", { name: "Log in" })[0]).toHaveAttribute("href", "/login/");
  expect(screen.getAllByRole("link", { name: "Start free" })[0]).toHaveAttribute("href", "/register/");
});

test("mobile menu opens and closes with Escape", async () => {
  const user = userEvent.setup();
  render(<Navbar />);
  const open = screen.getByRole("button", { name: /open menu/i });
  expect(open).toHaveAttribute("aria-expanded", "false");
  await user.click(open);
  expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("closing the drawer returns focus to the menu button", async () => {
  const user = userEvent.setup();
  render(<Navbar />);
  const menu = screen.getByRole("button", { name: /open menu/i });
  await user.click(menu);
  const dialog = screen.getByRole("dialog", { name: /menu/i });
  expect(within(dialog).getByRole("link", { name: "Features" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(menu).toHaveFocus();
});

test("the drawer closes when the route changes underneath it (browser Back, history gestures)", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Navbar />);
  await user.click(screen.getByRole("button", { name: /open menu/i }));
  expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();
  expect(document.body.style.overflow).toBe("hidden");

  route.pathname = "/pricing/";
  rerender(<Navbar />);

  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute("aria-expanded", "false");
  expect(document.body.style.overflow).toBe("");
});

test("a drawer closed by a route change stays closed when history returns to the page it was opened on", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Navbar />);
  await user.click(screen.getByRole("button", { name: /open menu/i }));
  expect(screen.getByRole("dialog", { name: /menu/i })).toBeInTheDocument();

  route.pathname = "/pricing/"; // browser Back
  rerender(<Navbar />);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

  route.pathname = "/"; // browser Forward
  rerender(<Navbar />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute("aria-expanded", "false");
});

test("the drawer's own logo link closes it", async () => {
  const user = userEvent.setup();
  render(<Navbar />);
  await user.click(screen.getByRole("button", { name: /open menu/i }));
  const dialog = screen.getByRole("dialog", { name: /menu/i });
  await user.click(within(dialog).getByRole("link", { name: /allyouneed home/i }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
