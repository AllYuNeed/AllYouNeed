import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

test("renders link columns, compliance alignment note and newsletter", () => {
  render(<Footer />);
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Product" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy/");
  expect(screen.getByText(/designed to align with/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
  expect(screen.getByText(/© \d{4} Allyouneed/)).toBeInTheDocument();
});
