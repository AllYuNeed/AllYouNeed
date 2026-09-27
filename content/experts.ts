import type { LucideIcon } from "lucide-react";
import { BadgeCheck, FileText, Scale, Users } from "lucide-react";

export type ExpertService = { icon: LucideIcon; title: string; body: string };

// PLACEHOLDER — the size of the chartered-accountant network is fictional; replace with the real figure.
export const expertServices: ExpertService[] = [
  { icon: Scale, title: "Statutory, tax and internal audits", body: "Audit-ready books, handed to an auditor from our network or yours." },
  { icon: FileText, title: "Tax notice support", body: "A GST or income-tax notice lands? A professional drafts the reply from your records." },
  { icon: BadgeCheck, title: "Advisory", body: "Structuring, incentives, transfer pricing and the questions that don't fit a help article." },
  { icon: Users, title: "200+ chartered accountants", body: "Vetted, rated and priced upfront. Engage for one filing or the whole year." }, // PLACEHOLDER count
];
