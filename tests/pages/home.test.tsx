import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("home page renders every section landmark in order", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "Everything your business runs on. One OS." })).toBeInTheDocument();
  const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent ?? "");
  const expectedOrder = [
    /whole business/i,
    /every department, one screen away/i,
    /everything a growing company needs/i,
    /connected to how you work/i,
    /run the business from your phone/i,
    /record once/i,
    /every tax\. one place to file it/i,
    /incorporation to year end/i,
    /files their return in minutes/i,
    /a professional, when you need one/i,
    /teams that switched/i,
    /run your whole business on allyouneed/i,
  ];
  let cursor = 0;
  for (const re of expectedOrder) {
    const idx = h2s.findIndex((t, i) => i >= cursor && re.test(t));
    expect(idx, `missing or out of order: ${re}`).toBeGreaterThanOrEqual(cursor);
    cursor = idx + 1;
  }
});
