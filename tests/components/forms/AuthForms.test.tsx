import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeSupabase } from "../../helpers/fakeSupabase";

const h = vi.hoisted(() => ({
  client: null as unknown,
  auth: { status: "signed-out", user: null, recovery: false, signOut: vi.fn() } as { status: string; user: unknown; recovery: boolean; signOut: () => unknown },
  replace: vi.fn(),
}));
vi.mock("@/lib/supabase/client", () => ({ getSupabase: () => h.client }));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => h.auth }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";

let fake: ReturnType<typeof fakeSupabase>;

beforeEach(() => {
  fake = fakeSupabase();
  h.client = fake;
  h.auth = { status: "signed-out", user: null, recovery: false, signOut: vi.fn() };
  h.replace.mockClear();
  window.history.replaceState({}, "", "/login/");
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

async function fillLogin(user: ReturnType<typeof userEvent.setup>, email = "rhea@example.test", password = "secret123") {
  await user.type(screen.getByLabelText(/work email/i), email);
  await user.type(screen.getByLabelText(/^password/i), password);
  await user.click(screen.getByRole("button", { name: /log in/i }));
}

describe("LoginForm", () => {
  test("signs in with Supabase Auth, normalising the email, and goes to the account page", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user, "  Rhea@Example.TEST ");
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/account/"));
    expect(fake.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: "rhea@example.test", password: "secret123" });
    expect(screen.getByText(/you're logged in/i)).toBeInTheDocument();
  });

  test("returns to the protected page the visitor came from (?next=)", async () => {
    window.history.replaceState({}, "", "/login/?next=%2Fpricing%2F");
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/pricing/"));
  });

  test.each(["//evil.example", "https://evil.example/", "/\\evil.example", "javascript:alert(1)"])("never follows an off-site ?next= (%s)", async (next) => {
    window.history.replaceState({}, "", `/login/?next=${encodeURIComponent(next)}`);
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/account/"));
  });

  test("a wrong password shows a plain message, keeps the visitor on the form and does not redirect", async () => {
    fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: "invalid_credentials", message: "Invalid login credentials" } });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    expect(await screen.findByText(/email and password don't match/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid login credentials/i)).not.toBeInTheDocument(); // the raw server text is never shown
    expect(h.replace).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
  });

  test("an unconfirmed email is explained", async () => {
    fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: "email_not_confirmed" } });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    expect(await screen.findByText(/confirm your email first/i)).toBeInTheDocument();
  });

  test("validates before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/valid work email/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
    expect(fake.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  test("the password visibility toggle works", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const pw = screen.getByLabelText(/^password/i);
    expect(pw).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(pw).toHaveAttribute("type", "text");
  });

  test("without Supabase settings the form explains that accounts are off and cannot be submitted", () => {
    h.auth = { ...h.auth, status: "unconfigured" };
    h.client = null;
    render(<LoginForm />);
    expect(screen.getByText(/accounts aren't switched on/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
  });

  test("links to the password reset page", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /forgot your password/i })).toHaveAttribute("href", "/forgot-password/");
  });
});

describe("RegisterForm", () => {
  async function fillRegister(user: ReturnType<typeof userEvent.setup>, password = "longenough1") {
    await user.type(screen.getByLabelText(/full name/i), "Arjun Mehta");
    await user.type(screen.getByLabelText(/company/i), "Test Co");
    await user.type(screen.getByLabelText(/work email/i), "Arjun@Example.TEST");
    await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
    await user.type(screen.getByLabelText(/^password/i), password);
    await user.click(screen.getByRole("button", { name: /create/i }));
  }

  test("signs up with the profile details as metadata and a callback URL on this site, then asks to confirm the email", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await fillRegister(user);
    expect(await screen.findByText(/check your email to confirm/i)).toBeInTheDocument();
    expect(screen.getByText(/arjun@example\.test/)).toBeInTheDocument();
    expect(fake.auth.signUp).toHaveBeenCalledWith({
      email: "arjun@example.test",
      password: "longenough1",
      options: {
        data: { full_name: "Arjun Mehta", company: "Test Co", phone: "9876543210" },
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
      },
    });
    expect(h.replace).not.toHaveBeenCalled();
  });

  test("when Supabase signs the visitor in straight away (confirmation switched off) it goes to the account page", async () => {
    fake.auth.signUp.mockResolvedValueOnce({ data: { user: {}, session: { access_token: "x" } }, error: null });
    const user = userEvent.setup();
    render(<RegisterForm />);
    await fillRegister(user);
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/account/"));
    expect(screen.getByText(/your account is ready/i)).toBeInTheDocument();
  });

  test("maps a Supabase error to plain words", async () => {
    fake.auth.signUp.mockResolvedValueOnce({ data: {}, error: { code: "weak_password", message: "Password is known to be weak" } });
    const user = userEvent.setup();
    render(<RegisterForm />);
    await fillRegister(user);
    expect(await screen.findByText(/choose a stronger password/i)).toBeInTheDocument();
    expect(screen.queryByText(/known to be weak/i)).not.toBeInTheDocument();
  });

  test("enforces the password length before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const pw = screen.getByLabelText(/^password/i);
    await user.type(pw, "short");
    await user.click(screen.getByRole("button", { name: /create/i }));
    await waitFor(() => expect(pw).toHaveAttribute("aria-invalid", "true"));
    expect(pw).toHaveAccessibleDescription(/use at least 8 characters/i);
    expect(fake.auth.signUp).not.toHaveBeenCalled();
  });

  test("without Supabase settings the form explains that accounts are off and cannot be submitted", () => {
    h.auth = { ...h.auth, status: "unconfigured" };
    h.client = null;
    render(<RegisterForm />);
    expect(screen.getByText(/accounts aren't switched on/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
