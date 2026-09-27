import { test, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/forms/ContactForm";
import { setFormTransport } from "@/lib/forms";

afterEach(() => setFormTransport(null));

test("shows inline errors for every required field on empty submit", async () => {
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  const alerts = await screen.findAllByRole("alert");
  const text = alerts.map((a) => a.textContent).join(" | ");
  expect(text).toMatch(/enter your name/i);
  expect(text).toMatch(/valid work email/i);
  expect(text).toMatch(/10-digit/i);
  expect(text).toMatch(/company name/i);
  expect(text).toMatch(/team size/i);
  expect(text).toMatch(/at least one module/i);
});

test("submits normalised data and shows success", async () => {
  const spy = vi.fn(async () => ({ ok: true as const }));
  setFormTransport(spy);
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "Priya@MeridianFoods.in");
  await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "11-50");
  await user.click(screen.getByLabelText("Accounting"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  await waitFor(() => expect(screen.getByText(/we'll be in touch/i)).toBeInTheDocument());
  expect(spy).toHaveBeenCalledWith("contact", expect.objectContaining({ email: "priya@meridianfoods.in", phone: "9876543210", modules: ["accounting"], teamSize: "11-50" }));
});

test("shows an error state with retry when the transport fails", async () => {
  setFormTransport(async () => ({ ok: false, error: "Could not reach the server" }));
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.type(screen.getByLabelText(/phone/i), "9876543210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "1-10");
  await user.click(screen.getByLabelText("Payroll"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  expect(await screen.findByText("Could not reach the server")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /retry/i }));
  expect(screen.getByRole("button", { name: /book my demo/i })).toBeEnabled();
});

test("a transport that rejects (offline fetch) still reaches the error state instead of spinning forever", async () => {
  setFormTransport(() => Promise.reject(new TypeError("Failed to fetch")));
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.type(screen.getByLabelText(/phone/i), "9876543210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "1-10");
  await user.click(screen.getByLabelText("Payroll"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  expect(await screen.findByText(/something went wrong\. please try again/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/full name/i)).toBeEnabled();
});
