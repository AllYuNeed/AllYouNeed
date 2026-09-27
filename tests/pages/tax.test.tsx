import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaxPage from "@/app/tax-compliance/page";
import { taxCategories } from "@/content/tax";

test("tax page renders categories with anchors, the calendar, journey and experts", () => {
  render(<TaxPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/every tax/i);
  for (const c of taxCategories) {
    expect(screen.getByRole("heading", { level: 3, name: c.name }).closest("article")).toHaveAttribute("id", c.slug);
  }
  expect(screen.getByRole("heading", { level: 2, name: /a typical month/i })).toBeInTheDocument();
  expect(screen.getAllByText(/GSTR-3B/).length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { level: 2, name: /incorporation to year end/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: /a professional/i })).toBeInTheDocument();
});
