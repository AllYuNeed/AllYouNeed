import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: () => true }));

import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

test("under reduced motion Reveal renders content visible with data-reveal", () => {
  render(
    <Reveal>
      <p>Visible now</p>
    </Reveal>
  );
  const wrapper = screen.getByText("Visible now").parentElement!;
  expect(wrapper).toHaveAttribute("data-reveal");
  expect(wrapper.getAttribute("style") ?? "").not.toMatch(/opacity:\s*0/);
});

test("Stagger renders all children", () => {
  render(
    <Stagger>
      <StaggerItem>One</StaggerItem>
      <StaggerItem>Two</StaggerItem>
    </Stagger>
  );
  expect(screen.getByText("One")).toBeInTheDocument();
  expect(screen.getByText("Two")).toBeInTheDocument();
});
