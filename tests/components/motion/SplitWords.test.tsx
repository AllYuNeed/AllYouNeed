import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplitWords } from "@/components/motion/SplitWords";

test("renders an accessible heading with the full sentence", () => {
  render(<SplitWords as="h1" text="Everything your business runs on. One OS." highlightLast={2} />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
});

test("word spans do not hold a permanent will-change layer after their one-shot entrance", () => {
  render(<SplitWords as="h1" text="Everything your business runs on. One OS." highlightLast={2} />);
  const words = screen.getByRole("heading", { level: 1 }).querySelectorAll("[data-reveal]");
  expect(words.length).toBeGreaterThan(0);
  for (const word of words) expect(word).not.toHaveClass("will-change-transform");
});

test("keeps a real space between words outside the inline-block word boxes", () => {
  render(<SplitWords as="h1" text="Everything your business runs on. One OS." highlightLast={2} />);
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading.textContent).toBe("Everything your business runs on. One OS.");
  for (const box of heading.querySelectorAll(":scope > span")) {
    expect(box.textContent).not.toMatch(/\s$/);
  }
});
