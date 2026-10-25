import { test, expect, vi, beforeEach, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const h = vi.hoisted(() => ({
  auth: { status: "signed-out", user: null, recovery: false, signOut: vi.fn() } as { status: string; user: unknown; recovery: boolean; signOut: ReturnType<typeof vi.fn> },
}));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => h.auth }));

import { AuthActions } from "@/components/layout/AuthActions";
import { MobileNav } from "@/components/layout/MobileNav";
import { mainNav } from "@/content/nav";

beforeEach(() => {
  h.auth = { status: "signed-out", user: null, recovery: false, signOut: vi.fn(async () => ({ ok: true })) };
});

describe("header account controls", () => {
  test.each(["signed-out", "loading", "unconfigured"])("%s: shows Log in and Start free", (status) => {
    h.auth = { ...h.auth, status };
    render(<AuthActions />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login/");
    expect(screen.getByRole("link", { name: /start free/i })).toHaveAttribute("href", "/register/");
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  test("signed-in: shows Account and Log out instead, and Log out signs out", async () => {
    h.auth = { ...h.auth, status: "signed-in", user: { id: "1" } };
    render(<AuthActions />);
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account/");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start free/i })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: /log out/i }));
    expect(h.auth.signOut).toHaveBeenCalledTimes(1);
  });
});

describe("mobile menu account controls", () => {
  test("signed-out: Log in and Start free", () => {
    render(<MobileNav open onClose={() => {}} links={mainNav} />);
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start free/i })).toBeInTheDocument();
  });

  test("signed-in: Account and Log out, and Log out closes the menu then signs out", async () => {
    h.auth = { ...h.auth, status: "signed-in", user: { id: "1" } };
    const onClose = vi.fn();
    render(<MobileNav open onClose={onClose} links={mainNav} />);
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account/");
    expect(screen.queryByRole("link", { name: /start free/i })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: /log out/i }));
    expect(onClose).toHaveBeenCalled();
    expect(h.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
