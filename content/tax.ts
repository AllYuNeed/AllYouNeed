import type { LucideIcon } from "lucide-react";
import { Receipt, Percent, Landmark, HandCoins, Building2, FileBadge } from "lucide-react";

export type TaxCategory = {
  slug: string;
  name: string;
  tagline: string;
  filings: string[];
  icon: LucideIcon;
};

export const taxCategories: TaxCategory[] = [
  {
    slug: "gst",
    name: "GST",
    tagline: "Returns prepared from your live sales and purchase registers.",
    filings: ["GSTR-1 (outward supplies)", "GSTR-3B (monthly summary and payment)", "GSTR-9 / 9C (annual return and reconciliation)", "GSTR-2A / 2B input-tax reconciliation", "E-invoicing (IRN) and e-way bills", "Composition scheme CMP-08"],
    icon: Receipt,
  },
  {
    slug: "tds",
    name: "TDS & TCS",
    tagline: "Deduct at source on salaries and vendors, deposit, file, issue certificates.",
    filings: ["24Q (salary TDS)", "26Q (non-salary TDS)", "27Q (payments to non-residents)", "27EQ (TCS)", "Form 16 and Form 16A certificates", "Monthly challan (ITNS 281) payments"],
    icon: Percent,
  },
  {
    slug: "income-tax",
    name: "Income tax",
    tagline: "Corporate and individual returns with an advance-tax planner.",
    filings: ["ITR-3 / ITR-4 (proprietors and professionals)", "ITR-5 (firms and LLPs)", "ITR-6 (companies)", "Advance tax instalments (June, September, December, March)", "Tax audit support (Form 3CA/3CB-3CD)", "Employee ITR-1 / ITR-2 from Form 16"],
    icon: Landmark,
  },
  {
    slug: "payroll-contributions",
    name: "Payroll contributions",
    tagline: "State-wise statutory deductions computed inside payroll.",
    filings: ["EPF (ECR upload and payment)", "ESI monthly contribution", "Professional Tax by state", "Labour Welfare Fund", "Gratuity and bonus registers"],
    icon: HandCoins,
  },
  {
    slug: "roc",
    name: "Company & ROC filings",
    tagline: "Annual filings and registers kept current from your books.",
    filings: ["AOC-4 (financial statements)", "MGT-7 / MGT-7A (annual return)", "DIR-3 KYC (director KYC)", "ADT-1 (auditor appointment)", "Statutory registers and board-meeting minutes", "LLP Form 8 and Form 11"],
    icon: Building2,
  },
  {
    slug: "registrations",
    name: "Registrations",
    tagline: "Get every number you need, from incorporation to import-export.",
    filings: ["Company / LLP incorporation (SPICe+)", "GST registration and amendments", "PF and ESI registration", "Professional Tax and Shops & Establishment", "Import Export Code (IEC)", "MSME / Udyam registration"],
    icon: FileBadge,
  },
];

export type CalendarItem = { day: number; title: string; category: string };

// Typical monthly due dates for a regular (non-QRMP) taxpayer.
export const complianceCalendar: CalendarItem[] = [
  { day: 7, title: "TDS / TCS deposit for previous month", category: "TDS" },
  { day: 11, title: "GSTR-1 for previous month", category: "GST" },
  { day: 13, title: "GSTR-1 IFF (QRMP taxpayers)", category: "GST" },
  { day: 15, title: "PF (ECR) and ESI contribution payment", category: "Payroll" },
  { day: 15, title: "Advance tax instalment (Jun, Sep, Dec, Mar)", category: "Income tax" },
  { day: 20, title: "GSTR-3B and GST payment", category: "GST" },
  { day: 30, title: "Professional Tax payment (state-specific)", category: "Payroll" },
  { day: 31, title: "Quarterly TDS return (24Q / 26Q), due 31 Jul, 31 Oct, 31 Jan; Q4 by 31 May", category: "TDS" },
];
