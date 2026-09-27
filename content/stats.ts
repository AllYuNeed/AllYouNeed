import { modules } from "./modules";

export type Stat = { value: number; suffix: string; label: string; decimals?: number };

// PLACEHOLDER — replace with real figures before launch. The module count is real: it follows content/modules.ts.
export const stats: Stat[] = [
  { value: 200, suffix: "+", label: "Organisations" },
  { value: modules.length, suffix: "", label: "Modules, one login" },
  { value: 40, suffix: "K+", label: "Employees managed" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", decimals: 1 },
];

// PLACEHOLDER — the customer count is fictional; the module count follows content/modules.ts.
export const trustHeadline = `Trusted by 200+ growing Indian businesses · ${modules.length} modules, one login`;

// PLACEHOLDER — fictional customer names for the trust marquee.
export const trustLogos: string[] = [
  "Meridian Foods",
  "Kaveri Textiles",
  "Nimbus Logistics",
  "Arka Dental Care",
  "Suryodaya Schools",
  "Lumen Retail",
  "Trident Autoworks",
  "Pratham Pharma",
  "Bluefin Exports",
  "Vasant Interiors",
];
