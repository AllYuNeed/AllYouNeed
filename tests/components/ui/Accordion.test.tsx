import { test, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "@/components/ui/Accordion";
import { renderToString } from "react-dom/server";
import { noscriptCss } from "@/lib/noscript";
import { MotionProvider } from "@/components/motion/MotionProvider";

const items = [
  { id: "a", q: "Is there a free plan?", a: "Yes, up to five users." },
  { id: "b", q: "Where is data stored?", a: "In India." },
];

test("one item open at a time, with aria wiring", async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  const [first, second] = screen.getAllByRole("button");
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(first).toHaveAttribute("aria-controls", "a-panel");
  await user.click(first);
  expect(first).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Yes, up to five users.")).toBeInTheDocument();
  await user.click(second);
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(second).toHaveAttribute("aria-expanded", "true");
  await user.click(second);
  expect(second).toHaveAttribute("aria-expanded", "false");
});

test("defaultOpen opens an item", () => {
  render(<Accordion items={items} defaultOpen="b" />);
  expect(screen.getByRole("button", { name: /where is data stored/i })).toHaveAttribute("aria-expanded", "true");
});

test("collapsed answers stay in the DOM behind the hidden attribute, so they exist without JS", () => {
  const { container } = render(<Accordion items={items} defaultOpen="a" />);
  const open = screen.getByText("Yes, up to five users.").closest("[data-accordion-panel]")!;
  const closed = screen.getByText("In India.").closest("[data-accordion-panel]")!;
  expect(open).not.toHaveAttribute("hidden");
  expect(closed).toHaveAttribute("hidden");
  expect(screen.getByText("In India.")).not.toBeVisible();
  expect(container.querySelectorAll("[data-accordion-panel]")).toHaveLength(items.length);
});

test("every trigger's aria-controls resolves to its labelled region, open or not", async () => {
  const user = userEvent.setup();
  render(
    <MotionProvider>
      <Accordion items={items} />
    </MotionProvider>
  );
  const check = () => {
    for (const trigger of screen.getAllByRole("button")) {
      const panel = document.getElementById(trigger.getAttribute("aria-controls")!);
      expect(panel).not.toBeNull();
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    }
  };
  check();
  await user.click(screen.getAllByRole("button")[1]);
  check();
  expect(document.getElementById("b-panel")).not.toHaveAttribute("hidden");
  expect(document.getElementById("a-panel")).toHaveAttribute("hidden");
  // The opened answer fades in (opacity/transform only) and settles fully visible.
  await waitFor(() => expect(screen.getByText("In India.")).toBeVisible());
});

test("opening a panel never animates its height", async () => {
  const user = userEvent.setup();
  render(
    <MotionProvider>
      <Accordion items={items} />
    </MotionProvider>
  );
  await user.click(screen.getAllByRole("button")[0]);
  const panel = document.getElementById("a-panel")!;
  const noHeight = () => {
    for (const el of [panel, ...panel.querySelectorAll("*")]) {
      expect(el.getAttribute("style") ?? "").not.toMatch(/height/);
    }
  };
  noHeight();
  await waitFor(() => expect(screen.getByText("Yes, up to five users.")).toBeVisible());
  noHeight();
});

test("server HTML carries every answer, and the default-open one is not at opacity 0", () => {
  const html = renderToString(<Accordion items={items} defaultOpen="a" />);
  expect(html).toContain("Yes, up to five users.");
  expect(html).toContain("In India.");
  expect(html).toMatch(/id="b-panel"[^>]*hidden=""|hidden=""[^>]*id="b-panel"/);
  const openPanel = html.slice(html.indexOf('id="a-panel"'), html.indexOf('id="b-trigger"'));
  expect(openPanel).not.toMatch(/opacity:\s*0/);
});

test("the no-JS stylesheet un-hides accordion panels from inside Tailwind's base layer", () => {
  // Tailwind 4 preflight hides [hidden] with `display:none !important` inside @layer base. Important declarations
  // in a layer beat unlayered important ones, so the override must live in that same layer to win on specificity.
  expect(noscriptCss).toMatch(/@layer base\s*\{[^}]*\[data-accordion-panel\]\[hidden\]\{display:block!important\}/);
  expect(noscriptCss).toMatch(/(?:^|\})\[data-reveal\]\{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important[;}]/);
});
