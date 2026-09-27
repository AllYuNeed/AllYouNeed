import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { AccountingMock } from "@/components/mockups/AccountingMock";
import { InventoryMock } from "@/components/mockups/InventoryMock";
import { PosMock } from "@/components/mockups/PosMock";
import { CrmMock } from "@/components/mockups/CrmMock";
import { ItrMock } from "@/components/mockups/ItrMock";
import { MockupFor } from "@/components/mockups";

test("frames render children and chrome", () => {
  render(
    <BrowserFrame url="app.allyouneed.in/dashboard">
      <p>inside</p>
    </BrowserFrame>
  );
  expect(screen.getByText("inside")).toBeInTheDocument();
  expect(screen.getByText("app.allyouneed.in/dashboard")).toBeInTheDocument();
  render(
    <PhoneFrame tone="dark">
      <p>phone</p>
    </PhoneFrame>
  );
  expect(screen.getByText("phone")).toBeInTheDocument();
});

test("mockups render their headline content", () => {
  render(<DashboardMock />);
  expect(screen.getByText(/cash in bank/i)).toBeInTheDocument();
  render(<AccountingMock />);
  expect(screen.getByText(/trial balance/i)).toBeInTheDocument();
  render(<InventoryMock />);
  expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  render(<PosMock />);
  expect(screen.getByText(/gst 18%/i)).toBeInTheDocument();
  render(<CrmMock />);
  expect(screen.getByText(/qualified/i)).toBeInTheDocument();
  render(<ItrMock />);
  expect(screen.getByText("Filed in 4 minutes")).toBeInTheDocument();
});

test("the POS bill header carries a sample GSTIN in the real 15-character format, in full and compact sizes", () => {
  for (const compact of [false, true]) {
    const { unmount } = render(<PosMock compact={compact} />);
    const gstin = screen.getByText(/^GSTIN /);
    expect(gstin).toHaveTextContent("GSTIN 29ABCDE1234F1Z5");
    expect(gstin.textContent!.replace("GSTIN ", "")).toMatch(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/);
    unmount();
  }
});

test("MockupFor maps kinds and returns null for none", () => {
  const { container } = render(<MockupFor kind="none" />);
  expect(container).toBeEmptyDOMElement();
  render(<MockupFor kind="crm" compact />);
  expect(screen.getByText(/qualified/i)).toBeInTheDocument();
});

test("frame chrome is hidden from assistive tech", () => {
  const { container } = render(
    <BrowserFrame>
      <p>x</p>
    </BrowserFrame>
  );
  expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3);
});

test("the rotating sample toasts are decorative: hidden from assistive tech and never a live region", () => {
  const { container } = render(<DashboardMock />);
  const toast = screen.getByText(/Invoice #1042 paid/);
  const region = toast.closest('[aria-hidden="true"]');
  expect(region).not.toBeNull();
  expect(container.querySelector("[aria-live]")).toBeNull();
});
