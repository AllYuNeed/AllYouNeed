import { describe, test, expect, vi, afterEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { render, screen } from "@testing-library/react";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ModuleShowcase } from "@/components/sections/ModuleShowcase";
import { PricingTable } from "@/components/sections/PricingTable";
import { Navbar } from "@/components/layout/Navbar";
import { FinalCta } from "@/components/sections/FinalCta";
import { Integrations } from "@/components/sections/Integrations";
import { AuthLayout } from "@/components/sections/AuthLayout";
import { FeatureDetail } from "@/components/sections/FeatureDetail";
import { modules } from "@/content/modules";

afterEach(() => {
  route.pathname = "/";
});

const root = process.cwd();
const css = readFileSync(join(root, "app/globals.css"), "utf8");

/** Declarations of the first top-level rule for `selector` (":root" or ".dark"). */
const rule = (selector: string) => {
  const m = css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.:]/g, "\\$&")}\\s*\\{([^}]*)\\}`));
  expect(m, `${selector} block`).not.toBeNull();
  return m![1];
};
const token = (selector: string, name: string) => {
  const m = rule(selector).match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  expect(m, `--${name} in ${selector}`).not.toBeNull();
  return m![1].toUpperCase();
};

// WCAG 2.x relative luminance and contrast ratio.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("colour tokens", () => {
  test("the spec's colour tokens keep their exact values", () => {
    expect(token(":root", "primary")).toBe("#534AB7");
    expect(token(":root", "primary-soft")).toBe("#EEEDFE");
    expect(token(".dark", "primary")).toBe("#7F77DD");
    expect(token(".dark", "primary-soft")).toBe("#26215C");
  });

  test("white text on primary-solid meets WCAG AA (4.5:1) in both themes", () => {
    expect(token(":root", "primary-solid")).toBe("#534AB7");
    expect(token(".dark", "primary-solid")).toBe("#6A61CF");
    for (const theme of [":root", ".dark"]) {
      expect(contrast("#FFFFFF", token(theme, "primary-solid"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("primary-ink on primary-soft meets WCAG AA (4.5:1) in both themes", () => {
    expect(token(":root", "primary-ink")).toBe("#534AB7");
    expect(token(".dark", "primary-ink")).toBe("#C9C5F5");
    for (const theme of [":root", ".dark"]) {
      expect(contrast(token(theme, "primary-ink"), token(theme, "primary-soft"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("both ink tokens are mapped into Tailwind's theme", () => {
    expect(css).toMatch(/--color-primary-solid:\s*var\(--primary-solid\)/);
    expect(css).toMatch(/--color-primary-ink:\s*var\(--primary-ink\)/);
  });
});

describe("class usage", () => {
  const files = (dir: string): string[] =>
    readdirSync(join(root, dir)).flatMap((name) => {
      const rel = join(dir, name);
      return statSync(join(root, rel)).isDirectory() ? files(rel) : /\.tsx?$/.test(name) ? [rel] : [];
    });
  const literals = (src: string) => src.match(/"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) ?? [];

  const legacyFill = /(?<![\w-])bg-primary(?![\w/-])/; // the spec token as a fill (not -soft, -solid or /alpha)
  const whiteText = /(?<![\w-])text-white(?![\w-])/;
  const softFill = /(?<![\w-])bg-primary-soft(?![\w/-])/;
  const legacyInk = /(?<![\w-])text-primary(?![\w/-])/;

  test("no class string puts white text on bg-primary or text-primary on bg-primary-soft", () => {
    const violations: string[] = [];
    for (const file of [...files("components"), ...files("app")]) {
      for (const lit of literals(readFileSync(join(root, file), "utf8"))) {
        if (legacyFill.test(lit) && whiteText.test(lit)) violations.push(`${relative(root, join(root, file))}: white on bg-primary: ${lit}`);
        if (softFill.test(lit) && legacyInk.test(lit)) violations.push(`${relative(root, join(root, file))}: text-primary on bg-primary-soft: ${lit}`);
      }
    }
    expect(violations).toEqual([]);
  });

  test("the primary Button fills with primary-solid and the primary Badge uses primary-ink", () => {
    render(
      <>
        <Button>Start free</Button>
        <Badge>Eyebrow</Badge>
      </>
    );
    expect(screen.getByRole("button", { name: "Start free" }).className).toMatch(/(?<![\w-])bg-primary-solid\b/);
    expect(screen.getByText("Eyebrow").className).toMatch(/(?<![\w-])text-primary-ink\b/);
  });

  test("the active showcase tab and billing option sit on a primary-solid pill", () => {
    render(
      <>
        <ModuleShowcase />
        <PricingTable />
      </>
    );
    for (const active of [screen.getByRole("tab", { selected: true }), screen.getByRole("radio", { checked: true })]) {
      expect(active.className).toMatch(/(?<![\w-])text-white\b/);
      const fills = [...active.querySelectorAll("span")].map((s) => s.className);
      expect(fills.some((c) => /(?<![\w-])bg-primary-solid\b/.test(c))).toBe(true);
      expect(fills.some((c) => legacyFill.test(c))).toBe(false);
    }
  });

  test("the active navbar item uses primary-ink on its primary-soft pill", () => {
    route.pathname = "/pricing/";
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: "Pricing" }).find((l) => l.getAttribute("aria-current") === "page")!;
    expect(link.className).toMatch(/(?<![\w-])text-primary-ink\b/);
    expect(link.querySelector("span")?.className).toMatch(softFill);
  });
});

describe("white text on the indigo gradient panels in dark mode", () => {
  // Spec §6: text/background pairs meet WCAG AA. In dark mode the panels carrying white text use a deeper indigo
  // gradient (controller ruling); every white text style is checked against every stop it can sit on, with any
  // translucent white/black fill between the text and the panel composited over that stop.
  const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const rgbHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  const over = (top: string, alpha: number, below: string) => {
    const [t, b] = [hexRgb(top), hexRgb(below)];
    return rgbHex(t.map((v, i) => alpha * v + (1 - alpha) * b[i]));
  };

  const classesOf = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  /** The dark-mode value of a utility group on one element: `dark:` wins over the unprefixed class. */
  const darkClass = (el: Element, test: (value: string) => boolean) => {
    const cls = classesOf(el);
    return cls.map((c) => /^dark:(.+)$/.exec(c)?.[1]).find((v): v is string => !!v && test(v)) ?? cls.find((c) => !c.includes(":") && test(c));
  };
  const colour = (value: string) => {
    if (value === "primary" || value === "primary-solid") return token(".dark", value);
    const hex = /^\[(#[0-9a-fA-F]{6})\]$/.exec(value)?.[1];
    expect(hex, `resolvable gradient stop ${value}`).toBeDefined();
    return hex!.toUpperCase();
  };
  const darkStops = (panel: Element) =>
    (["from", "via", "to"] as const).flatMap((stop) => {
      const cls = darkClass(panel, (c) => c.startsWith(`${stop}-`));
      return cls ? [colour(cls.slice(stop.length + 1))] : [];
    });

  const isTextColour = (c: string) => /^text-(?!(?:xs|sm|base|lg|xl|\dxl|left|center|right|justify|balance|pretty|\[\d))/.test(c);
  const isSize = (c: string) => /^text-(?:xs|sm|base|lg|xl|\dxl)$/.test(c);
  const sizes: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48 };
  const weights: Record<string, number> = { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };

  /** Walks from a text-bearing element up to the panel; null when the text is not white or sits on an opaque fill. */
  function whiteTextOnPanel(el: Element, panel: Element) {
    let alpha: number | null = null;
    let size: number | null = null;
    let weight: number | null = null;
    const fills: { hex: string; alpha: number }[] = [];
    for (let node: Element | null = el; node; node = node === panel ? null : node.parentElement) {
      const text = alpha === null ? darkClass(node, isTextColour) : undefined;
      if (text) {
        const white = /^text-white(?:\/(\d+))?$/.exec(text);
        if (!white) return null;
        alpha = white[1] ? Number(white[1]) / 100 : 1;
      }
      size ??= (() => { const c = classesOf(node).find((x) => isSize(x)); return c ? sizes[c.slice(5)] : null; })();
      weight ??= (() => { const c = classesOf(node).find((x) => /^font-(?:normal|medium|semibold|bold|extrabold|black)$/.test(x)); return c ? weights[c.slice(5)] : null; })();
      if (node === panel) break;
      const bg = darkClass(node, (c) => c.startsWith("bg-") && !c.startsWith("bg-gradient") && !c.startsWith("bg-clip"));
      if (bg) {
        const tint = /^bg-(white|black)\/(\d+)$/.exec(bg);
        if (!tint) return null; // an opaque surface (bg-white chip, browser frame): not on the gradient
        fills.unshift({ hex: tint[1] === "white" ? "#FFFFFF" : "#000000", alpha: Number(tint[2]) / 100 });
      }
    }
    if (alpha === null) return null;
    const px = size ?? 16;
    const large = px >= 24 || (px >= 18.66 && (weight ?? 400) >= 700);
    return { alpha, fills, large };
  }

  const panelsOf = (container: HTMLElement) =>
    [...container.querySelectorAll("[class*='bg-gradient-to-']")].filter((el) => classesOf(el).includes("text-white"));

  // The ruling's deeper dark gradient: primary-solid (#6A61CF) through #5A51C0 to #4B43A6; two-stop panels keep two.
  const threeStop = ["#6A61CF", "#5A51C0", "#4B43A6"];
  const twoStop = ["#6A61CF", "#4B43A6"];
  const cases: [string, () => React.ReactElement, string[]][] = [
    ["FinalCta", () => <FinalCta />, threeStop],
    ["Integrations AI card", () => <Integrations />, twoStop],
    ["AuthLayout brand panel", () => <AuthLayout title="Log in" lead="Welcome back."><p>form</p></AuthLayout>, threeStop],
    ["FeatureDetail icon tile", () => <FeatureDetail module={modules.find((mod) => mod.mockup === "none")!} index={0} />, twoStop],
  ];

  test.each(cases)("%s: every white text style meets AA against every dark gradient stop", (_name, ui, expectedStops) => {
    const { container } = render(ui());
    const panels = panelsOf(container);
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    const stops = darkStops(panel);
    expect(stops).toEqual(expectedStops);

    const failures: string[] = [];
    let checked = 0;
    const textNodes = [...panel.querySelectorAll("*"), panel].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()));
    for (const el of textNodes) {
      const style = whiteTextOnPanel(el, panel);
      if (!style) continue;
      for (const stop of stops) {
        const bg = style.fills.reduce((below, f) => over(f.hex, f.alpha, below), stop);
        const ratio = contrast(over("#FFFFFF", style.alpha, bg), bg);
        const min = style.large ? 3 : 4.5;
        checked++;
        if (ratio < min) failures.push(`"${el.textContent!.trim().slice(0, 30)}" white/${style.alpha * 100} on ${bg} (stop ${stop}): ${ratio.toFixed(2)} < ${min}`);
      }
    }
    // Icons (non-text graphics, 3:1) are drawn in the inherited white.
    for (const icon of panel.querySelectorAll("svg")) {
      const style = whiteTextOnPanel(icon, panel);
      if (!style) continue;
      for (const stop of stops) {
        const bg = style.fills.reduce((below, f) => over(f.hex, f.alpha, below), stop);
        checked++;
        const ratio = contrast(over("#FFFFFF", style.alpha, bg), bg);
        if (ratio < 3) failures.push(`icon white/${style.alpha * 100} on ${bg}: ${ratio.toFixed(2)} < 3`);
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
