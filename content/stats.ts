import { modules } from "./modules";

/** `value: null` is a placeholder: it renders as "XX" until the real figure is supplied. */
export type Stat = { value: number | null; suffix: string; label: string; decimals?: number };

// PLACEHOLDER — the real statistics will be supplied later; until then they show as "XX". Do not put invented figures here.
// The module count is real: it follows content/modules.ts.
export const stats: Stat[] = [
  { value: null, suffix: "+", label: "Organisations" },
  { value: modules.length, suffix: "", label: "Modules, one login" },
  { value: null, suffix: "+", label: "Employees managed" },
  { value: null, suffix: "%", label: "Uptime" },
];

/** True while any statistic above is still a placeholder; the trust bar then says so on the page. */
export const statsArePlaceholder = stats.some((s) => s.value === null);

// PLACEHOLDER — no customer claims until real ones are supplied; the module count follows content/modules.ts.
export const trustHeadline = `Customer logos and statistics are placeholders · ${modules.length} modules, one login`;

// PLACEHOLDER — customer names will be supplied later; these are generic labels, not real customers.
export const trustLogos: string[] = Array.from({ length: 8 }, (_, i) => `Customer name ${i + 1}`);
