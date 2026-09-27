import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Drop one module so any copy that hard-codes "12" (or "Twelve") instead of deriving the count shows up.
vi.mock("@/content/modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content/modules")>();
  return { ...actual, modules: actual.modules.slice(0, -1) };
});

import { modules } from "@/content/modules";
import { plans, comparisonRows } from "@/content/pricing";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { metadata as featuresMetadata } from "@/app/features/page";

describe("module count copy is derived from the modules list", () => {
  test("the mock really changes the count", () => {
    expect(modules).toHaveLength(11);
  });

  test("the Growth plan lists all modules by the real count", () => {
    const growth = plans.find((p) => p.id === "growth")!;
    expect(growth.features).toContain(`All ${modules.length} modules`);
    expect(growth.features.join(" ")).not.toMatch(/\b12\b/);
  });

  test("the comparison table's Modules row states the real count for every paid plan", () => {
    const row = comparisonRows.find((r) => r.label === "Modules")!;
    for (const plan of ["growth", "business", "enterprise"] as const) expect(row.values[plan]).toBe(`All ${modules.length}`);
  });

  test("the module grid eyebrow states the real count", () => {
    render(<ModuleGrid />);
    expect(screen.getByText(`${modules.length} core modules`)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\b12 core modules\b/);
  });

  test("the features page description states the real count", () => {
    expect(featuresMetadata.description).toMatch(new RegExp(`^${modules.length} modules — `));
    expect(featuresMetadata.description).not.toMatch(/twelve/i);
  });
});
