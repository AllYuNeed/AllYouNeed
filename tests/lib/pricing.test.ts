import { test, expect } from "vitest";
import { formatInr, yearlyMonthlyEquivalent, yearlyTotal, priceFor, YEARLY_DISCOUNT } from "@/lib/pricing";
import { plans } from "@/content/pricing";

test("formatInr uses Indian grouping and no decimals", () => {
  expect(formatInr(0)).toBe("₹0");
  expect(formatInr(999)).toBe("₹999");
  expect(formatInr(2999)).toBe("₹2,999");
  expect(formatInr(123456)).toBe("₹1,23,456");
});

test("yearly pricing saves 20%", () => {
  expect(YEARLY_DISCOUNT).toBe(0.2);
  expect(yearlyTotal(1000)).toBe(9600);
  expect(yearlyMonthlyEquivalent(1000)).toBe(800);
  expect(yearlyMonthlyEquivalent(999)).toBe(799);
});

test("priceFor returns amount and note per billing mode", () => {
  const growth = plans.find((p) => p.id === "growth")!;
  expect(priceFor(growth, "monthly")).toEqual({ amount: 999, note: "per month, billed monthly" });
  expect(priceFor(growth, "yearly")).toEqual({ amount: 799, note: "per month, ₹9,590 billed yearly" });
  const free = plans.find((p) => p.id === "free")!;
  expect(priceFor(free, "yearly")).toEqual({ amount: 0, note: "free forever" });
  const ent = plans.find((p) => p.id === "enterprise")!;
  expect(priceFor(ent, "monthly")).toEqual({ amount: null, note: "custom pricing" });
});
