import { test, expect, vi, beforeEach, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeSupabase } from "../../helpers/fakeSupabase";

const h = vi.hoisted(() => ({
  client: null as unknown,
  auth: { status: "signed-out", user: null, recovery: false, signOut: vi.fn() } as { status: string; user: unknown; recovery: boolean; signOut: () => unknown },
}));
vi.mock("@/lib/supabase/client", () => ({ getSupabase: () => h.client }));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => h.auth }));

import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

let fake: ReturnType<typeof fakeSupabase>;

beforeEach(() => {
  fake = fakeSupabase();
  h.client = fake;
  h.auth = { status: "signed-out", user: null, recovery: false, signOut: vi.fn() };
});

describe("ForgotPasswordForm", () => {
  test("asks Supabase to email a link that returns to this site's callback page, and answers the same way for any address", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/work email/i), " Someone@Example.TEST ");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/if an account exists for that address/i)).toBeInTheDocument();
    expect(fake.auth.resetPasswordForEmail).toHaveBeenCalledWith("someone@example.test", { redirectTo: `${window.location.origin}/auth/callback/` });
  });

  test("a rate-limit error is explained", async () => {
    fake.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: null, error: { code: "over_email_send_rate_limit" } });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/work email/i), "a@example.test");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument();
  });

  test("validates the email before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/work email/i), "nope");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/valid work email/i)).toBeInTheDocument();
    expect(fake.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  test("without Supabase settings it says accounts are off and cannot be submitted", () => {
    h.auth = { ...h.auth, status: "unconfigured" };
    render(<ForgotPasswordForm />);
    expect(screen.getByText(/accounts aren't switched on/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });
});

describe("ResetPasswordForm", () => {
  test("a signed-in visitor (arrived from the reset email) sets a new password", async () => {
    h.auth = { ...h.auth, status: "signed-in", recovery: true };
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "brand-new-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/your password has been changed/i)).toBeInTheDocument();
    expect(fake.auth.updateUser).toHaveBeenCalledWith({ password: "brand-new-pass" });
    expect(screen.getByRole("link", { name: /go to your account/i })).toHaveAttribute("href", "/account/");
  });

  test("two different passwords are rejected before Supabase is called", async () => {
    h.auth = { ...h.auth, status: "signed-in", recovery: true };
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "different-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/don't match/i)).toBeInTheDocument();
    expect(fake.auth.updateUser).not.toHaveBeenCalled();
  });

  test("a short password is rejected", async () => {
    h.auth = { ...h.auth, status: "signed-in", recovery: true };
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/^new password/i), "short");
    await user.type(screen.getByLabelText(/repeat new password/i), "short");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/at least 8 characters/i, { selector: "[role=alert]" })).toBeInTheDocument();
    expect(fake.auth.updateUser).not.toHaveBeenCalled();
  });

  test("Supabase refusing the new password (same as the old one) is explained", async () => {
    h.auth = { ...h.auth, status: "signed-in", recovery: true };
    fake.auth.updateUser.mockResolvedValueOnce({ data: {}, error: { code: "same_password" } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "brand-new-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/not already using/i)).toBeInTheDocument();
  });

  test("a visitor with no session (expired or reused link) is sent to request a new one", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText(/expired or was already used/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request a new link/i })).toHaveAttribute("href", "/forgot-password/");
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
  });

  test("the form cannot be submitted while the session is still loading", () => {
    h.auth = { ...h.auth, status: "loading" };
    render(<ResetPasswordForm />);
    expect(screen.getByRole("button", { name: /save new password/i })).toBeDisabled();
  });

  test("without Supabase settings it says accounts are off", async () => {
    h.auth = { ...h.auth, status: "unconfigured" };
    render(<ResetPasswordForm />);
    await waitFor(() => expect(screen.getByText(/accounts aren't switched on/i)).toBeInTheDocument());
  });
});

describe("ResetPasswordForm: changing a password you already use", () => {
  const signedIn = () => {
    h.auth = { ...h.auth, status: "signed-in", recovery: false, user: { email: "priya@example.test" } };
  };

  test("asks for the current password; arriving from a reset email does not", () => {
    signedIn();
    const { unmount } = render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    unmount();
    h.auth = { ...h.auth, recovery: true };
    render(<ResetPasswordForm />);
    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument();
  });

  test("checks the current password with Supabase first, then updates", async () => {
    signedIn();
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/current password/i), "old-password-1");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "brand-new-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/your password has been changed/i)).toBeInTheDocument();
    expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: "priya@example.test", password: "old-password-1" });
    expect(fake.auth.updateUser).toHaveBeenCalledWith({ password: "brand-new-pass" });
    const check = fake.auth.signInWithPassword.mock.invocationCallOrder[0];
    const update = fake.auth.updateUser.mock.invocationCallOrder[0];
    expect(check).toBeLessThan(update);
  });

  test("a wrong current password is refused and nothing is changed", async () => {
    signedIn();
    fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: "invalid_credentials" } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/current password/i), "not-my-password");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "brand-new-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/isn't your current password/i)).toBeInTheDocument();
    expect(fake.auth.updateUser).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /save new password/i })).toBeEnabled();
  });

  test("leaving the current password blank is refused before anything is sent", async () => {
    signedIn();
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass");
    await user.type(screen.getByLabelText(/repeat new password/i), "brand-new-pass");
    await user.click(screen.getByRole("button", { name: /save new password/i }));
    expect(await screen.findByText(/enter your current password/i)).toBeInTheDocument();
    expect(fake.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(fake.auth.updateUser).not.toHaveBeenCalled();
  });
});
