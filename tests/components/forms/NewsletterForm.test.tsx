import { test, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("shows a validation error for a bad email", async () => {
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "nope");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/valid work email/i);
});

test("submits and shows success", async () => {
  setFormTransport(async () => ({ ok: true }));
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  await waitFor(() => expect(screen.getByText(/you're on the list/i)).toBeInTheDocument());
});

test("shows error state with retry", async () => {
  setFormTransport(async () => ({ ok: false, error: "Something went wrong" }));
  const user = userEvent.setup();
  render(<NewsletterForm />);
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.click(screen.getByRole("button", { name: /subscribe/i }));
  expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
});
