import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Marquee } from "@/components/motion/Marquee";

test("duplicates children for a seamless loop and hides the copy from AT", () => {
  render(
    <Marquee>
      <span>Meridian Foods</span>
    </Marquee>
  );
  expect(screen.getAllByText("Meridian Foods")).toHaveLength(2);
  const copies = document.querySelectorAll("[aria-hidden='true']");
  expect(copies.length).toBeGreaterThanOrEqual(1);
});
