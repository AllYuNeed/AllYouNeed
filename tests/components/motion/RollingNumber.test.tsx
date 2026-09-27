import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { formatInr } from "@/lib/pricing";

test("exposes the formatted value as text", () => {
  render(<RollingNumber value={2999} format={formatInr} />);
  expect(screen.getByText("₹2,999")).toBeInTheDocument();
});

test("paints each digit column at its final offset without waiting for JS", () => {
  const { container } = render(<RollingNumber value={7} />);
  const column = container.querySelector(".absolute") as HTMLElement;
  expect(column.style.transform).toContain("-7em");
});
