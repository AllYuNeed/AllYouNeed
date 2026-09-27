import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingTable } from "@/components/sections/PricingTable";

test("shows monthly prices by default and yearly equivalents after toggling", async () => {
  const user = userEvent.setup();
  render(<PricingTable />);
  expect(screen.getByText("₹999")).toBeInTheDocument();
  expect(screen.getByText("₹2,999")).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: /yearly/i }));
  expect(screen.getByText("₹799")).toBeInTheDocument();
  expect(screen.getByText("₹2,399")).toBeInTheDocument();
  expect(screen.getByText(/₹9,590 billed yearly/)).toBeInTheDocument();
});

test("marks the highlighted plan and shows custom pricing for Enterprise", () => {
  render(<PricingTable />);
  expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  expect(screen.getByText("Custom")).toBeInTheDocument();
  expect(screen.getByText("custom pricing")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /contact sales/i })).toHaveAttribute("href", "/contact/");
});

test("billing toggle follows the radio-group keyboard pattern", async () => {
  const user = userEvent.setup();
  render(<PricingTable />);
  const monthly = screen.getByRole("radio", { name: /monthly/i });
  const yearly = screen.getByRole("radio", { name: /yearly/i });
  expect(monthly).toHaveAttribute("tabindex", "0");
  expect(yearly).toHaveAttribute("tabindex", "-1");
  monthly.focus();
  await user.keyboard("{ArrowRight}");
  expect(yearly).toHaveAttribute("aria-checked", "true");
  expect(yearly).toHaveFocus();
  expect(screen.getByText("₹799")).toBeInTheDocument();
});
