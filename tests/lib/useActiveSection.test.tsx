import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useActiveSection } from "@/lib/useActiveSection";

type Entry = { target: Element; isIntersecting: boolean; boundingClientRect: { top: number } };

let callback: ((entries: Entry[]) => void) | null = null;
const disconnect = vi.fn();
const original = window.IntersectionObserver;

beforeEach(() => {
  callback = null;
  disconnect.mockClear();
  class ControlledIO {
    constructor(cb: (entries: Entry[]) => void) {
      callback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect = disconnect;
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = ControlledIO as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  window.IntersectionObserver = original;
});

const ids = ["hr", "payroll", "crm"];

function Probe() {
  const active = useActiveSection(ids);
  return (
    <>
      {ids.map((id) => (
        <section key={id} id={id} />
      ))}
      <output>{active}</output>
    </>
  );
}

const el = (id: string) => document.getElementById(id)!;

test("starts on the first id", () => {
  render(<Probe />);
  expect(screen.getByRole("status")).toHaveTextContent("hr");
});

test("picks the top-most intersecting section", () => {
  render(<Probe />);
  act(() => {
    callback!([
      { target: el("crm"), isIntersecting: true, boundingClientRect: { top: 300 } },
      { target: el("payroll"), isIntersecting: true, boundingClientRect: { top: 120 } },
      { target: el("hr"), isIntersecting: false, boundingClientRect: { top: -400 } },
    ]);
  });
  expect(screen.getByRole("status")).toHaveTextContent("payroll");
});

test("ignores batches where nothing intersects", () => {
  render(<Probe />);
  act(() => {
    callback!([{ target: el("crm"), isIntersecting: true, boundingClientRect: { top: 200 } }]);
  });
  act(() => {
    callback!([{ target: el("crm"), isIntersecting: false, boundingClientRect: { top: -50 } }]);
  });
  expect(screen.getByRole("status")).toHaveTextContent("crm");
});

test("disconnects the observer on unmount", () => {
  const { unmount } = render(<Probe />);
  unmount();
  expect(disconnect).toHaveBeenCalled();
});
