import type { LucideIcon } from "lucide-react";
import { PenLine, RefreshCw, Sparkles, FileCheck } from "lucide-react";

export type WorkflowStep = { title: string; body: string; icon: LucideIcon };

export const workflowSteps: WorkflowStep[] = [
  { title: "Record it once", body: "An invoice is raised, a salary is approved, stock is received. One entry, where the work happens.", icon: PenLine },
  { title: "Every module syncs", body: "Ledgers, stock, GST registers and dashboards update in the same instant. Nothing is re-typed.", icon: RefreshCw },
  { title: "AI flags what's off", body: "Duplicate vendors, mismatched ITC, a payslip that jumped 40% — surfaced before they become problems.", icon: Sparkles },
  { title: "Reports and returns follow", body: "Month-end reports and GST, TDS and ROC filings are prepared from the same data, ready for review.", icon: FileCheck },
];
