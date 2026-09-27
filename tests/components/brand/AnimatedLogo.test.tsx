import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";

test("every animated tile is un-hidden by the no-JS reveal rule", () => {
  const { container } = render(<AnimatedLogo />);
  expect(container.querySelectorAll("g")).toHaveLength(4);
  expect(container.querySelectorAll("g[data-reveal]")).toHaveLength(4);
});
