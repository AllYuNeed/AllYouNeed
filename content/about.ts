import type { LucideIcon } from "lucide-react";
import { Heart, ShieldCheck, Zap, Handshake, Lock, Server, KeyRound, Eye } from "lucide-react";

export const about = {
  mission: "Give every growing Indian business the operating system that large companies take for granted — without the price tag or the consultants.",
  // PLACEHOLDER — the founding story will be supplied later; paragraphs 1 and 3 are labelled placeholders, not facts.
  story: [
    "Placeholder: the Allyouneed founding story goes here. Who started it, what problem they kept running into, and why it mattered enough to build a company around.",
    "We built the platform we wished we had: one database, one login, every department. Enter a fact once — a sale, a salary, a stock receipt — and let everything else follow, including the filings.",
    "Placeholder: a short paragraph on who Allyouneed is for today and the team behind it, to be supplied.",
  ],
  values: [
    { title: "One truth", body: "If two screens disagree, the software is wrong. We remove re-entry wherever it exists.", icon: Zap },
    { title: "Compliance is a feature", body: "Filing on time shouldn't need heroics. Due dates and returns are part of the product, not an add-on.", icon: ShieldCheck },
    { title: "Plain language", body: "No jargon in the UI, no surprises on the bill, no fine print in the policies.", icon: Heart },
    { title: "Built with customers", body: "Every module started as a request from a business that needed it. Most still ship that way.", icon: Handshake },
  ] as { title: string; body: string; icon: LucideIcon }[],
  // PLACEHOLDER — confirm every security statement against the real infrastructure before launch. No uptime figures until measured.
  security: [
    { title: "Encrypted everywhere", body: "Encrypted in transit and at rest. Data-residency details to be confirmed.", icon: Lock },
    { title: "Role-based access", body: "Granular permissions per module, branch and record, with audit logs.", icon: KeyRound },
    { title: "Backups & uptime", body: "Backups and point-in-time recovery. Uptime commitments to be confirmed.", icon: Server },
    { title: "Privacy by design", body: "Built to align with the DPDP Act 2023 and GDPR principles; you own your data and can export it any time.", icon: Eye },
  ] as { title: string; body: string; icon: LucideIcon }[],
} as const;
