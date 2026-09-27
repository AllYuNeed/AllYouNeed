import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpotlightCard } from "@/components/motion/SpotlightCard";

test("as='a' renders a link with its href and id", () => {
  render(
    <SpotlightCard as="a" href="/features/#hr" id="hr-card">
      Employee & HR
    </SpotlightCard>
  );
  const link = screen.getByRole("link", { name: /employee & hr/i });
  expect(link).toHaveAttribute("href", "/features/#hr");
  expect(link).toHaveAttribute("id", "hr-card");
});
