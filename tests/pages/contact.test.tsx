import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

test("contact page renders the form and contact details", () => {
  render(<ContactPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/book a demo/i);
  expect(screen.getByRole("form", { name: /book a demo/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /hello@allyouneed\.in/i })).toBeInTheDocument();
});
