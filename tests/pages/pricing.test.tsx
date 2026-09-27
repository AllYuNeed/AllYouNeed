import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingPage from "@/app/pricing/page";

test("pricing page renders plans, comparison table and FAQ", () => {
  render(<PricingPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/pricing/i);
  for (const name of ["Free", "Growth", "Business", "Enterprise"]) {
    expect(screen.getAllByRole("heading", { level: 3, name }).length).toBeGreaterThan(0);
  }
  expect(screen.getByRole("table", { name: /compare plans/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /is there really a free plan/i })).toBeInTheDocument();
});
