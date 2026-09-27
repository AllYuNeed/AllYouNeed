import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

afterEach(cleanup);

// next/navigation needs an App Router context; stub what components use.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// next/font/google cannot run in jsdom; return stable class/variable names.
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-jakarta", className: "font-jakarta" }),
}));

// lenis touches window APIs jsdom lacks; render children only.
vi.mock("lenis/react", () => ({
  ReactLenis: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useLenis: () => null,
}));

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", { writable: true, value: RO });

// matchMedia: reduced motion off, hover available, by default.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();
