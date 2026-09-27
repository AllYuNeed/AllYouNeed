import type { LucideIcon } from "lucide-react";
import {
  Users,
  Wallet,
  BookOpen,
  Target,
  Package,
  Fingerprint,
  Landmark,
  FolderKanban,
  Laptop,
  ChartColumn,
  MessageSquare,
  Plug,
} from "lucide-react";

export type MockupKind = "dashboard" | "accounting" | "inventory" | "pos" | "crm" | "itr" | "none";

export type Module = {
  slug: string;
  name: string;
  short: string;
  description: string;
  bullets: string[];
  /** Short labels shown on the illustration card of modules with `mockup: "none"`. */
  chips?: string[];
  icon: LucideIcon;
  mockup: MockupKind;
};

export const modules: Module[] = [
  {
    slug: "hr",
    name: "Employee & HR",
    short: "One record per person, from offer letter to exit.",
    description:
      "Keep every employee's profile, documents, leave, and lifecycle events in one place. Onboarding checklists, policy acknowledgements and org charts update themselves as people join, move teams or leave.",
    bullets: [
      "Digital onboarding with e-signed offer letters and document collection",
      "Leave types, holiday calendars and approval chains per location",
      "Org chart, reporting lines and role-based access",
      "Employee self-service for payslips, Form 16 and reimbursements",
      "Exit workflow with full-and-final settlement hand-off to payroll",
    ],
    icon: Users,
    mockup: "dashboard",
  },
  {
    slug: "payroll",
    name: "Payroll",
    short: "Run salaries in minutes, with PF, ESI, PT and TDS built in.",
    description:
      "Payroll reads attendance, leave and reimbursements directly, so there is nothing to re-enter. Statutory deductions are calculated per state and filed from the same screen you approve salaries on.",
    bullets: [
      "Salary structures with CTC breakups, arrears and variable pay",
      "Automatic PF, ESI, Professional Tax and LWF by state",
      "TDS on salary with investment declarations and proofs",
      "Bank transfer files and payslips in one click",
      "Form 16 generation and 24Q filing from payroll data",
    ],
    icon: Wallet,
    mockup: "dashboard",
  },
  {
    slug: "accounting",
    name: "Accounting",
    short: "Double-entry books that write themselves.",
    description:
      "Every invoice, purchase, payroll run and expense posts to the ledger automatically. Reconcile bank feeds, close the month and hand your CA a trial balance without a spreadsheet in sight.",
    bullets: [
      "Chart of accounts with cost centres and multi-branch books",
      "Sales and purchase invoices with e-invoicing (IRN) and e-way bills",
      "Bank reconciliation with rule-based matching",
      "Receivables and payables ageing, reminders and credit notes",
      "P&L, balance sheet, cash flow and GST-ready reports",
      "Audit trail on every entry, as required under the Companies Act",
    ],
    icon: BookOpen,
    mockup: "accounting",
  },
  {
    slug: "crm",
    name: "CRM & Leads",
    short: "Capture every lead, follow up on time, close more.",
    description:
      "Leads flow in from your website, WhatsApp, Meta ads and listing sites into one pipeline. Assign, follow up and quote without leaving the board, and see exactly which channel pays for itself.",
    bullets: [
      "Kanban pipeline with stages, owners and rotting alerts",
      "Lead capture from web forms, WhatsApp, Meta and Google Business",
      "Quotes and proforma invoices that convert to sales orders",
      "Call, WhatsApp and email logging on the contact timeline",
      "Source-wise conversion and revenue reports",
    ],
    icon: Target,
    mockup: "crm",
  },
  {
    slug: "inventory",
    name: "Inventory & POS",
    short: "Stock, batches and billing across every counter and warehouse.",
    description:
      "Track stock by location, batch and expiry, bill at the counter with barcode scanning, and let purchase suggestions fire before you run out. Every sale posts to accounting and GST instantly.",
    bullets: [
      "Multi-warehouse stock with transfers and adjustments",
      "Batch, serial and expiry tracking",
      "Touch-friendly POS with barcode scanning and split payments",
      "Reorder levels and automatic purchase suggestions",
      "Stock valuation (FIFO / weighted average) and GST HSN summaries",
    ],
    icon: Package,
    mockup: "pos",
  },
  {
    slug: "attendance",
    name: "Attendance",
    short: "Biometric, mobile or web check-ins, straight into payroll.",
    description:
      "Capture attendance from biometric devices, geo-fenced mobile punches or the web. Shifts, overtime and late marks are computed by policy and feed payroll without a single export.",
    bullets: [
      "Biometric device sync and geo-fenced mobile check-in",
      "Shift rosters, week-offs and rotational schedules",
      "Overtime, late-mark and short-leave rules",
      "Regularisation requests with manager approval",
      "Muster roll and attendance registers for inspections",
    ],
    icon: Fingerprint,
    mockup: "dashboard",
  },
  {
    slug: "tax-filing",
    name: "Tax Filing",
    short: "GST, TDS, ITR and ROC — filed from the data you already have.",
    description:
      "Returns are prepared from your live books, reconciled against the government portal, and filed with a review step. Due dates, challans and acknowledgements live on one compliance calendar.",
    bullets: [
      "GSTR-1, GSTR-3B and GSTR-9 with 2A/2B reconciliation",
      "TDS returns (24Q, 26Q, 27Q) and Form 16 / 16A",
      "Corporate and individual income-tax returns with advance-tax planner",
      "ROC filings: AOC-4, MGT-7, DIR-3 KYC",
      "Compliance calendar with reminders and status tracking",
    ],
    icon: Landmark,
    mockup: "itr",
  },
  {
    slug: "projects",
    name: "Projects",
    short: "Plan work, log time, bill clients — all connected.",
    description:
      "Break projects into tasks and milestones, log time against them and turn approved hours into invoices. Profitability per project is visible because costs come from payroll and purchases automatically.",
    bullets: [
      "Boards, lists and Gantt views with dependencies",
      "Timesheets with approval and billable / non-billable split",
      "Milestone-based invoicing to accounting",
      "Project budgets versus actual cost from payroll and purchases",
      "Client portal for status and approvals",
    ],
    icon: FolderKanban,
    mockup: "dashboard",
  },
  {
    slug: "assets",
    name: "Assets",
    short: "Every laptop, machine and licence — who has it, what it's worth.",
    description:
      "Register fixed assets and IT equipment, assign them to people or locations and let depreciation post to the books on schedule. Maintenance and warranty reminders keep surprises away.",
    bullets: [
      "Asset register with QR tags and photos",
      "Assignment to employees, sites or departments",
      "Depreciation schedules (Companies Act and Income Tax rates)",
      "Warranty, AMC and maintenance reminders",
      "Disposal and write-off workflow with ledger posting",
    ],
    chips: ["QR asset tags", "Assignments", "Depreciation", "AMC reminders"],
    icon: Laptop,
    mockup: "none",
  },
  {
    slug: "reports",
    name: "Reports",
    short: "Dashboards for founders, drill-downs for finance.",
    description:
      "Because every module shares one database, reports need no imports. Build dashboards per role, schedule them to inboxes, and drill from a KPI down to the exact voucher behind it.",
    bullets: [
      "Founder dashboard: cash, receivables, payroll cost, pipeline",
      "Drill-down from any number to the source entry",
      "Scheduled email and WhatsApp report delivery",
      "Custom report builder with filters and pivots",
      "Export to Excel, PDF and Tally-compatible formats",
    ],
    icon: ChartColumn,
    mockup: "dashboard",
  },
  {
    slug: "communications",
    name: "Communications",
    short: "WhatsApp, SMS and email from inside every workflow.",
    description:
      "Send invoices, payslips, reminders and campaign messages on WhatsApp, SMS or email using approved templates. Replies land on the customer's or employee's timeline, not in someone's phone.",
    bullets: [
      "WhatsApp Business API templates for invoices and reminders",
      "Payment reminders that stop automatically when paid",
      "Broadcasts and campaigns with opt-out handling",
      "Internal announcements and policy acknowledgements",
      "Shared inbox with assignment and SLAs",
    ],
    icon: MessageSquare,
    mockup: "crm",
  },
  {
    slug: "integrations",
    name: "Integrations",
    short: "Payments, marketplaces, banks and your own tools.",
    description:
      "Connect payment gateways, marketplaces, telephony and banks, or build on the REST API and webhooks. Data arrives already mapped to the right module, so nothing needs re-keying.",
    bullets: [
      "Payment gateways with automatic receipt matching",
      "Meta lead ads, Google Business and listing-site lead sync",
      "Cloud telephony with click-to-call and call recording links",
      "Bank feeds and statement imports",
      "REST API, webhooks and CSV importers",
    ],
    chips: ["Payment gateways", "Lead sync", "Cloud telephony", "Bank feeds"],
    icon: Plug,
    mockup: "none",
  },
];

export function getModule(slug: string) {
  return modules.find((m) => m.slug === slug);
}
