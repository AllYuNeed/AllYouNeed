import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const h = vi.hoisted(() => ({
  auth: { status: "loading", user: null, recovery: false, signOut: vi.fn() } as { status: string; user: unknown; recovery: boolean; signOut: () => unknown },
  replace: vi.fn(),
  pathname: "/account/",
}));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => h.auth }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => h.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthCallback } from "@/components/auth/AuthCallback";

beforeEach(() => {
  h.auth = { status: "loading", user: null, recovery: false, signOut: vi.fn() };
  h.replace.mockClear();
  h.pathname = "/account/";
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("RequireAuth", () => {
  const secret = <p>Private details</p>;

  test("shows the content to a signed-in visitor", () => {
    h.auth = { ...h.auth, status: "signed-in" };
    render(<RequireAuth>{secret}</RequireAuth>);
    expect(screen.getByText("Private details")).toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("while the stored session is being read it shows a placeholder and neither the content nor a redirect", () => {
    render(<RequireAuth>{secret}</RequireAuth>);
    expect(screen.getByRole("status")).toHaveTextContent(/checking your session/i);
    expect(screen.queryByText("Private details")).not.toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("a signed-out visitor is sent to the login page, which returns them here afterwards", async () => {
    h.auth = { ...h.auth, status: "signed-out" };
    render(<RequireAuth>{secret}</RequireAuth>);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/login/?next=%2Faccount%2F"));
    expect(screen.queryByText("Private details")).not.toBeInTheDocument();
  });

  test("without Supabase settings it says accounts are off instead of redirecting forever", () => {
    h.auth = { ...h.auth, status: "unconfigured" };
    render(<RequireAuth>{secret}</RequireAuth>);
    expect(screen.getByText(/accounts aren't switched on/i)).toBeInTheDocument();
    expect(screen.queryByText("Private details")).not.toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });
});

describe("AuthCallback", () => {
  test("waits while supabase-js exchanges the code in the URL", async () => {
    window.history.replaceState({}, "", "/auth/callback/?code=abc");
    render(<AuthCallback />);
    expect(await screen.findByRole("status")).toHaveTextContent(/checking your link/i);
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("an email-confirmation link signs the visitor in and lands on the account page", async () => {
    window.history.replaceState({}, "", "/auth/callback/?code=abc");
    h.auth = { ...h.auth, status: "signed-in" };
    render(<AuthCallback />);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/account/"));
  });

  test("a password-reset link lands on the choose-a-password page", async () => {
    window.history.replaceState({}, "", "/auth/callback/?code=abc");
    h.auth = { ...h.auth, status: "signed-in", recovery: true };
    render(<AuthCallback />);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/reset-password/"));
  });

  test("an expired link shows fixed wording, never the text supplied in the URL", async () => {
    window.history.replaceState({}, "", "/auth/callback/?error=access_denied&error_code=otp_expired&error_description=Visit+evil.example+to+fix");
    h.auth = { ...h.auth, status: "signed-out" };
    render(<AuthCallback />);
    expect(await screen.findByText(/expired or was already used/i)).toBeInTheDocument();
    expect(screen.queryByText(/evil\.example/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reset password/i })).toHaveAttribute("href", "/forgot-password/");
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("a failed link is explained even when the visitor is already signed in (no silent redirect to the account page)", async () => {
    window.history.replaceState({}, "", "/auth/callback/?error=access_denied&error_code=otp_expired");
    h.auth = { ...h.auth, status: "signed-in" };
    render(<AuthCallback />);
    expect(await screen.findByText(/expired or was already used/i)).toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("an error in the URL fragment (older flow) is handled too", async () => {
    window.history.replaceState({}, "", "/auth/callback/#error=access_denied&error_code=otp_expired");
    h.auth = { ...h.auth, status: "signed-out" };
    render(<AuthCallback />);
    expect(await screen.findByText(/expired or was already used/i)).toBeInTheDocument();
  });

  test("opening the page with no code and no session explains what to do", async () => {
    h.auth = { ...h.auth, status: "signed-out" };
    render(<AuthCallback />);
    expect(await screen.findByText(/couldn't sign you in from this link/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login/");
  });
});
