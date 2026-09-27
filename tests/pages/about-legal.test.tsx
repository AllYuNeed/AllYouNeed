import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";
import TermsPage from "@/app/terms/page";
import PrivacyPage from "@/app/privacy/page";
import RefundPage from "@/app/refund/page";
import { about } from "@/content/about";

test("about page renders mission, values and security", () => {
  render(<AboutPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/growing businesses/i);
  for (const v of about.values) expect(screen.getByRole("heading", { level: 3, name: v.title })).toBeInTheDocument();
  expect(screen.getByText(/designed to align with/i)).toBeInTheDocument();
});

test.each([
  ["terms", TermsPage, /terms & conditions/i],
  ["privacy", PrivacyPage, /privacy policy/i],
  ["refund", RefundPage, /refund policy/i],
] as const)("%s page renders the document with a review notice and TOC", (_, Page, title) => {
  const { unmount } = render(<Page />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
  expect(screen.getByText(/have a lawyer review/i)).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: /contents/i }).querySelectorAll("a").length).toBeGreaterThanOrEqual(4);
  expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  expect(screen.getByText(/last updated/i)).toHaveTextContent("27 September 2026");
  expect(document.getElementById("section-1")).toHaveClass("scroll-mt-28");
  unmount();
});
