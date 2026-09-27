import { modules } from "@/content/modules";

export type PlanId = "free" | "growth" | "business" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number | null; // INR per month, billed monthly; null = custom
  users: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

// PLACEHOLDER prices — edit freely; lib/pricing.ts derives yearly prices.
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    users: "Up to 5 users",
    description: "For new businesses getting their books and pipeline in order.",
    features: ["Accounting with GST-ready invoices", "CRM pipeline and lead capture forms", "1 branch, 1 GSTIN", "Community support"],
    cta: { label: "Start free", href: "/register/" },
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 999,
    users: "Up to 25 users",
    description: "Every module, GST filing included, for teams that are scaling.",
    features: [`All ${modules.length} modules`, "GSTR-1 and GSTR-3B filing", "Inventory and POS for up to 3 locations", "WhatsApp and payment gateway integrations", "Email and chat support"],
    cta: { label: "Start free trial", href: "/register/" },
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 2999,
    users: "Up to 100 users",
    description: "Payroll, TDS and multi-branch control for established companies.",
    features: ["Everything in Growth", "Payroll with PF, ESI, PT and TDS filing", "Unlimited branches and GSTINs", "Meta, Google Business and telephony integrations", "Priority support with a named account manager"],
    cta: { label: "Start free trial", href: "/register/" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    users: "Unlimited users",
    description: "Dedicated compliance team, SSO and custom integrations.",
    features: ["Everything in Business", "Dedicated chartered accountant", "SSO (SAML / Google Workspace) and audit logs", "Custom integrations and data residency options", "99.9% uptime SLA with 24×7 support"],
    cta: { label: "Contact sales", href: "/contact/" },
  },
];

export type ComparisonRow = { label: string; values: Record<PlanId, string | boolean> };

export const comparisonRows: ComparisonRow[] = [
  { label: "Users", values: { free: "5", growth: "25", business: "100", enterprise: "Unlimited" } },
  { label: "Modules", values: { free: "Accounting, CRM", growth: `All ${modules.length}`, business: `All ${modules.length}`, enterprise: `All ${modules.length}` } },
  { label: "Branches / GSTINs", values: { free: "1", growth: "3", business: "Unlimited", enterprise: "Unlimited" } },
  { label: "GST filing", values: { free: false, growth: true, business: true, enterprise: true } },
  { label: "Payroll & TDS filing", values: { free: false, growth: false, business: true, enterprise: true } },
  { label: "Integrations", values: { free: "Web forms", growth: "WhatsApp, payments", business: "All", enterprise: "All + custom" } },
  { label: "Dedicated CA", values: { free: false, growth: false, business: false, enterprise: true } },
  { label: "SSO & audit logs", values: { free: false, growth: false, business: false, enterprise: true } },
  { label: "Support", values: { free: "Community", growth: "Email, chat", business: "Priority", enterprise: "24×7" } },
];
