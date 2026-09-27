import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { modules } from "@/content/modules";
import { stats, trustHeadline } from "@/content/stats";
import { expertServices } from "@/content/experts";
import { site } from "@/content/site";
import { TrustBar } from "@/components/sections/TrustBar";
import { ExpertHelp } from "@/components/sections/ExpertHelp";

const source = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
/** The source line that defines `key`, plus the line above it only when that line is a comment (a block-level marker). */
const definitionWithContext = (rel: string, key: string) => {
  const lines = source(rel).split(/\r?\n/);
  const i = lines.findIndex((l) => new RegExp(`^\\s*(export const )?${key}\\b`).test(l));
  expect(i, `${key} not found in ${rel}`).toBeGreaterThanOrEqual(0);
  const above = lines[i - 1] ?? "";
  return /^\s*\/\//.test(above) ? `${above}\n${lines[i]}` : lines[i];
};

describe("module count", () => {
  test("the modules stat equals the real number of modules", () => {
    const stat = stats.find((s) => /modules/i.test(s.label));
    expect(stat?.value).toBe(modules.length);
    expect(stat?.suffix).toBe("");
  });

  test("the trust headline states the real module count and never 15", () => {
    expect(trustHeadline).toContain(`${modules.length} modules`);
    expect(trustHeadline).not.toMatch(/\b15\b/);
  });

  test("TrustBar renders the headline from content", () => {
    render(<TrustBar />);
    expect(screen.getByText(trustHeadline)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/15\+?\s*modules/i);
  });
});

describe("fictional content sits in content/ with a PLACEHOLDER marker", () => {
  test("trust headline is marked", () => {
    expect(definitionWithContext("content/stats.ts", "trustHeadline")).toContain("PLACEHOLDER");
  });

  test("about.ts marks the origin story and the security/uptime figures", () => {
    expect(definitionWithContext("content/about.ts", "story")).toContain("PLACEHOLDER");
    expect(definitionWithContext("content/about.ts", "security")).toContain("PLACEHOLDER");
  });

  test("expert services live in content/experts.ts, marked, and ExpertHelp renders them", () => {
    expect(source("content/experts.ts")).toContain("PLACEHOLDER");
    expect(expertServices.length).toBeGreaterThanOrEqual(4);
    render(<ExpertHelp />);
    for (const s of expertServices) expect(screen.getByRole("heading", { level: 3, name: s.title })).toBeInTheDocument();
  });

  test("site hours are marked and the tel: link is derived from the phone number", () => {
    expect(definitionWithContext("content/site.ts", "hours")).toContain("PLACEHOLDER");
    expect(site.phoneHref).toBe(`tel:+${site.phone.replace(/\D/g, "")}`);
  });
});
