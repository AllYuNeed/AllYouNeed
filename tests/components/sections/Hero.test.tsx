import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";

test("hero has the h1, both CTAs and the dashboard mockup", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /start free/i })).toHaveAttribute("href", "/register/");
  expect(screen.getByRole("link", { name: /book a demo/i })).toHaveAttribute("href", "/contact/");
  expect(screen.getByText(/cash in bank/i)).toBeInTheDocument();
});
