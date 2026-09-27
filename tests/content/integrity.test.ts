import { describe, test, expect } from "vitest";
import { modules } from "@/content/modules";
import { plans, comparisonRows } from "@/content/pricing";
import { taxCategories, complianceCalendar } from "@/content/tax";
import { faqs } from "@/content/faq";
import { testimonials } from "@/content/testimonials";
import { integrations } from "@/content/integrations";
import { stats, trustLogos } from "@/content/stats";
import { mainNav, footerColumns } from "@/content/nav";
import { termsDoc, privacyDoc, refundDoc } from "@/content/legal";

describe("modules", () => {
  test("there are 12 modules with complete data and unique slugs", () => {
    expect(modules).toHaveLength(12);
    const slugs = modules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(12);
    for (const m of modules) {
      expect(m.slug).toMatch(/^[a-z0-9-]+$/);
      expect(m.name.length).toBeGreaterThan(2);
      expect(m.short.length).toBeGreaterThan(10);
      expect(m.description.length).toBeGreaterThan(60);
      expect(m.bullets.length).toBeGreaterThanOrEqual(4);
      expect(m.bullets.length).toBeLessThanOrEqual(6);
      expect(m.icon).toBeDefined();
    }
  });
  test("modules without a mockup carry short, whole-phrase chips", () => {
    const bare = modules.filter((m) => m.mockup === "none");
    expect(bare.map((m) => m.slug)).toEqual(["assets", "integrations"]);
    for (const m of bare) {
      expect(m.chips?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(m.chips!.length).toBeLessThanOrEqual(6);
      for (const c of m.chips!) {
        expect(c.split(" ").length).toBeLessThanOrEqual(3);
        expect(c).not.toMatch(/[,(]|\bwith$|\band$/);
      }
    }
  });
});

describe("pricing", () => {
  test("four plans, one highlighted, Enterprise has no price", () => {
    expect(plans).toHaveLength(4);
    expect(plans.filter((p) => p.highlight)).toHaveLength(1);
    expect(new Set(plans.map((p) => p.id)).size).toBe(4);
    const enterprise = plans.find((p) => p.id === "enterprise")!;
    expect(enterprise.monthly).toBeNull();
    for (const p of plans) {
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.cta.href.startsWith("/")).toBe(true);
    }
  });
  test("comparison rows cover every plan", () => {
    for (const row of comparisonRows) {
      for (const p of plans) expect(row.values).toHaveProperty(p.id);
    }
  });
});

describe("tax", () => {
  test("six categories, each with filings", () => {
    expect(taxCategories).toHaveLength(6);
    for (const c of taxCategories) expect(c.filings.length).toBeGreaterThanOrEqual(4);
    expect(complianceCalendar.length).toBeGreaterThanOrEqual(6);
    for (const item of complianceCalendar) expect(item.day).toBeGreaterThanOrEqual(1);
  });
  test("calendar is ordered by day", () => {
    const days = complianceCalendar.map((c) => c.day);
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });
  test("quarterly TDS returns are due the month after each quarter, Q4 by 31 May", () => {
    const tds = complianceCalendar.find((c) => /quarterly tds return/i.test(c.title));
    expect(tds).toEqual({ day: 31, title: "Quarterly TDS return (24Q / 26Q), due 31 Jul, 31 Oct, 31 Jan; Q4 by 31 May", category: "TDS" });
  });
});

describe("misc content", () => {
  test("faqs, testimonials, integrations, stats, logos, nav", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(6);
    expect(testimonials).toHaveLength(3);
    expect(integrations.length).toBeGreaterThanOrEqual(6);
    expect(stats).toHaveLength(4);
    expect(trustLogos.length).toBeGreaterThanOrEqual(8);
    expect(mainNav.map((l) => l.href)).toEqual(["/features/", "/tax-compliance/", "/pricing/", "/about/", "/contact/"]);
    expect(footerColumns).toHaveLength(3);
  });
  test("legal docs have sections and a review notice", () => {
    for (const doc of [termsDoc, privacyDoc, refundDoc]) {
      expect(doc.sections.length).toBeGreaterThanOrEqual(4);
      expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
