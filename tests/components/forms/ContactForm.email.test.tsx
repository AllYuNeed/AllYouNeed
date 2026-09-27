import { test, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/forms/ContactForm";
import { setFormTransport } from "@/lib/forms";

// A different address than the real placeholder, so a hard-coded email in the component cannot pass.
vi.mock("@/content/site", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content/site")>();
  return { site: { ...actual.site, email: "bookings@example.test" } };
});

afterEach(() => setFormTransport(null));

test("the success message names the contact address from content/site.ts", async () => {
  setFormTransport(async () => ({ ok: true }));
  const user = userEvent.setup();
  render(<ContactForm />);
  await user.type(screen.getByLabelText(/full name/i), "Priya Nair");
  await user.type(screen.getByLabelText(/work email/i), "priya@meridianfoods.in");
  await user.type(screen.getByLabelText(/phone/i), "9876543210");
  await user.type(screen.getByLabelText(/company/i), "Meridian Foods");
  await user.selectOptions(screen.getByLabelText(/team size/i), "1-10");
  await user.click(screen.getByLabelText("Payroll"));
  await user.click(screen.getByRole("button", { name: /book my demo/i }));
  expect(await screen.findByText(/calendar invite from bookings@example\.test/i)).toBeInTheDocument();
  expect(screen.queryByText(/hello@allyouneed\.in/i)).not.toBeInTheDocument();
});
