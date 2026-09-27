import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select } from "@/components/ui/Select";

const options = [
  { value: "1-10", label: "1-10 people" },
  { value: "11-50", label: "11-50 people" },
];

test("starts on the placeholder instead of the first option", () => {
  render(<Select aria-label="Team size" placeholder="Choose a range" options={options} />);
  expect((screen.getByLabelText("Team size") as HTMLSelectElement).value).toBe("");
});

test("an explicit defaultValue still wins", () => {
  render(<Select aria-label="Team size" placeholder="Choose a range" options={options} defaultValue="11-50" />);
  expect((screen.getByLabelText("Team size") as HTMLSelectElement).value).toBe("11-50");
});
