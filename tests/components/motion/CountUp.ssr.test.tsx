import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { CountUp } from "@/components/motion/CountUp";

test("server HTML contains the real value so it reads without JavaScript", () => {
  expect(renderToString(<CountUp value={40} suffix="K+" />)).toContain("40K+");
});

test("with JavaScript it resets to zero until scrolled into view", () => {
  render(<CountUp value={40} suffix="K+" />);
  expect(screen.getByText("0K+")).toBeInTheDocument();
});
