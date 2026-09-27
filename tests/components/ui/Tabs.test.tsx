import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "accounting", label: "Accounting" },
  { id: "crm", label: "CRM" },
];

function Harness({ onChange }: { onChange?: (id: string) => void }) {
  const [value, setValue] = useState("dashboard");
  return (
    <Tabs
      tabs={tabs}
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange?.(id);
      }}
      ariaLabel="Modules"
    />
  );
}

test("has tablist semantics and roving tabindex", () => {
  render(<Harness />);
  expect(screen.getByRole("tablist", { name: "Modules" })).toBeInTheDocument();
  const [a, b] = screen.getAllByRole("tab");
  expect(a).toHaveAttribute("aria-selected", "true");
  expect(a).toHaveAttribute("tabindex", "0");
  expect(b).toHaveAttribute("aria-selected", "false");
  expect(b).toHaveAttribute("tabindex", "-1");
  expect(a).toHaveAttribute("id", "dashboard-tab");
  expect(a).toHaveAttribute("aria-controls", "dashboard-panel");
});

test("arrow keys, Home and End move selection and focus", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Harness onChange={onChange} />);
  const tabsEls = screen.getAllByRole("tab");
  tabsEls[0].focus();
  await user.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenLastCalledWith("accounting");
  expect(screen.getAllByRole("tab")[1]).toHaveFocus();
  await user.keyboard("{End}");
  expect(onChange).toHaveBeenLastCalledWith("crm");
  await user.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenLastCalledWith("dashboard");
  await user.keyboard("{Home}");
  expect(onChange).toHaveBeenLastCalledWith("dashboard");
  await user.keyboard("{ArrowLeft}");
  expect(onChange).toHaveBeenLastCalledWith("crm");
});

test("click selects", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole("tab", { name: "CRM" }));
  expect(screen.getByRole("tab", { name: "CRM" })).toHaveAttribute("aria-selected", "true");
});

test("only the selected tab points aria-controls at a panel, so no reference dangles", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  const withControls = () => screen.getAllByRole("tab").filter((t) => t.hasAttribute("aria-controls"));
  expect(withControls()).toEqual([screen.getByRole("tab", { name: "Dashboard" })]);
  await user.click(screen.getByRole("tab", { name: "CRM" }));
  expect(withControls()).toEqual([screen.getByRole("tab", { name: "CRM" })]);
  expect(screen.getByRole("tab", { name: "CRM" })).toHaveAttribute("aria-controls", "crm-panel");
});
