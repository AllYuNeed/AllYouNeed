import { test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import FeaturesPage from "@/app/features/page";
import { modules } from "@/content/modules";

test("features page lists every module with an anchor and side nav", () => {
  render(<FeaturesPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/every module/i);
  for (const mod of modules) {
    const heading = screen.getByRole("heading", { level: 2, name: mod.name });
    expect(heading.closest("section")).toHaveAttribute("id", mod.slug);
  }
  const nav = screen.getByRole("navigation", { name: /on this page/i });
  expect(nav.querySelectorAll("a")).toHaveLength(modules.length);
});

test("modules without a mockup show their explicit chips, not cut-off bullet fragments", () => {
  render(<FeaturesPage />);
  const assets = within(document.getElementById("assets")!);
  for (const chip of ["QR asset tags", "Assignments", "Depreciation", "AMC reminders"]) expect(assets.getByText(chip)).toBeInTheDocument();
  const integrations = within(document.getElementById("integrations")!);
  for (const chip of ["Payment gateways", "Lead sync", "Cloud telephony", "Bank feeds"]) expect(integrations.getByText(chip)).toBeInTheDocument();
  for (const fragment of ["Asset register with", "Depreciation schedules (Companies", "Payment gateways with", "Meta lead ads,"]) {
    expect(screen.queryByText(fragment)).not.toBeInTheDocument();
  }
});
