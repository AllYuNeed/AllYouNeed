import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";
import { LogoMark } from "@/components/brand/LogoMark";

test("LogoMark is an accessible image", () => {
  render(<LogoMark />);
  expect(screen.getByRole("img", { name: "Allyouneed" })).toBeInTheDocument();
});

test("Logo renders the wordmark and links home", () => {
  render(<Logo href="/" />);
  const link = screen.getByRole("link", { name: /allyouneed home/i });
  expect(link).toHaveAttribute("href", "/");
  expect(link).toHaveTextContent("allyouneed");
});

test("Logo without href renders no link", () => {
  render(<Logo />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("need")).toBeInTheDocument();
});
