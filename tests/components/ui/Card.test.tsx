import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

/** The properties named by the element's `transition-[…]` utility. */
function transitionedProperties(el: Element) {
  const list = /(?:^|\s)transition-\[([^\]]+)\]/.exec(el.className)?.[1] ?? "";
  return list.split(",");
}

test("a hover card's lift eases: Tailwind 4 translate/scale utilities set their own properties, not transform", () => {
  render(<Card hover>Payroll</Card>);
  const card = screen.getByText("Payroll");
  expect(card.className).toMatch(/(?:^|\s)motion-safe:hover:-translate-y-1(?:\s|$)/);
  expect(transitionedProperties(card)).toEqual(expect.arrayContaining(["translate", "scale", "box-shadow", "border-color"]));
});

test("a plain card has no hover transition", () => {
  render(<Card>Payroll</Card>);
  expect(screen.getByText("Payroll").className).not.toMatch(/transition/);
});
