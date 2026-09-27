import type { LucideIcon } from "lucide-react";
import { Heart, ShieldCheck, Zap, Handshake, Lock, Server, KeyRound, Eye } from "lucide-react";

export const about = {
  mission: "Give every growing Indian business the operating system that large companies take for granted — without the price tag or the consultants.",
  // PLACEHOLDER — fictional origin story, security and uptime figures
  story: [
    "Allyouneed started when our founders ran a 40-person manufacturing business and counted the tools it took to run it: seven, plus a CA, plus a spreadsheet that nobody trusted. Payroll didn't talk to accounting, stock didn't talk to sales, and GST month was a week of reconciliation.",
    "We built the platform we wished we had: one database, one login, every department. Enter a fact once — a sale, a salary, a stock receipt — and let everything else follow, including the filings.",
    "Today Allyouneed runs businesses across retail, manufacturing, services, education and healthcare. We're a small team in Bengaluru, and we still answer support ourselves.",
  ],
  values: [
    { title: "One truth", body: "If two screens disagree, the software is wrong. We remove re-entry wherever it exists.", icon: Zap },
    { title: "Compliance is a feature", body: "Filing on time shouldn't need heroics. Due dates and returns are part of the product, not an add-on.", icon: ShieldCheck },
    { title: "Plain language", body: "No jargon in the UI, no surprises on the bill, no fine print in the policies.", icon: Heart },
    { title: "Built with customers", body: "Every module started as a request from a business that needed it. Most still ship that way.", icon: Handshake },
  ] as { title: string; body: string; icon: LucideIcon }[],
  // PLACEHOLDER — security and uptime figures; confirm against the real infrastructure before launch.
  security: [
    { title: "Encrypted everywhere", body: "TLS 1.2+ in transit, AES-256 at rest, in Indian data centres.", icon: Lock },
    { title: "Role-based access", body: "Granular permissions per module, branch and record, with audit logs.", icon: KeyRound },
    { title: "Backups & uptime", body: "Point-in-time recovery, daily off-site backups and a 99.9% uptime target.", icon: Server },
    { title: "Privacy by design", body: "Built to align with the DPDP Act 2023 and GDPR principles; you own your data and can export it any time.", icon: Eye },
  ] as { title: string; body: string; icon: LucideIcon }[],
} as const;
