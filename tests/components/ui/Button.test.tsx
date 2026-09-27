import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

test("renders a link when href is given", () => {
  render(<Button href="/pricing/">See pricing</Button>);
  expect(screen.getByRole("link", { name: "See pricing" })).toHaveAttribute("href", "/pricing/");
});

test("renders a button otherwise and forwards type", () => {
  render(<Button type="submit">Send</Button>);
  expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
});

test("arrow adds a decorative icon", () => {
  const { container } = render(<Button arrow>Go</Button>);
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});

/** The properties named by the element's `transition-[…]` utility. */
function transitionedProperties(el: Element) {
  const list = /(?:^|\s)transition-\[([^\]]+)\]/.exec(el.className)?.[1] ?? "";
  return list.split(",");
}

test("the hover lift and press scale ease: Tailwind 4 translate/scale utilities set their own properties, not transform", () => {
  render(<Button>Start free</Button>);
  const button = screen.getByRole("button", { name: "Start free" });
  expect(button.className).toMatch(/(?:^|\s)motion-safe:hover:-translate-y-0\.5(?:\s|$)/);
  expect(button.className).toMatch(/(?:^|\s)motion-safe:active:scale-\[0\.98\](?:\s|$)/);
  expect(transitionedProperties(button)).toEqual(expect.arrayContaining(["translate", "scale", "box-shadow", "background-color", "color"]));
});
