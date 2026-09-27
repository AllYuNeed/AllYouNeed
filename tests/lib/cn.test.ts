import { test, expect } from "vitest";
import { cn } from "@/lib/cn";

test("merges conditional classes and resolves tailwind conflicts", () => {
  expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
});
