import { test, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("login shows the coming-soon notice after a valid submit and never sends the password", async () => {
  const calls: unknown[] = [];
  setFormTransport(async (_kind, data) => {
    calls.push(data);
    return { ok: true };
  });
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText(/work email/i), "rhea@meridianfoods.in");
  await user.type(screen.getByLabelText(/^password/i), "secret123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  await waitFor(() => expect(screen.getByText(/coming soon/i)).toBeInTheDocument());
  expect(JSON.stringify(calls)).not.toContain("secret123");
});

test("password visibility toggle works", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  const pw = screen.getByLabelText(/^password/i);
  expect(pw).toHaveAttribute("type", "password");
  await user.click(screen.getByRole("button", { name: /show password/i }));
  expect(pw).toHaveAttribute("type", "text");
});

test("register enforces password length", async () => {
  const user = userEvent.setup();
  render(<RegisterForm />);
  const pw = screen.getByLabelText(/^password/i);
  await user.type(pw, "short");
  await user.click(screen.getByRole("button", { name: /create/i }));
  await waitFor(() => expect(pw).toHaveAttribute("aria-invalid", "true"));
  expect(pw).toHaveAccessibleDescription(/use at least 8 characters/i);
});
