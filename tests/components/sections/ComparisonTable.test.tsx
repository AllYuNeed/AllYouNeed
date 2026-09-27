import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonTable } from "@/components/sections/ComparisonTable";

test("the table's scroller is the containing block for its absolutely positioned sr-only labels", () => {
  // .sr-only is position:absolute. If the overflow-x-auto scroller is not positioned, those labels escape it and
  // widen the page (647px of scroll width at a 375px viewport once the Reveal's transform is gone).
  render(<ComparisonTable />);
  const scroller = screen.getByRole("table", { name: /compare plans/i }).parentElement!;
  expect(scroller).toHaveClass("overflow-x-auto");
  expect(scroller).toHaveClass("relative");
  expect(scroller.querySelectorAll(".sr-only").length).toBeGreaterThan(0);
});
