import type { Plan } from "@/content/pricing";

export type Billing = "monthly" | "yearly";

export const YEARLY_DISCOUNT = 0.2;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatInr(n: number) {
  return inr.format(n);
}

export function yearlyTotal(monthly: number) {
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));
}

export function yearlyMonthlyEquivalent(monthly: number) {
  return Math.round(monthly * (1 - YEARLY_DISCOUNT));
}

export function priceFor(plan: Plan, billing: Billing): { amount: number | null; note: string } {
  if (plan.monthly === null) return { amount: null, note: "custom pricing" };
  if (plan.monthly === 0) return { amount: 0, note: "free forever" };
  if (billing === "monthly") return { amount: plan.monthly, note: "per month, billed monthly" };
  return {
    amount: yearlyMonthlyEquivalent(plan.monthly),
    note: `per month, ${formatInr(yearlyTotal(plan.monthly))} billed yearly`,
  };
}
