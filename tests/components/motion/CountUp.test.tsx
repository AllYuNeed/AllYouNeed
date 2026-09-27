import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: () => true }));

import { CountUp } from "@/components/motion/CountUp";

test("reduced motion shows the final formatted value immediately", () => {
  render(<CountUp value={40} suffix="K+" />);
  expect(screen.getByText("40K+")).toBeInTheDocument();
});

test("respects decimals", () => {
  render(<CountUp value={99.9} suffix="%" decimals={1} />);
  expect(screen.getByText("99.9%")).toBeInTheDocument();
});
