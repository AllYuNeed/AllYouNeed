import { describe, test, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { AccountingMock } from "@/components/mockups/AccountingMock";
import { InventoryMock } from "@/components/mockups/InventoryMock";
import { PosMock } from "@/components/mockups/PosMock";
import { ItrMock } from "@/components/mockups/ItrMock";
import { ValueProp } from "@/components/sections/ValueProp";
import { noscriptCss } from "@/lib/noscript";

/** Server HTML parsed into a detached container, as a browser without JS would receive it. */
const serverDom = (ui: React.ReactNode) => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(<MotionProvider>{ui}</MotionProvider>);
  return el;
};

/** Elements the server paints in an entrance-hidden state: faded out, transformed, or an undrawn SVG stroke. */
const entranceHidden = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement | SVGElement>("*")].filter((el) => {
    const style = el.getAttribute("style") ?? "";
    return /opacity:\s*0(?![.\d])/.test(style) || /transform:/.test(style) || /^0[\s,]/.test(el.getAttribute("stroke-dasharray") ?? "");
  });

const cases: [string, React.ReactNode][] = [
  ["DashboardMock", <DashboardMock key="d" />],
  ["DashboardMock compact", <DashboardMock key="dc" compact />],
  ["AccountingMock", <AccountingMock key="a" />],
  ["InventoryMock", <InventoryMock key="i" />],
  ["PosMock", <PosMock key="p" />],
  ["ItrMock", <ItrMock key="t" />],
  ["ValueProp", <ValueProp key="v" />],
];

describe("no-JS visibility", () => {
  test.each(cases)("%s: every entrance-hidden element carries data-reveal", (_, ui) => {
    const root = serverDom(ui);
    const hidden = entranceHidden(root);
    expect(hidden.length).toBeGreaterThan(0);
    const missing = hidden.filter((el) => !el.hasAttribute("data-reveal")).map((el) => `${el.tagName.toLowerCase()} style="${el.getAttribute("style") ?? ""}" dasharray="${el.getAttribute("stroke-dasharray") ?? ""}"`);
    expect(missing).toEqual([]);
  });

  test("the no-JS stylesheet also draws undrawn SVG strokes on data-reveal elements", () => {
    const rule = noscriptCss.match(/\[data-reveal\]\{([^}]*)\}/)?.[1] ?? "";
    for (const decl of ["opacity:1!important", "transform:none!important", "filter:none!important", "clip-path:none!important", "stroke-dasharray:none!important"]) {
      expect(rule).toContain(decl);
    }
  });

  test("the ITR badge text is in the server HTML", () => {
    expect(serverDom(<ItrMock />).textContent).toContain("Filed in 4 minutes");
  });
});
